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
import { checkJwt } from './middleware/auth';
import { getUserFromToken } from './utils/getUserFromToken';
// import { getUserFromToken } from './utils/getUserFromToken';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/profile', checkJwt, async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// add a protected route for testing
app.get(
  '/protected',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('JWT Verified');
      const user = await getUserFromToken(req);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ message: 'Welcome, Johan Bell', user });
    } catch (error) {
      console.error('Error fetching user in /protected:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

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
