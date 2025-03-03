import { Router } from 'express';
import { checkJwt } from '../middleware/auth';
import { getUserFromToken } from '../utils/getUserFromToken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/dashboard', checkJwt, async (req, res) => {
  try {
    const user = await getUserFromToken(req);

    const userStats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    });
    const referrals = await prisma.referral.count({
      where: { referrerId: user.id },
    });
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      balance: userStats?.earnings || 0,
      referrals,
      withdrawals,
      subscription,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
