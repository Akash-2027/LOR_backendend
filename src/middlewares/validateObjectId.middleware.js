import mongoose from 'mongoose';
import { fail } from '../utils/apiResponse.js';

const validateObjectId = (...paramNames) => (req, res, next) => {
  for (const param of paramNames) {
    if (!mongoose.isValidObjectId(req.params[param])) {
      return fail(res, 400, `Invalid ${param} format`);
    }
  }
  return next();
};

export default validateObjectId;
