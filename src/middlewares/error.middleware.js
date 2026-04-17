import logger from '../utils/logger.js';
import env from '../config/env.js';
import { fail } from '../utils/apiResponse.js';

// Map of known safe user-facing messages by status code
const STATUS_MESSAGES = {
  400: 'Bad request',
  401: 'Authentication required',
  403: 'Access denied',
  404: 'Resource not found',
  409: 'Conflict — resource already exists',
  422: 'Validation failed',
  429: 'Too many requests'
};

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;

  // Always log the full error server-side
  logger.error({ err, method: req.method, url: req.originalUrl, status }, 'Request error');

  // In production, hide internal error details for 5xx
  const isServerError = status >= 500;
  const message = isServerError && env.isProd
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || STATUS_MESSAGES[status] || 'Server error';

  return fail(res, status, message);
};

export default errorMiddleware;
