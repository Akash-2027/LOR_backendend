import crypto from 'crypto';
import LorRequest from '../../models/lor.request.model.js';
import httpError from '../../utils/httpError.js';

/**
 * Returns the existing verificationToken for the request, or generates and
 * persists a new one if none exists (idempotent — safe to call on every download).
 */
export const ensureVerificationToken = async (requestId) => {
  const existing = await LorRequest.findById(requestId).select('verificationToken').lean();

  if (existing?.verificationToken) {
    return existing.verificationToken;
  }

  const token = crypto.randomBytes(32).toString('hex');

  await LorRequest.findByIdAndUpdate(requestId, {
    verificationToken: token,
    verificationTokenIssuedAt: new Date()
  });

  return token;
};

/**
 * Looks up a certificate by its verificationToken and returns public details.
 * Throws 404 if not found, 410 if the LOR was cancelled/rejected after issuance.
 */
export const getVerificationDetails = async (token) => {
  const request = await LorRequest.findOne({ verificationToken: token })
    .populate('studentId', 'name enrollment email')
    .populate('facultyId', 'name department')
    .lean();

  if (!request) {
    throw httpError(404, 'Certificate not found or token is invalid');
  }

  if (request.status !== 'approved') {
    throw httpError(410, 'This certificate is no longer valid');
  }

  return {
    studentName:       request.studentId?.name        || '-',
    enrollment:        request.studentId?.enrollment  || '-',
    facultyName:       request.facultyId?.name        || '-',
    facultyDepartment: request.facultyId?.department  || '-',
    program:           request.program,
    targetUniversity:  request.targetUniversity,
    purpose:           request.purpose,
    approvalDate:      request.updatedAt,
    issuedAt:          request.verificationTokenIssuedAt
  };
};
