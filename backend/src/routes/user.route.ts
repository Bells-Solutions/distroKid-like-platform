// Updated src/routes/user.routes.ts (TypeScript + JWT)

import { Router, Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { checkJwt } from '../middleware/auth';
import { getUserFromToken } from '../utils/getUserFromToken';

const router = Router();
const prisma = new PrismaClient();

// get profile infos
router.get('/profile', checkJwt, async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🟢 Get All Users (Admin only)
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

      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });

      res.json(users);
    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 🟢 Create a New User
router.post('/', checkJwt, async (req: Request, res: Response) => {
  try {
    const { email, password, role = Role.USER } = req.body;

    // check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        role,
        stats: { create: {} }, // Initialize UserStats
      },
      include: { stats: true },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({
      error: 'Error creating user',
      details: (error as Error).message,
    });
  }
});

// 🔵 Get User by ID (with relationships)
router.get(
  '/:id',
  checkJwt,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        include: {
          subscription: true,
          referralsSent: true,
          referralsGot: true,
          stats: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: (error as Error).message,
      });
    }
  }
);

// 🟠 Update User
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { email, password, role },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({
      error: 'Error updating user',
      details: (error as Error).message,
    });
  }
});

// 🔴 Delete User
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(400).json({
      error: 'Error deleting user',
      details: (error as Error).message,
    });
  }
});

export default router;
