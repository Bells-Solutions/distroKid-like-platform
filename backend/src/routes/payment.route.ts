// src/routes/payment.routes.ts

import { Router, Request, Response } from 'express';
import { checkJwt } from '../middleware/auth';
import { getUserFromToken } from '../utils/getUserFromToken';
import { stripe } from '../utils/stripe';

const router = Router();

// 🎯 Create One-Time Payment Intent
router.post(
  '/create-payment-intent',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await getUserFromToken(req);
      const { amount, currency = 'usd' } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({ error: 'Amount must be greater than 0.' });
        return;
      }

      if (typeof amount !== 'number') {
        res.status(400).json({ error: 'Amount must be a valid number.' });
        return;
      }
      // Create Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: { userId: user.id },
      });

      res.status(201).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      if (error instanceof stripe.errors.StripeError) {
        console.error('Stripe API Error:', error.message);
      } else {
        console.error('Internal Server Error:', error);
      }
      console.error('Error creating payment intent:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

// ✅ Confirm Payment (if needed for manual capture)
router.post(
  '/confirm-payment',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        res.status(400).json({ error: 'PaymentIntent ID is required.' });
        return;
      }

      const paymentIntent =
        await stripe.paymentIntents.confirm(paymentIntentId);

      res.json({ message: 'Payment confirmed.', paymentIntent });
    } catch (error) {
      if (error instanceof stripe.errors.StripeError) {
        console.error('Stripe API Error:', error.message);
      } else {
        console.error('Internal Server Error:', error);
      }
      console.error('Error creating payment intent:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

export default router;
