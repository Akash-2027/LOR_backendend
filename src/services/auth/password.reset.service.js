import crypto from 'crypto';
import Student from '../../models/user.student.model.js';
import Faculty from '../../models/user.faculty.model.js';
import Admin from '../../models/user.admin.model.js';
import env from '../../config/env.js';
import httpError from '../../utils/httpError.js';
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

  // Reset code sent in email (NOT in URL) — user enters it in a form
  const resetCode = rawToken.substring(0, 6).toUpperCase(); // Show first 6 chars as the code
  const resetPageUrl = `${env.clientBaseUrl}/auth?panel=reset&email=${encodeURIComponent(user.email)}`;

  const mailResult = await sendMail({
    to: user.email,
    subject: 'LOR Portal - Password Reset Code',
    text: `Your password reset code is: ${rawToken}\n\nEnter this code at: ${resetPageUrl}\n\nThis code expires in ${env.resetTokenTtlMinutes} minutes.\n\nIf you did not request this, ignore this email.`,
    html: `<p>Your password reset code is:</p><p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${resetCode}</p><p><a href="${resetPageUrl}">Click here to reset password</a> and enter the code above.</p><p>This code expires in ${env.resetTokenTtlMinutes} minutes.</p><p><small>If you did not request this, you can safely ignore this email.</small></p>`
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
    throw httpError(400, 'Invalid or expired reset token');
  }

  const tokenHash = hashResetToken(token);
  const isTokenValid = user.resetPasswordTokenHash === tokenHash;
  const isNotExpired = user.resetPasswordExpiresAt && user.resetPasswordExpiresAt > new Date();

  if (!isTokenValid || !isNotExpired) {
    throw httpError(400, 'Invalid or expired reset token');
  }

  user.passwordHash = await hashPassword(newPassword);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  // Increment tokenVersion to invalidate all existing sessions
  user.tokenVersion = (user.tokenVersion || 0) + 1;

  await user.save();

  return { email: user.email, updated: true };
};
