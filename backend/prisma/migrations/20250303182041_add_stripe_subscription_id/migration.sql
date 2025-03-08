-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "stripeSubscriptionId" TEXT NOT NULL DEFAULT 'price_1LQJvqJ7w5h0nL9gq2Xw1X1Q',
ALTER COLUMN "type" SET DEFAULT 'FREE';
