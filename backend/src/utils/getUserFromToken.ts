import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role, User } from '@prisma/client';
import jwksClient from 'jwks-rsa';

const prisma = new PrismaClient();

interface JwtPayload {
  sub: string; // Auth0 user ID
  custom_email_claim?: string; // Custom email field
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
    if (!token) throw new Error('Token not provided');

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

    console.log('Decoded JWT Payload:', decoded);

    // Validate essential fields
    if (!decoded.sub || !decoded.custom_email_claim) {
      throw new Error('Missing required fields in JWT');
    }

    // Find or create user using upsert
    const user = await prisma.user.upsert({
      where: { id: decoded.sub },
      update: {}, // If the user exists, no fields are updated for now.
      create: {
        id: decoded.sub,
        email: decoded.custom_email_claim,
        role: Role.USER,
        password: 'defaultPassword', // Consider handling this securely later
      },
    });

    console.log('User found or created:', user);
    return user;
  } catch (error) {
    console.error('Error extracting user from token:', error);
    throw new Error('Unauthorized: Invalid token');
  }
};
