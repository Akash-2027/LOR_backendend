import asyncHandler from '../../utils/asyncHandler.js';
import { created, ok } from '../../utils/apiResponse.js';
import { registerStudent, loginStudent } from '../../services/auth/auth.user.service.js';

export const registerStudentController = asyncHandler(async (req, res) => {
  const result = await registerStudent(req.validated.body);
  return created(res, result, 'Student registered');
});

export const loginStudentController = asyncHandler(async (req, res) => {
  const result = await loginStudent(req.validated.body);
  return ok(res, result, 'Student login success');
});
