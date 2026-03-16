import mongoose from 'mongoose';
import userBaseSchema from './user.base.schema.js';
import { ROLES } from '../config/constants.js';

const adminSchema = userBaseSchema.clone();

adminSchema.add({ role: { type: String, default: ROLES.ADMIN } });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
