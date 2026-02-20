import asyncHandler from '../../utils/asyncHandler.js';
import { created, ok } from '../../utils/apiResponse.js';
import { registerFacultyRequest, loginFaculty, approveFaculty } from '../../services/auth/auth.faculty.service.js';

export const registerFacultyController = asyncHandler(async (req, res) => {
  const result = await registerFacultyRequest(req.validated.body);
  return created(res, result, 'Faculty request submitted');
});

export const loginFacultyController = asyncHandler(async (req, res) => {
  const result = await loginFaculty(req.validated.body);
  return ok(res, result, 'Faculty login success');
});

export const approveFacultyController = asyncHandler(async (req, res) => {
  const faculty = await approveFaculty({ facultyId: req.params.facultyId, adminId: req.user.id });
  return ok(res, faculty, 'Faculty approved');
});
