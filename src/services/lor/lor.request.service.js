import Faculty from '../../models/user.faculty.model.js';
import LorRequest from '../../models/lor.request.model.js';
import httpError from '../../utils/httpError.js';

export const getApprovedFacultyList = async () => {
  return Faculty.find({ approvalStatus: 'approved' })
    .select('_id name email collegeEmail department')
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

  const request = await LorRequest.create({
    studentId,
    facultyId: payload.facultyId,
    purpose: payload.purpose,
    targetUniversity: payload.targetUniversity,
    program: payload.program,
    dueDate: payload.dueDate,
    achievements: payload.achievements,
    lorRequirements: payload.lorRequirements,
    documentType: payload.documentType,
    documentName: payload.documentName,
    documentData: payload.documentData,
    status: 'pending'
  });

  return request;
};

export const listStudentLorRequests = async (studentId) => {
  return LorRequest.find({ studentId })
    .populate('facultyId', 'name email collegeEmail department')
    .sort({ createdAt: -1 });
};

export const listFacultyLorRequests = async (facultyId) => {
  return LorRequest.find({ facultyId })
    .populate('studentId', 'name email enrollment mobile')
    .sort({ createdAt: -1 });
};

export const updateFacultyLorRequestStatus = async (facultyId, requestId, payload) => {
  const request = await LorRequest.findOne({ _id: requestId, facultyId });
  if (!request) {
    throw httpError(404, 'Request not found for this faculty');
  }

  request.status = payload.status;
  request.facultyRemark = payload.facultyRemark || '';
  await request.save();

  return request;
};
