import { PrismaClient, SubscriptionType } from '@prisma/client';
import { sendEmail } from '../utils/sendEmail'; // Assuming you have an email utility

const prisma = new PrismaClient();

// Subscription Expiration Check with Reminders and Grace Period
export const checkSubscriptionExpiration = async () => {
  try {
    const now = new Date();

    // Send reminders for subscriptions expiring in 7 days
    const reminderThreshold = new Date();
    reminderThreshold.setDate(now.getDate() + 7);

    const expiringSoon = await prisma.subscription.findMany({
      where: {
        expiresAt: {
          gte: now,
          lte: reminderThreshold,
        },
      },
      include: { user: true },
    });

    for (const sub of expiringSoon) {
      await sendEmail({
        to: sub.user.email,
        subject: 'Your Subscription is Expiring Soon',
        body: `Hello ${sub.user.email}, your subscription will expire on ${sub.expiresAt.toDateString()}. Renew now to avoid disruption.`,
      });
    }

    // Handle expired subscriptions (after grace period)
    const gracePeriod = new Date();
    gracePeriod.setDate(now.getDate() - 3); // 3-day grace period

    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        expiresAt: {
          lt: gracePeriod,
        },
      },
    });

    for (const sub of expiredSubscriptions) {
      await prisma.subscription.delete({
        where: { id: sub.id },
      });

      // Revert user to FREE subscription
      await prisma.subscription.create({
        data: {
          userId: sub.userId,
          type: SubscriptionType.FREE,
          price: 0,
          expiresAt: new Date('2099-12-31'), // Permanent FREE tier
        },
      });
    }

    console.log(
      'Subscription reminders sent and expired subscriptions cleaned up.'
    );
  } catch (error) {
    console.error('Error handling subscription expiration:', error);
  }
};
