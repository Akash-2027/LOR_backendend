import Faculty from '../../models/user.faculty.model.js';
import { hashPassword, comparePassword } from './password.service.js';
import { signToken } from './token.service.js';
import { sanitizeUser } from '../../utils/sanitize.js';

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
    throw new Error('Faculty already exists');
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
    throw new Error('Invalid credentials');
  }

  if (faculty.approvalStatus !== 'approved') {
    throw new Error('Faculty access pending approval');
  }

  const match = await comparePassword(password, faculty.passwordHash);
  if (!match) {
    throw new Error('Invalid credentials');
  }

  const token = signToken({ id: faculty._id, role: faculty.role, email: faculty.email });
  return { faculty: sanitizeUser(faculty), token };
};

export const approveFaculty = async ({ facultyId, adminId }) => {
  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new Error('Faculty not found');
  }

  faculty.approvalStatus = 'approved';
  faculty.approvedBy = adminId;
  await faculty.save();
  return faculty;
};

export const updateFacultySubjects = async ({ facultyId, subjects }) => {
  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new Error('Faculty not found');
  }

  faculty.subjects = normalizeSubjects(subjects);
  await faculty.save();

  return sanitizeUser(faculty);
};
