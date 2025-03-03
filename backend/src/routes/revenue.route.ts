// src/routes/revenue.routes.ts

import { Router, Request, Response } from 'express';
import { PrismaClient, TransactionType } from '@prisma/client';
import { checkJwt } from '../middleware/auth';
import { getUserFromToken } from '../utils/getUserFromToken';

const router = Router();
const prisma = new PrismaClient();

// 💸 Share Revenue (10% of transaction goes to referrer)
router.post(
  '/share',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await getUserFromToken(req);
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({ error: 'Invalid amount' });
        return;
      }

      // Get the referrer
      const referral = await prisma.referral.findFirst({
        where: { referredId: user.id },
        include: { referrer: true },
      });

      if (!referral) {
        res.status(400).json({ error: 'No referrer found' });
        return;
      }

      const shareAmount = amount * 0.1; // 10% Share

      // Create a revenue share transaction
      await prisma.transaction.create({
        data: {
          userId: referral.referrerId,
          amount: shareAmount,
          type: TransactionType.REVENUE_SHARE,
        },
      });

      // Update referrer's earnings
      await prisma.userStats.update({
        where: { userId: referral.referrerId },
        data: { earnings: { increment: shareAmount } },
      });

      res.status(201).json({ message: 'Revenue shared successfully' });
    } catch (error) {
      console.error('Error sharing revenue:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 🎁 Reward Referrer ($5 bonus on new user signup)
router.post(
  '/reward',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await getUserFromToken(req);

      // Find who referred this user
      const referral = await prisma.referral.findFirst({
        where: { referredId: user.id },
        include: { referrer: true },
      });

      if (!referral) {
        res.status(400).json({ error: 'No referrer found' });
        return;
      }

      const rewardAmount = 5; // $5 bonus

      // Create a reward transaction
      await prisma.transaction.create({
        data: {
          userId: referral.referrerId,
          amount: rewardAmount,
          type: TransactionType.REVENUE_SHARE,
        },
      });

      // Update referrer's earnings and referral count
      await prisma.userStats.update({
        where: { userId: referral.referrerId },
        data: {
          earnings: { increment: rewardAmount },
          referrals: { increment: 1 },
        },
      });

      res.status(201).json({ message: 'Referrer rewarded successfully' });
    } catch (error) {
      console.error('Error rewarding referrer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
