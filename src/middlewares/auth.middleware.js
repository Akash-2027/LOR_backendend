import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { fail } from '../utils/apiResponse.js';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return fail(res, 401, 'Authentication required');
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    return next();
  } catch (error) {
    return fail(res, 401, 'Invalid or expired token');
  }
};

export default authMiddleware;
