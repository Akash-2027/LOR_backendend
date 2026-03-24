import mongoose from 'mongoose';
import userBaseSchema from './user.base.schema.js';
import { ROLES } from '../config/constants.js';

const studentSchema = userBaseSchema.clone().add({
  enrollment: { type: String, required: true, trim: true },
  mobile: { type: String, required: true },
  govtId: { type: String, trim: true, uppercase: true, default: null }
});

studentSchema.add({ role: { type: String, default: ROLES.STUDENT } });

// Sparse index: null/undefined values are excluded, so existing accounts without govtId
// don't conflict with each other or with new registrations that provide a value.
studentSchema.index({ govtId: 1 }, { unique: true, sparse: true });

const Student = mongoose.model('Student', studentSchema);

export default Student;
