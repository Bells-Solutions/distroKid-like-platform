// Withdrawal Routes Implementation
import { Request, Response, NextFunction } from 'express';
import { PrismaClient, SubscriptionType } from '@prisma/client';
import { getUserFromToken } from '../utils/getUserFromToken';

const prisma = new PrismaClient();

// Middleware to check active subscription
/**
 * Function to check subscription of the user
 */
export const checkSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await getUserFromToken(req);

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (
      !activeSubscription ||
      activeSubscription.type === SubscriptionType.FREE
    ) {
      res.status(403).json({
        error: 'Active paid subscription required to access this feature',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
