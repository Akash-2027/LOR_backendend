import mongoose from 'mongoose';
import { LOR_STATUS, DOCUMENT_TYPE } from '../config/constants.js';

const lorRequestSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    subject: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },
    targetUniversity: { type: String, required: true, trim: true },
    program: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    achievements: { type: String, required: true, trim: true },
    lorRequirements: { type: String, required: true, trim: true },
    documentType: { type: String, enum: Object.values(DOCUMENT_TYPE), required: true },
    documentName: { type: String, required: true, trim: true },
    documentData: { type: String, required: true },
    status: { type: String, enum: Object.values(LOR_STATUS), default: LOR_STATUS.PENDING },
    facultyRemark: { type: String, default: '' },
    emailSentAt: { type: Date, default: null },
    verificationToken: { type: String, default: null },
    verificationTokenIssuedAt: { type: Date, default: null },
    facultyEditedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

lorRequestSchema.index({ studentId: 1 });
lorRequestSchema.index({ facultyId: 1 });
lorRequestSchema.index({ status: 1 });
lorRequestSchema.index({ createdAt: -1 });
lorRequestSchema.index({ emailSentAt: 1 });
lorRequestSchema.index({ verificationToken: 1 });

const LorRequest = mongoose.model('LorRequest', lorRequestSchema);

export default LorRequest;
