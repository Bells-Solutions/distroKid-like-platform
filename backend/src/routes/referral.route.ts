// src/routes/referral.routes.ts

import { Router, Request, Response } from 'express';
import { PrismaClient, TransactionType } from '@prisma/client';
import { checkJwt } from '../middleware/auth';
import { isAdmin } from '../middleware/checkAdmin';

const router = Router();
const prisma = new PrismaClient();

// 🟢 Create a Referral (User Signs Up with a Referral Code)
router.post(
  '/',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { referredUserId, referrerId } = req.body;

      if (referredUserId === referrerId) {
        res.status(400).json({ error: 'You cannot refer yourself.' });
        return;
      }

      // Check if referral already exists
      const existingReferral = await prisma.referral.findFirst({
        where: { referredId: referredUserId },
      });

      if (existingReferral) {
        res.status(400).json({ error: 'User is already referred.' });
        return;
      }

      // Create referral link
      const referral = await prisma.referral.create({
        data: { referrerId, referredId: referredUserId },
      });

      res.status(201).json(referral);
    } catch (error) {
      console.error('Error creating referral:', error);
      res.status(400).json({ error: 'Failed to create referral.' });
    }
  }
);

// 🔵 Get All Referrals for a User
router.get('/user/:userId', checkJwt, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: { referred: true },
    });

    res.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🟠 Reward Referrer (On Eligible Transaction)
router.post(
  '/reward',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, amount, type } = req.body;

      // Only reward on DEPOSIT or REVENUE_SHARE
      if (
        ![TransactionType.DEPOSIT, TransactionType.REVENUE_SHARE].includes(type)
      ) {
        res
          .status(400)
          .json({ error: 'Invalid transaction type for referral reward.' });
        return;
      }

      // Find the referrer
      const referral = await prisma.referral.findFirst({
        where: { referredId: userId },
        include: { referrer: true },
      });

      if (!referral) {
        res.status(404).json({ error: 'No referrer found.' });
        return;
      }

      const rewardAmount = amount * 0.1; // 10% reward

      // Create reward transaction
      await prisma.transaction.create({
        data: {
          userId: referral.referrerId,
          amount: rewardAmount,
          type: TransactionType.REVENUE_SHARE,
        },
      });

      res
        .status(200)
        .json({ message: 'Referral reward granted.', rewardAmount });
    } catch (error) {
      console.error('Error processing referral reward:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 🔴 Admin: Get All Referrals
router.get(
  '/',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!isAdmin) {
        res.status(403).json({ error: 'Admin access required.' });
        return;
      }

      const referrals = await prisma.referral.findMany({
        include: { referrer: true, referred: true },
      });

      res.json(referrals);
    } catch (error) {
      console.error('Error fetching all referrals:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
