// src/routes/stripe.routes.ts
import { Router, Request, Response } from 'express';
import { stripe } from '../utils/stripe';
import { PrismaClient, SubscriptionType } from '@prisma/client';
import { checkJwt } from '../middleware/auth';
import { getUserFromToken } from '../utils/getUserFromToken';
import bodyParser from 'body-parser';

const router = Router();
const prisma = new PrismaClient();

// 🟢 Create Stripe Checkout Session (Recurring Payment)
router.post(
  '/create-checkout-session',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await getUserFromToken(req);
      const { priceId } = req.body; // Stripe Price ID for subscription

      // Check if the user already has an active subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId: user.id, expiresAt: { gte: new Date() } },
      });

      if (existingSubscription) {
        res
          .status(400)
          .json({ error: 'You already have an active subscription.' });
        return;
      }

      if (!priceId) {
        res.status(400).json({ error: 'Price ID is required' });
        return;
      }

      // Create a checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: user.email, // Automatically links session to user
        line_items: [
          {
            price: priceId, // From Stripe Dashboard
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/success`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        metadata: { userId: user.id },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 🔵 Handle Stripe Webhooks
router.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as any;

          // Extract userId from metadata
          const userId = subscription.metadata.userId;
          const stripeSubscriptionId = subscription.id;
          //   const status = subscription.status;

          if (!userId || !stripeSubscriptionId) {
            console.error('Missing userId or stripeSubscriptionId in webhook.');
            res.status(400).json({ error: 'Invalid subscription data.' });
            return;
          }

          // Map to SubscriptionType
          const planType = subscription.items.data[0].price.id;
          const subscriptionType = mapPriceIdToType(planType);

          if (userId) {
            await prisma.subscription.upsert({
              where: { id: userId },
              update: {
                stripeSubscriptionId,
                type: subscriptionType,
                expiresAt: new Date(subscription.current_period_end * 1000),
              },
              create: {
                user: { connect: { id: userId } },
                stripeSubscriptionId,
                type: subscriptionType,
                expiresAt: new Date(subscription.current_period_end * 1000),
                price: subscription.items.data[0].price.unit_amount,
              },
            });
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as any;
          const userId = subscription.metadata.userId;

          if (userId) {
            await prisma.subscription.deleteMany({ where: { userId } });
          }
          break;
        }
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook Error: ${error}`);
    }
  }
);

// 🟠 Cancel Subscription
router.post(
  '/cancel-subscription',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await getUserFromToken(req);

      // Find the user's active subscription
      const subscription = await prisma.subscription.findUnique({
        where: { id: user.id },
      });

      if (!subscription) {
        res.status(404).json({ error: 'No active subscription found.' });
        return;
      }

      // Cancel subscription on Stripe
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

      // Remove subscription from database
      await prisma.subscription.delete({ where: { id: subscription.id } });

      res.json({ message: 'Subscription canceled successfully.' });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

// 🔄 Upgrade/Downgrade Subscription
router.post(
  '/update-subscription',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await getUserFromToken(req);
      const { newPriceId } = req.body;

      if (!newPriceId) {
        res.status(400).json({ error: 'New price ID is required.' });
        return;
      }

      // Find the user's active subscription
      const subscription = await prisma.subscription.findUnique({
        where: { id: user.id },
      });

      if (!subscription) {
        res.status(404).json({ error: 'No active subscription found.' });
        return;
      }

      // Get the current subscription from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      // Update the subscription
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [{ id: stripeSubscription.items.data[0].id, price: newPriceId }],
      });

      res.json({ message: 'Subscription updated successfully.' });
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

// 🛠️ Utility: Map Stripe Price ID to SubscriptionType
type PriceMapping = Record<string, SubscriptionType>;

const priceMapping: PriceMapping = {
  [process.env.STRIPE_FREE_PLAN_ID as string]: SubscriptionType.FREE,
  [process.env.STRIPE_PREMIUM_PLAN_ID as string]: SubscriptionType.PREMIUM,
  [process.env.STRIPE_BUSINESS_PLAN_ID as string]: SubscriptionType.BUSINESS,
};

const mapPriceIdToType = (priceId: string): SubscriptionType => {
  if (!priceMapping[priceId]) {
    console.error('Unknown Stripe price ID:', priceId);
    throw new Error('Invalid subscription type.');
  }
  return priceMapping[priceId];
};

export default router;
