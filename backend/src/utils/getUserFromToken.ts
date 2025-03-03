// src/utils/getUserFromToken.ts

import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role, User } from '@prisma/client';
import jwksClient from 'jwks-rsa';

const prisma = new PrismaClient();

interface JwtPayload {
  sub: string; // Auth0 user ID
  email: string;
  role?: Role;
}

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

const getKey = (header: any, callback: any) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
};

/**
 * Extracts the user from the token
 * @returns {Promise<User>} The user object
 */
export const getUserFromToken = async (req: Request): Promise<User> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new Error('Token not provided');
    }

    const decoded = await new Promise<JwtPayload>((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          audience: process.env.AUTH0_AUDIENCE,
          issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        },
        (err, payload) => {
          if (err || !payload) return reject('Invalid token');
          resolve(payload as JwtPayload);
        }
      );
    });

    // Retrieve the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('Error extracting user from token:', error);
    throw new Error('Unauthorized: Invalid token');
  }
};
