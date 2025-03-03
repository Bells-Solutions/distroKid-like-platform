import { Router } from 'express';
import { PrismaClient, TransactionType } from '@prisma/client';
import { checkJwt } from '../middleware/auth';
import { getUserFromToken } from '../utils/getUserFromToken';
import { revenueSharing } from '../services/revenueSharing.service';

const router = Router();
const prisma = new PrismaClient();

// Purchase Subscription
router.post('/', checkJwt, async (req, res): Promise<void> => {
  try {
    const user = await getUserFromToken(req);

    const { subscriptionType, amount } = req.body;

    if (!subscriptionType || amount <= 0) {
      res.status(400).json({ error: 'Invalid subscription or amount' });
      return;
    }

    // Record the purchase
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        type: TransactionType.PURCHASE,
      },
    });

    // Share revenue if applicable
    await revenueSharing(user.id, amount);

    res.status(201).json({ message: 'Purchase successful' });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
