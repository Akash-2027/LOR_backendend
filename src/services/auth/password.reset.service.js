import crypto from 'crypto';
import Student from '../../models/user.student.model.js';
import Faculty from '../../models/user.faculty.model.js';
import Admin from '../../models/user.admin.model.js';
import env from '../../config/env.js';
import { hashPassword } from './password.service.js';
import { sendMail } from '../mail.service.js';

const USER_MODELS = [Student, Faculty, Admin];

const findUserByEmail = async (email) => {
  for (const Model of USER_MODELS) {
    const user = await Model.findOne({ email });
    if (user) return user;
  }
  return null;
};

const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const requestPasswordReset = async ({ email }) => {
  const user = await findUserByEmail(email);

  // Keep response ambiguous for security while still allowing demo flow.
  if (!user) {
    return { email, sent: true };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(rawToken);

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpiresAt = new Date(Date.now() + env.resetTokenTtlMinutes * 60 * 1000);
  await user.save();

  const query = new URLSearchParams({
    panel: 'reset',
    email: user.email,
    token: rawToken
  }).toString();

  const resetLink = `${env.clientBaseUrl}/auth?${query}`;
  console.log(resetLink);

  const mailResult = await sendMail({
    to: user.email,
    subject: 'LOR Portal - Reset Password Link',
    text: `Use this link to reset your password: ${resetLink}`,
    html: `<p>Use this link to reset your password:</p><p><a href=\"${resetLink}\">${resetLink}</a></p><p>This link expires in ${env.resetTokenTtlMinutes} minutes.</p>`
  });

  return {
    email: user.email,
    sent: true,
    previewUrl: mailResult.previewUrl || undefined,
    mode: mailResult.mode
  };
};

export const resetPasswordWithToken = async ({ email, token, newPassword }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  const tokenHash = hashResetToken(token);
  const isTokenValid = user.resetPasswordTokenHash === tokenHash;
  const isNotExpired = user.resetPasswordExpiresAt && user.resetPasswordExpiresAt > new Date();

  if (!isTokenValid || !isNotExpired) {
    throw new Error('Invalid or expired reset token');
  }

  user.passwordHash = await hashPassword(newPassword);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;

  await user.save();

  return { email: user.email, updated: true };
};
