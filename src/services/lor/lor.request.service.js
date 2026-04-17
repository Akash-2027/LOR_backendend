import Faculty from '../../models/user.faculty.model.js';
import LorRequest from '../../models/lor.request.model.js';
import httpError from '../../utils/httpError.js';
import logger from '../../utils/logger.js';
import { sendFacultyNotificationEmail } from './lor.email.service.js';
import { ensureVerificationToken } from './lor.verification.service.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getApprovedFacultyList = async () => {
  return Faculty.find({ approvalStatus: 'approved' })
    .select('_id name email collegeEmail department subjects')
    .sort({ name: 1 });
};

export const createStudentLorRequest = async (studentId, payload) => {
  const faculty = await Faculty.findById(payload.facultyId);
  if (!faculty) {
    throw httpError(404, 'Selected faculty not found');
  }

  if (faculty.approvalStatus !== 'approved') {
    throw httpError(400, 'Selected faculty is not approved yet');
  }

  const normalizedTargetUniversity = payload.targetUniversity.trim();
  const normalizedProgram = payload.program.trim();

  const existingPending = await LorRequest.findOne({
    studentId,
    facultyId: payload.facultyId,
    status: 'pending',
    targetUniversity: new RegExp(`^${escapeRegex(normalizedTargetUniversity)}$`, 'i'),
    program: new RegExp(`^${escapeRegex(normalizedProgram)}$`, 'i')
  });

  if (existingPending) {
    throw httpError(400, 'You already have a pending request for this faculty, university, and program');
  }

  const request = await LorRequest.create({
    studentId,
    facultyId: payload.facultyId,
    subject: payload.subject,
    purpose: payload.purpose,
    targetUniversity: normalizedTargetUniversity,
    program: normalizedProgram,
    dueDate: payload.dueDate,
    achievements: payload.achievements,
    lorRequirements: payload.lorRequirements,
    documentType: payload.documentType,
    documentName: payload.documentName,
    documentData: payload.documentData,
    status: 'pending'
  });

  // Fire-and-forget — email failure must never block request creation
  sendFacultyNotificationEmail(request).catch((err) =>
    logger.warn({ err, requestId: request._id }, '[lor-email] background notification failed')
  );

  return request;
};

export const listStudentLorRequests = async (studentId) => {
  return LorRequest.find({ studentId })
    .populate('facultyId', 'name email collegeEmail department')
    .select('facultyId purpose targetUniversity program dueDate status facultyRemark documentType documentName createdAt updatedAt')
    .sort({ createdAt: -1 });
};

export const listFacultyLorRequests = async (facultyId) => {
  return LorRequest.find({ facultyId })
    .populate('studentId', 'name email enrollment mobile')
    .select('studentId subject purpose targetUniversity program dueDate status facultyRemark achievements lorRequirements documentType documentName documentData facultyEditedAt createdAt updatedAt')
    .sort({ createdAt: -1 });
};

export const facultyEditLorRequestContent = async (facultyId, requestId, payload) => {
  const request = await LorRequest.findOne({ _id: requestId, facultyId, status: 'pending' });
  if (!request) throw httpError(404, 'Pending request not found for this faculty');

  if (payload.achievements !== undefined) request.achievements = payload.achievements.trim();
  if (payload.lorRequirements !== undefined) request.lorRequirements = payload.lorRequirements.trim();
  request.facultyEditedAt = new Date();
  await request.save();
  return request;
};

export const updateFacultyLorRequestStatus = async (facultyId, requestId, payload) => {
  const request = await LorRequest.findOneAndUpdate(
    { _id: requestId, facultyId },
    { status: payload.status, facultyRemark: payload.facultyRemark || '' },
    { new: true }
  );
  if (!request) throw httpError(404, 'Request not found for this faculty');
  return request;
};

export const getFacultyLorRequestForPdf = async (facultyId, requestId) => {
  const request = await LorRequest.findOne({ _id: requestId, facultyId })
    .populate('studentId', 'name email enrollment mobile')
    .populate('facultyId', 'name department');

  if (!request) {
    throw httpError(404, 'Request not found for this faculty');
  }

  return request;
};

export const adminCancelLorRequest = async (requestId) => {
  const request = await LorRequest.findByIdAndUpdate(
    requestId,
    { status: 'rejected', facultyRemark: 'Cancelled by admin' },
    { new: true }
  );
  if (!request) throw httpError(404, 'LOR request not found');
  return request;
};

export const adminReassignLorRequest = async (requestId, newFacultyId) => {
  const faculty = await Faculty.findById(newFacultyId);
  if (!faculty) throw httpError(404, 'Faculty not found');
  if (faculty.approvalStatus !== 'approved') throw httpError(400, 'Selected faculty is not approved');

  const request = await LorRequest.findByIdAndUpdate(
    requestId,
    { facultyId: newFacultyId },
    { new: true }
  );
  if (!request) throw httpError(404, 'LOR request not found');
  return request;
};

export const adminDeleteLorRequest = async (requestId) => {
  const request = await LorRequest.findByIdAndDelete(requestId);
  if (!request) throw httpError(404, 'LOR request not found');
  return request;
};

export const getStudentLorRequestForPdf = async (studentId, requestId) => {
  const request = await LorRequest.findOne({ _id: requestId, studentId })
    .populate('studentId', 'name email enrollment mobile')
    .populate('facultyId', 'name department');

  if (!request) {
    throw httpError(404, 'Request not found for this student');
  }

  if (request.status !== 'approved') {
    throw httpError(403, 'Letter is not approved yet');
  }

  // Idempotent — reuses existing token on re-download
  const verificationToken = await ensureVerificationToken(request._id);

  return { request, verificationToken };
};
