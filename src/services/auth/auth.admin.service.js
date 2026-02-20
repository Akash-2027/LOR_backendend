import Admin from '../../models/user.admin.model.js';
import { hashPassword, comparePassword } from './password.service.js';
import { signToken } from './token.service.js';
import { sanitizeUser } from '../../utils/sanitize.js';

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
    throw new Error('Invalid credentials');
  }

  const match = await comparePassword(password, admin.passwordHash);
  if (!match) {
    throw new Error('Invalid credentials');
  }

  const token = signToken({ id: admin._id, role: admin.role, email: admin.email });
  return { admin: sanitizeUser(admin), token };
};
