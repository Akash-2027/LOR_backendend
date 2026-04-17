import asyncHandler from '../../utils/asyncHandler.js';
import { ok } from '../../utils/apiResponse.js';
import { requestPasswordReset, resetPasswordWithToken } from '../../services/auth/password.reset.service.js';

export const forgotPasswordController = asyncHandler(async (req, res) => {
  const result = await requestPasswordReset(req.validated.body);
  return ok(res, result, 'If the email exists, a reset link has been sent');
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  const result = await resetPasswordWithToken(req.validated.body);
  return ok(res, result, 'Password reset successful');
});
