import { fail } from '../utils/apiResponse.js';

const roleMiddleware = (...roles) => (req, res, next) => {
  const role = req.user?.role;
  if (!role || !roles.includes(role)) {
    return fail(res, 403, 'Not allowed for this role');
  }
  return next();
};

export default roleMiddleware;
