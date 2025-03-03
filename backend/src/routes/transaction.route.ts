// src/routes/transaction.routes.ts (TypeScript + JWT)

import { Router, Request, Response } from 'express';
import { PrismaClient, TransactionType, Role } from '@prisma/client';
import { checkJwt } from '../middleware/auth';
import { getUserFromToken } from '../utils/getUserFromToken';
import { revenueSharing } from '../services/revenueSharing.service';

const router = Router();
const prisma = new PrismaClient();

// 🔵 Get All Transactions (Admin only)
router.get(
  '/',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await getUserFromToken(req);

      if (user.role !== Role.ADMIN) {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
      }

      const transactions = await prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
      });

      res.json(transactions);
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: (error as Error).message,
      });
    }
  }
);

// 🟢 Create a New Transaction
// router.post(
//   '/',
//   checkJwt,
//   async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { userId, amount, type } = req.body;

//       if (!Object.values(TransactionType).includes(type)) {
//         res.status(400).json({ error: 'Invalid transaction type' });
//         return;
//       }

//       const newTransaction = await prisma.transaction.create({
//         data: { userId, amount, type },
//       });

//       res.status(201).json(newTransaction);
//     } catch (error) {
//       console.error('Error creating transaction:', error);
//       res.status(400).json({
//         error: 'Error creating transaction',
//         details: (error as Error).message,
//       });
//     }
//   }
// );

router.post(
  '/',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, amount, type, source } = req.body;

      if (!Object.values(TransactionType).includes(type)) {
        res.status(400).json({ error: 'Invalid transaction type' });
        return;
      }

      // Ensure amount is positive for valid revenue share
      if (amount <= 0) {
        res.status(400).json({ error: 'Amount must be greater than zero' });
        return;
      }

      const newTransaction = await prisma.transaction.create({
        data: { userId, amount, type, source },
      });

      // Trigger revenue sharing only for eligible transaction types
      if (type === TransactionType.DEPOSIT || type === TransactionType.FEE) {
        await revenueSharing(userId, amount);
      }

      res.status(201).json(newTransaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(400).json({
        error: 'Error creating transaction',
        details: (error as Error).message,
      });
    }
  }
);

// 🔵 Get Transaction by ID
router.get(
  '/:id',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: req.params.id },
        include: { user: true },
      });

      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      res.json(transaction);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: (error as Error).message,
      });
    }
  }
);

// 🔍 List All Transactions for a User (with optional type filter)
router.get('/user/:userId', checkJwt, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type:
          type &&
          Object.values(TransactionType).includes(type as TransactionType)
            ? (type as TransactionType)
            : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: (error as Error).message,
    });
  }
});

// 🔴 Delete Transaction (Admin only + track who deletes)
router.delete(
  '/:id',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await getUserFromToken(req);

      if (user.role !== Role.ADMIN) {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
      }

      const transaction = await prisma.transaction.delete({
        where: { id: req.params.id },
      });

      console.log(
        `Transaction ${transaction.id} deleted by user ${user.id} (${user.email})`
      );

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(400).json({
        error: 'Error deleting transaction',
        details: (error as Error).message,
      });
    }
  }
);

export default router;
