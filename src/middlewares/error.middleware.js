import { fail } from '../utils/apiResponse.js';

const errorMiddleware = (err, req, res, next) => {
  console.error('[error]', err.message);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || err.statusCode || 500;
  return fail(res, status, err.message || 'Server error');
};

export default errorMiddleware;
