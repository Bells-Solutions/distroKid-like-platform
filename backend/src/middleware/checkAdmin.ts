// checkAdmin Middleware
import { Request, Response, NextFunction } from 'express';
import { getUserFromToken } from '../utils/getUserFromToken';
import { Role } from '@prisma/client';

export let isAdmin: boolean = false;
export const checkAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (user.role !== Role.ADMIN) {
      isAdmin = true;
      res.status(403).json({ error: 'Access denied. Admins only.' });
      return;
    }

    next(); // Proceed if user is admin
  } catch (error) {
    console.error('Error in checkAdmin middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};
