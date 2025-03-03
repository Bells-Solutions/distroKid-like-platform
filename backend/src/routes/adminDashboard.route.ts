// src/routes/adminDashboard.routes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { checkJwt } from '../middleware/auth';
import { checkAdmin } from '../middleware/checkAdmin';

const router = Router();
const prisma = new PrismaClient();

// 📊 Admin Dashboard Data
router.get('/', checkJwt, checkAdmin, async (req, res) => {
  try {
    // Total Users
    const totalUsers = await prisma.user.count();

    // Total Revenue (Sum of all purchases)
    const totalRevenue = await prisma.transaction.aggregate({
      where: { type: 'PURCHASE' },
      _sum: { amount: true },
    });

    // Total Withdrawals (Completed and Pending)
    const totalWithdrawals = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
    });

    // Pending Withdrawal Requests
    const pendingWithdrawals = await prisma.withdrawal.count({
      where: { status: 'PENDING' },
    });

    // Subscription Breakdown
    const subscriptionCounts = await prisma.subscription.groupBy({
      by: ['type'],
      _count: true,
    });

    res.json({
      totalUsers,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalWithdrawals: totalWithdrawals._sum.amount || 0,
      pendingWithdrawals,
      subscriptionCounts,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
