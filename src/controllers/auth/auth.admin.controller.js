import asyncHandler from '../../utils/asyncHandler.js';
import { ok } from '../../utils/apiResponse.js';
import { loginAdmin } from '../../services/auth/auth.admin.service.js';

export const loginAdminController = asyncHandler(async (req, res) => {
  const result = await loginAdmin(req.validated.body);
  return ok(res, result, 'Admin login success');
});
