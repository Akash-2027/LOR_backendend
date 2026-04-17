import Admin from '../../models/user.admin.model.js';
import Student from '../../models/user.student.model.js';
import Faculty from '../../models/user.faculty.model.js';
import LorRequest from '../../models/lor.request.model.js';
import { hashPassword, comparePassword } from './password.service.js';
import { signToken } from './token.service.js';
import { sanitizeUser } from '../../utils/sanitize.js';
import httpError from '../../utils/httpError.js';

export const ensureAdminAccount = async ({ name, email, password }) => {
  const existing = await Admin.findOne({ email });
  if (existing) {
    return existing;
  }

  const passwordHash = await hashPassword(password);
  const admin = await Admin.create({ name, email, passwordHash });
  return admin;
};

export const loginAdmin = async ({ email, password }) => {
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw httpError(401, 'Invalid credentials');
  }

  const match = await comparePassword(password, admin.passwordHash);
  if (!match) {
    throw httpError(401, 'Invalid credentials');
  }

  const token = signToken({
    id: admin._id,
    role: admin.role,
    email: admin.email,
    tokenVersion: admin.tokenVersion || 0
  });
  return { admin: sanitizeUser(admin), token };
};

export const listAdminStudents = async ({ page = 1, limit = 100 } = {}) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Student.find({})
      .select('name email enrollment mobile govtId role isActive createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Student.countDocuments({})
  ]);
  return { data, total, page, limit };
};

export const listAdminFaculties = async ({ page = 1, limit = 100 } = {}) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Faculty.find({})
      .populate('approvedBy', 'name email')
      .select('name email collegeEmail department mobile approvalStatus approvedBy role isActive createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Faculty.countDocuments({})
  ]);
  return { data, total, page, limit };
};

export const listAdminLorRequests = async ({ page = 1, limit = 100 } = {}) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    LorRequest.find({})
      .populate('studentId', 'name email enrollment')
      .populate('facultyId', 'name email collegeEmail department')
      .select('studentId facultyId purpose targetUniversity program dueDate status facultyRemark documentType documentName createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    LorRequest.countDocuments({})
  ]);
  return { data, total, page, limit };
};

export const rejectFaculty = async (facultyId) => {
  const faculty = await Faculty.findByIdAndUpdate(
    facultyId,
    { approvalStatus: 'rejected' },
    { new: true }
  );
  if (!faculty) throw httpError(404, 'Faculty not found');
  return faculty;
};

export const toggleFacultyActive = async (facultyId) => {
  // Aggregation pipeline update for atomic boolean toggle (no separate read needed)
  const faculty = await Faculty.findByIdAndUpdate(
    facultyId,
    [{ $set: { isActive: { $not: '$isActive' } } }],
    { new: true }
  );
  if (!faculty) throw httpError(404, 'Faculty not found');
  return faculty;
};

export const deleteFaculty = async (facultyId) => {
  const faculty = await Faculty.findByIdAndDelete(facultyId);
  if (!faculty) throw httpError(404, 'Faculty not found');
  return faculty;
};

export const adminUpdateFacultyProfile = async (facultyId, payload) => {
  const faculty = await Faculty.findById(facultyId);
  if (!faculty) throw httpError(404, 'Faculty not found');

  const updates = {};

  if (payload.name        !== undefined) updates.name        = payload.name.trim();
  if (payload.mobile      !== undefined) updates.mobile      = payload.mobile.trim();
  if (payload.collegeEmail !== undefined) updates.collegeEmail = payload.collegeEmail.trim().toLowerCase();
  if (payload.department  !== undefined) updates.department  = payload.department.trim();

  if (payload.email !== undefined) {
    const normalizedEmail = payload.email.trim().toLowerCase();
    if (normalizedEmail !== faculty.email) {
      const taken = await Faculty.findOne({ email: normalizedEmail });
      if (taken) throw httpError(409, 'Another faculty account already uses this email');
      updates.email = normalizedEmail;
      // Bump tokenVersion to invalidate the faculty's current JWT sessions
      updates.tokenVersion = (faculty.tokenVersion || 0) + 1;
    }
  }

  const updated = await Faculty.findByIdAndUpdate(facultyId, updates, { new: true });
  return sanitizeUser(updated);
};
