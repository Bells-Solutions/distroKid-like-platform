// src/services/revenueService.ts

import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

const REFERRAL_SHARE_PERCENTAGE = 0.1; // 10%

// Share revenue with a referrer
export const revenueSharing = async (userId: string, amount: number) => {
  try {
    if (amount <= 0) return; // No sharing for zero or negative amounts

    // 1. Find the referrer (skip if self-referred)
    const referral = await prisma.referral.findFirst({
      where: {
        referredId: userId,
        referrerId: { not: userId },
      },
      include: { referrer: true },
    });

    if (!referral) return;

    const referrerId = referral.referrerId;
    const shareAmount = amount * REFERRAL_SHARE_PERCENTAGE;

    // 2. Create a revenue share transaction for the referrer
    await prisma.transaction.create({
      data: {
        userId: referrerId,
        amount: shareAmount,
        type: TransactionType.REVENUE_SHARE,
      },
    });

    // 3. Update the referrer's total earnings
    await prisma.userStats.update({
      where: { userId: referrerId },
      data: { earnings: { increment: shareAmount } },
    });

    console.log(`Shared $${shareAmount.toFixed(2)} with user ${referrerId}`);
  } catch (error) {
    console.error('Error sharing revenue:', error);
  }
};
