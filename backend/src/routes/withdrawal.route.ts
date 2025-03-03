// Withdrawal Routes Implementation
import { Router, Request, Response } from 'express';
import {
  PrismaClient,
  WithdrawalStatus,
  WithdrawalMethod,
  TransactionType,
} from '@prisma/client';
import { checkJwt } from '../middleware/auth';
import { getUserFromToken } from '../utils/getUserFromToken';
import { checkSubscription } from '../middleware/checkSubscription';
import { checkSubscriptionExpiration } from '../middleware/checkSubscriptionExpiration';

const router = Router();
const prisma = new PrismaClient();

const MIN_WITHDRAWAL_AMOUNT = 10;
const WITHDRAWAL_FEE_PERCENTAGE = 2;
const OWNER_ID = process.env.OWNER_ID || '';

// Run expiration check periodically
setInterval(checkSubscriptionExpiration, 1000 * 60 * 60); // Every hour

// 💵 Request a Withdrawal
router.post(
  '/withdraw',
  checkJwt,
  checkSubscription,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await getUserFromToken(req);
      const { amount, method } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({ error: 'Invalid amount' });
        return;
      }
      if (!Object.values(WithdrawalMethod).includes(method)) {
        res.status(400).json({ error: 'Invalid withdrawal method' });
        return;
      }

      // Check minimum withdrawal amount
      if (amount < MIN_WITHDRAWAL_AMOUNT) {
        res.status(400).json({
          error: `Minimum withdrawal amount is $${MIN_WITHDRAWAL_AMOUNT}`,
        });
        return;
      }

      // Apply withdrawal fee
      const fee = (amount * WITHDRAWAL_FEE_PERCENTAGE) / 100;
      const finalAmount = amount - fee;

      // Check user balance
      const userStats = await prisma.userStats.findUnique({
        where: { userId: user.id },
      });
      if (!userStats || userStats.earnings < amount) {
        res.status(400).json({ error: 'Insufficient balance' });
        return;
      }

      // Create withdrawal request
      await prisma.withdrawal.create({
        data: {
          userId: user.id,
          amount: finalAmount,
          method,
          status: WithdrawalStatus.PENDING,
        },
      });

      // Deduct earnings
      await prisma.userStats.update({
        where: { userId: user.id },
        data: { earnings: { decrement: amount } },
      });

      // Record fee to owner account
      if (OWNER_ID) {
        await prisma.transaction.create({
          data: {
            userId: OWNER_ID,
            amount: fee,
            type: TransactionType.FEE,
          },
        });
      }

      res
        .status(201)
        .json({ message: 'Withdrawal request submitted', fee, finalAmount });
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 📊 Get User Withdrawal History
router.get('/withdrawals', checkJwt, async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req);

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ withdrawals });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🛠 Admin Approve/Reject Withdrawal
router.patch(
  '/withdraw/:id',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (
        ![WithdrawalStatus.COMPLETED, WithdrawalStatus.FAILED].includes(status)
      ) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
      if (!withdrawal) {
        res.status(404).json({ error: 'Withdrawal not found' });
        return;
      }

      // If rejected, refund amount
      if (status === WithdrawalStatus.FAILED) {
        await prisma.userStats.update({
          where: { userId: withdrawal.userId },
          data: { earnings: { increment: withdrawal.amount } },
        });
      }

      // Update status
      await prisma.withdrawal.update({ where: { id }, data: { status } });

      res.json({ message: 'Withdrawal status updated' });
    } catch (error) {
      console.error('Error updating withdrawal:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
