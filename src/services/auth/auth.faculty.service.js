import Faculty from '../../models/user.faculty.model.js';
import { hashPassword, comparePassword } from './password.service.js';
import { signToken } from './token.service.js';
import { sanitizeUser } from '../../utils/sanitize.js';
import httpError from '../../utils/httpError.js';

const normalizeSubjects = (subjects) => {
  if (!Array.isArray(subjects)) return [];
  const cleaned = subjects
    .map((subject) => (typeof subject === 'string' ? subject.trim() : ''))
    .filter((subject) => subject.length > 0);
  return [...new Set(cleaned)];
};

export const registerFacultyRequest = async (payload) => {
  const existing = await Faculty.findOne({ email: payload.email });
  if (existing) {
    throw httpError(409, 'An account with this email already exists');
  }

  const passwordHash = await hashPassword(payload.password);
  const faculty = await Faculty.create({
    ...payload,
    passwordHash,
    approvalStatus: 'pending'
  });

  return { faculty: sanitizeUser(faculty) };
};

export const loginFaculty = async ({ email, password }) => {
  const faculty = await Faculty.findOne({ email });
  if (!faculty) {
    throw httpError(401, 'Invalid credentials');
  }

  if (faculty.approvalStatus !== 'approved') {
    throw httpError(403, 'Faculty access pending approval');
  }

  if (!faculty.isActive) {
    throw httpError(403, 'Your account has been deactivated. Please contact the administrator.');
  }

  const match = await comparePassword(password, faculty.passwordHash);
  if (!match) {
    throw httpError(401, 'Invalid credentials');
  }

  const token = signToken({
    id: faculty._id,
    role: faculty.role,
    email: faculty.email,
    tokenVersion: faculty.tokenVersion || 0
  });
  return { faculty: sanitizeUser(faculty), token };
};

export const approveFaculty = async ({ facultyId, adminId }) => {
  const faculty = await Faculty.findByIdAndUpdate(
    facultyId,
    { approvalStatus: 'approved', approvedBy: adminId },
    { new: true }
  );
  if (!faculty) throw httpError(404, 'Faculty not found');
  return faculty;
};

export const updateFacultySubjects = async ({ facultyId, subjects }) => {
  const faculty = await Faculty.findByIdAndUpdate(
    facultyId,
    { subjects: normalizeSubjects(subjects) },
    { new: true }
  );
  if (!faculty) throw httpError(404, 'Faculty not found');
  return sanitizeUser(faculty);
};

export const updateFacultyProfile = async ({ facultyId, payload }) => {
  const allowed = {};
  if (payload.name        !== undefined) allowed.name        = payload.name.trim();
  if (payload.mobile      !== undefined) allowed.mobile      = payload.mobile.trim();
  if (payload.collegeEmail !== undefined) allowed.collegeEmail = payload.collegeEmail.trim().toLowerCase();

  if (Object.keys(allowed).length === 0) throw httpError(400, 'No valid fields to update');

  const faculty = await Faculty.findByIdAndUpdate(facultyId, allowed, { new: true });
  if (!faculty) throw httpError(404, 'Faculty not found');
  return sanitizeUser(faculty);
};
