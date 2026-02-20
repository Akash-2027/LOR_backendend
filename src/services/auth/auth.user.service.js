import Student from '../../models/user.student.model.js';
import { hashPassword, comparePassword } from './password.service.js';
import { signToken } from './token.service.js';
import { sanitizeUser } from '../../utils/sanitize.js';

export const registerStudent = async (payload) => {
  const existing = await Student.findOne({ email: payload.email });
  if (existing) {
    throw new Error('Student already exists');
  }

  const passwordHash = await hashPassword(payload.password);
  const student = await Student.create({
    ...payload,
    passwordHash
  });

  const token = signToken({ id: student._id, role: student.role, email: student.email });
  return { student: sanitizeUser(student), token };
};

export const loginStudent = async ({ email, password }) => {
  const student = await Student.findOne({ email });
  if (!student) {
    throw new Error('Invalid credentials');
  }

  const match = await comparePassword(password, student.passwordHash);
  if (!match) {
    throw new Error('Invalid credentials');
  }

  const token = signToken({ id: student._id, role: student.role, email: student.email });
  return { student: sanitizeUser(student), token };
};
