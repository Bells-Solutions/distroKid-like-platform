import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password: 'auth0_managed', // Placeholder for Auth0 users
      role: 'USER',
      referralCode: 'REF123',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      password: 'auth0_managed',
      role: 'USER',
      referredById: user1.id,
      referralCode: 'REF456',
    },
  });

  // Create Referrals
  await prisma.referral.create({
    data: {
      referrerId: user1.id,
      referredId: user2.id,
    },
  });

  // Create Subscriptions
  await prisma.subscription.create({
    data: {
      type: 'PREMIUM',
      price: 30.0,
      userId: user2.id,
      expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
  });

  // Create Transactions
  await prisma.transaction.create({
    data: {
      userId: user2.id,
      amount: 30.0,
      type: 'DEPOSIT',
      source: 'SALE',
    },
  });

  // Create UserStats
  await prisma.userStats.create({
    data: {
      userId: user1.id,
      earnings: 10.0,
      referrals: 1,
    },
  });

  // Create Withdrawal
  await prisma.withdrawal.create({
    data: {
      userId: user2.id,
      amount: 25.0,
      method: 'PAYPAL',
      status: 'PENDING',
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
