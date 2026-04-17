import { generateLorPdfBuffer } from '../../services/lor/lor.pdf.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { created, ok } from '../../utils/apiResponse.js';
import {
  adminCancelLorRequest,
  adminDeleteLorRequest,
  adminReassignLorRequest,
  createStudentLorRequest,
  facultyEditLorRequestContent,
  getApprovedFacultyList,
  getFacultyLorRequestForPdf,
  getStudentLorRequestForPdf,
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

export const facultyEditLorRequestContentController = asyncHandler(async (req, res) => {
  const result = await facultyEditLorRequestContent(req.user.id, req.params.requestId, req.validated.body);
  return ok(res, result, 'Request content updated');
});

export const updateFacultyLorRequestStatusController = asyncHandler(async (req, res) => {
  const result = await updateFacultyLorRequestStatus(req.user.id, req.params.requestId, req.validated.body);
  return ok(res, result, 'Request status updated');
});

export const previewFacultyLorLetterController = asyncHandler(async (req, res) => {
  const request = await getFacultyLorRequestForPdf(req.user.id, req.params.requestId);
  const pdfBuffer = await generateLorPdfBuffer(request);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="lor-${request._id}.pdf"`);
  res.send(pdfBuffer);
});

export const downloadStudentLorLetterController = asyncHandler(async (req, res) => {
  const { request, verificationToken } = await getStudentLorRequestForPdf(req.user.id, req.params.requestId);
  const pdfBuffer = await generateLorPdfBuffer(request, verificationToken);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="lor-${request._id}.pdf"`);
  res.send(pdfBuffer);
});

export const adminCancelLorRequestController = asyncHandler(async (req, res) => {
  const result = await adminCancelLorRequest(req.params.requestId);
  return ok(res, result, 'LOR request cancelled');
});

export const adminReassignLorRequestController = asyncHandler(async (req, res) => {
  const result = await adminReassignLorRequest(req.params.requestId, req.body.facultyId);
  return ok(res, result, 'LOR request reassigned');
});

export const adminDeleteLorRequestController = asyncHandler(async (req, res) => {
  const result = await adminDeleteLorRequest(req.params.requestId);
  return ok(res, result, 'LOR request deleted');
});
