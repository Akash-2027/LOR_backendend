import mongoose from 'mongoose';
import userBaseSchema from './user.base.schema.js';
import { ROLES } from '../config/constants.js';

const studentSchema = userBaseSchema.clone().add({
  enrollment: { type: String, required: true, trim: true },
  mobile: { type: String, required: true }
});

studentSchema.add({ role: { type: String, default: ROLES.STUDENT } });

const Student = mongoose.model('Student', studentSchema);

export default Student;
