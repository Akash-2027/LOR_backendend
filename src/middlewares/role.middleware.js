import { fail } from '../utils/apiResponse.js';
import LorRequest from '../models/lor.request.model.js';

const roleMiddleware = (...roles) => (req, res, next) => {
  const role = req.user?.role;
  if (!role || !roles.includes(role)) {
    return fail(res, 403, 'Not allowed for this role');
  }
  return next();
};

// Ownership middleware: verifies student owns a LOR request
export const verifyLorRequestOwnership = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const lorRequest = await LorRequest.findById(requestId);
    if (!lorRequest) {
      return fail(res, 404, 'LOR request not found');
    }

    // Student can only access their own requests
    if (userRole === 'student' && lorRequest.studentId.toString() !== userId) {
      return fail(res, 403, 'Not allowed to access this LOR request');
    }

    // Faculty can only access requests assigned to them
    if (userRole === 'faculty' && lorRequest.facultyId.toString() !== userId) {
      return fail(res, 403, 'Not allowed to access this LOR request');
    }

    req.lorRequest = lorRequest;
    next();
  } catch (error) {
    return next(error);
  }
};

export default roleMiddleware;
