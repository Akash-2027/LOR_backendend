import asyncHandler from '../../utils/asyncHandler.js';
import { ok } from '../../utils/apiResponse.js';
import {
  adminUpdateFacultyProfile,
  deleteFaculty,
  listAdminFaculties,
  listAdminLorRequests,
  listAdminStudents,
  loginAdmin,
  rejectFaculty,
  toggleFacultyActive
} from '../../services/auth/auth.admin.service.js';

export const loginAdminController = asyncHandler(async (req, res) => {
  const result = await loginAdmin(req.validated.body);
  return ok(res, result, 'Admin login success');
});

export const listAdminStudentsController = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const result = await listAdminStudents({ page, limit });
  return ok(res, result, 'Students fetched');
});

export const listAdminFacultiesController = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const result = await listAdminFaculties({ page, limit });
  return ok(res, result, 'Faculties fetched');
});

export const listAdminLorRequestsController = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const result = await listAdminLorRequests({ page, limit });
  return ok(res, result, 'LOR requests fetched');
});

export const rejectFacultyController = asyncHandler(async (req, res) => {
  const result = await rejectFaculty(req.params.facultyId);
  return ok(res, result, 'Faculty rejected');
});

export const toggleFacultyActiveController = asyncHandler(async (req, res) => {
  const result = await toggleFacultyActive(req.params.facultyId);
  return ok(res, result, `Faculty ${result.isActive ? 'activated' : 'deactivated'}`);
});

export const deleteFacultyController = asyncHandler(async (req, res) => {
  const result = await deleteFaculty(req.params.facultyId);
  return ok(res, result, 'Faculty deleted');
});

export const adminUpdateFacultyProfileController = asyncHandler(async (req, res) => {
  const result = await adminUpdateFacultyProfile(req.params.facultyId, req.validated.body);
  return ok(res, result, 'Faculty profile updated');
});
