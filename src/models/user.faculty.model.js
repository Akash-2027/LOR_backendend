import mongoose from 'mongoose';
import userBaseSchema from './user.base.schema.js';
import { ROLES } from '../config/constants.js';

const facultySchema = userBaseSchema.clone().add({
  collegeEmail: { type: String, required: true, trim: true, lowercase: true },
  department: { type: String, required: true },
  mobile: { type: String },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});

facultySchema.add({ role: { type: String, default: ROLES.FACULTY } });

const Faculty = mongoose.model('Faculty', facultySchema);

export default Faculty;
