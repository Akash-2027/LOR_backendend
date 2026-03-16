import asyncHandler from '../../utils/asyncHandler.js';
import { created, ok } from '../../utils/apiResponse.js';
import {
  createStudentLorRequest,
  getApprovedFacultyList,
  listFacultyLorRequests,
  listStudentLorRequests,
  updateFacultyLorRequestStatus
} from '../../services/lor/lor.request.service.js';

export const getApprovedFacultyController = asyncHandler(async (req, res) => {
  const result = await getApprovedFacultyList();
  return ok(res, result, 'Approved faculty list');
});

export const createStudentLorRequestController = asyncHandler(async (req, res) => {
  const result = await createStudentLorRequest(req.user.id, req.validated.body);
  return created(res, result, 'LOR request submitted');
});

export const listStudentLorRequestsController = asyncHandler(async (req, res) => {
  const result = await listStudentLorRequests(req.user.id);
  return ok(res, result, 'Student requests fetched');
});

export const listFacultyLorRequestsController = asyncHandler(async (req, res) => {
  const result = await listFacultyLorRequests(req.user.id);
  return ok(res, result, 'Faculty requests fetched');
});

export const updateFacultyLorRequestStatusController = asyncHandler(async (req, res) => {
  const result = await updateFacultyLorRequestStatus(req.user.id, req.params.requestId, req.validated.body);
  return ok(res, result, 'Request status updated');
});
