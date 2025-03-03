// Updated src/routes/user.routes.ts (TypeScript + JWT)

import { Router, Request, Response } from 'express';
import { PrismaClient, SubscriptionType } from '@prisma/client';
import { checkJwt } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// 🟢 Create a New Subscription
router.post('/', checkJwt, async (req: Request, res: Response) => {
  try {
    const { userId, type = SubscriptionType.FREE, price, expiresAt } = req.body;

    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        type,
        price,
        expiresAt: type === SubscriptionType.FREE ? null : expiresAt,
      },
    });

    res.status(201).json(newSubscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(400).json({
      error: 'Error creating subscription',
      details: (error as Error).message,
    });
  }
});

// 🔵 Get Subscription by ID
router.get(
  '/:id',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: req.params.id },
        include: { user: true },
      });

      if (!subscription) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
      }

      res.json(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: (error as Error).message,
      });
    }
  }
);

// 🟠 Update Subscription
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
  try {
    const { type, price, expiresAt } = req.body;

    const updatedSubscription = await prisma.subscription.update({
      where: { id: req.params.id },
      data: { type, price, expiresAt },
    });

    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(400).json({
      error: 'Error updating subscription',
      details: (error as Error).message,
    });
  }
});

// 🔴 Delete Subscription
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  try {
    await prisma.subscription.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(400).json({
      error: 'Error deleting subscription',
      details: (error as Error).message,
    });
  }
});

// 🟠 Cancel Subscription (Revert to FREE)
router.put('/:id/cancel', checkJwt, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        type: SubscriptionType.FREE,
        price: 0.0,
        expiresAt: undefined, // Free subscriptions never expire
      },
    });

    res.json({
      message: 'Subscription successfully canceled',
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(400).json({
      error: 'Error canceling subscription',
      details: (error as Error).message,
    });
  }
});

export default router;
