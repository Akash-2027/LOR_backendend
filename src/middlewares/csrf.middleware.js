import crypto from 'crypto';
import { fail } from '../utils/apiResponse.js';

// Store CSRF tokens in memory (in production, use Redis or similar)
const csrfTokens = new Map();

// Generate a CSRF token
export const generateCsrfToken = (req, res, next) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const sessionId = req.headers['x-session-id'] || crypto.randomBytes(16).toString('hex');

    csrfTokens.set(sessionId, token);

    res.set('X-CSRF-Token', token);
    res.set('X-Session-ID', sessionId);

    return next();
  } catch (error) {
    return next(error);
  }
};

// Validate CSRF token on state-changing requests
export const validateCsrfToken = (req, res, next) => {
  // Only validate on POST, PATCH, DELETE requests
  if (!['POST', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  try {
    const token = req.headers['x-csrf-token'];
    const sessionId = req.headers['x-session-id'];

    if (!token || !sessionId) {
      return fail(res, 403, 'CSRF token missing');
    }

    const storedToken = csrfTokens.get(sessionId);
    if (!storedToken || storedToken !== token) {
      return fail(res, 403, 'Invalid CSRF token');
    }

    // Rotate token after use
    csrfTokens.delete(sessionId);
    const newToken = crypto.randomBytes(32).toString('hex');
    csrfTokens.set(sessionId, newToken);
    res.set('X-CSRF-Token', newToken);

    return next();
  } catch (error) {
    return next(error);
  }
};

export default { generateCsrfToken, validateCsrfToken };
