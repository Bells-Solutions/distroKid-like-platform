import express, { Request, Response } from 'express';
import cors from 'cors';

import userRoutes from '../src/routes/user.route';
import subscriptionRoutes from '../src/routes/subscription.route';
import transactionRoutes from '../src/routes/transaction.route';
import dashboardRoutes from '../src/routes/dashboard.route';
import withdrawalRoutes from '../src/routes/withdrawal.route';
import referralRoutes from '../src/routes/referral.route';
import revenuRoutes from '../src/routes/revenue.route';
import purchaseRoutes from '../src/routes/purchase.route';
import adminDashboardRoutes from '../src/routes/adminDashboard.route';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('api/transactions', transactionRoutes);
app.use('api/dashboard', dashboardRoutes);
app.use('api/withdrawals', withdrawalRoutes);
app.use('api/referrals', referralRoutes);
app.use('api/revenus', revenuRoutes);
app.use('api/purchase', purchaseRoutes);
app.use('api/admin-dashboard', adminDashboardRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('API Running with Auth0 Authentication');
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server is running on port ${process.env.PORT || 4000}`);
});

export default app;
