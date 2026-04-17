import Student from '../../models/user.student.model.js';
import { hashPassword, comparePassword } from './password.service.js';
import { signToken } from './token.service.js';
import { sanitizeUser } from '../../utils/sanitize.js';
import httpError from '../../utils/httpError.js';

export const registerStudent = async (payload) => {
  const existing = await Student.findOne({ email: payload.email });
  if (existing) {
    throw httpError(409, 'An account with this email already exists');
  }

  if (payload.govtId) {
    const dup = await Student.findOne({ govtId: payload.govtId });
    if (dup) throw httpError(409, 'A student with this Govt ID is already registered');
  }

  const passwordHash = await hashPassword(payload.password);
  const student = await Student.create({
    ...payload,
    passwordHash
  });

  const token = signToken({
    id: student._id,
    role: student.role,
    email: student.email,
    tokenVersion: student.tokenVersion || 0
  });
  return { student: sanitizeUser(student), token };
};

export const loginStudent = async ({ email, password }) => {
  const student = await Student.findOne({ email });
  if (!student) {
    throw httpError(401, 'Invalid credentials');
  }

  if (!student.isActive) {
    throw httpError(403, 'Your account has been deactivated. Please contact the administrator.');
  }

  const match = await comparePassword(password, student.passwordHash);
  if (!match) {
    throw httpError(401, 'Invalid credentials');
  }

  const token = signToken({
    id: student._id,
    role: student.role,
    email: student.email,
    tokenVersion: student.tokenVersion || 0
  });
  return { student: sanitizeUser(student), token };
};
