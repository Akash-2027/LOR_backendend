import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { fail } from '../utils/apiResponse.js';
import Faculty from '../models/user.faculty.model.js';
import Admin from '../models/user.admin.model.js';
import Student from '../models/user.student.model.js';
import { ROLES } from '../config/constants.js';

const MODEL_MAP = {
  [ROLES.FACULTY]: Faculty,
  [ROLES.ADMIN]: Admin,
  [ROLES.STUDENT]: Student
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return fail(res, 401, 'Authentication required');
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    const Model = MODEL_MAP[decoded.role];
    if (Model) {
      const user = await Model.findById(decoded.id).select('isActive tokenVersion').lean();
      if (!user || user.isActive === false) {
        return fail(res, 401, 'Account is deactivated or no longer exists');
      }
      // Validate token version — if it changed, token is invalidated (user reset password)
      if (decoded.tokenVersion !== (user.tokenVersion || 0)) {
        return fail(res, 401, 'Session invalidated due to password reset');
      }
    }

    req.user = decoded;
    return next();
  } catch (error) {
    return fail(res, 401, 'Invalid or expired token');
  }
};

export default authMiddleware;
