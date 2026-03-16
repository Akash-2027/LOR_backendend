import mongoose from 'mongoose';
import { ROLES } from '../config/constants.js';

const userBaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },
    role: { type: String, enum: Object.values(ROLES), required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default userBaseSchema;
