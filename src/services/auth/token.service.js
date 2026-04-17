import jwt from 'jsonwebtoken';
import env from '../../config/env.js';

export const signToken = (payload) => {
  // Include standard JWT claims for better security
  const enrichedPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000), // issued at
    aud: 'lor-portal', // audience
    sub: payload.id // subject (user ID)
  };
  return jwt.sign(enrichedPayload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};
