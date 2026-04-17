import { z } from 'zod';
import { LOR_STATUS, DOCUMENT_TYPE, ALLOWED_DOCUMENT_MIME } from '../../config/constants.js';

export const createStudentLorRequestSchema = z.object({
  body: z.object({
    facultyId: z.string().trim().min(6, 'Please select faculty'),
    subject: z.string().trim().min(2, 'Subject is required'),
    purpose: z.string().trim().min(3, 'Purpose is required').max(200, 'Purpose cannot exceed 200 characters'),
    targetUniversity: z.string().trim().min(2, 'Target university is required').max(100, 'University name too long'),
    program: z.string().trim().min(2, 'Program is required').max(100, 'Program name too long'),
    dueDate: z.string().trim().min(8, 'Due date is required').refine(
      (val) => new Date(val) > new Date(),
      'Due date must be in the future'
    ),
    achievements: z.string().trim().min(5, 'Achievements should be at least 5 characters').max(600, 'Achievements cannot exceed 600 characters'),
    lorRequirements: z.string().trim().min(10, 'Please add what should be included in LOR').max(500, 'LOR requirements cannot exceed 500 characters'),
    documentType: z.enum([DOCUMENT_TYPE.MARKSHEET, DOCUMENT_TYPE.ID_CARD], { message: 'Document type must be marksheet or idCard' }),
    documentName: z.string().trim().min(1, 'Document name is required'),
    documentData: z.string().trim().min(10, 'Please upload marksheet or id card').refine(
      (val) => ALLOWED_DOCUMENT_MIME.some((mime) => val.startsWith(`data:${mime};base64,`)),
      'Only JPG, PNG, or PDF files are allowed'
    )
  })
});

export const updateFacultyLorRequestStatusSchema = z.object({
  params: z.object({
    requestId: z.string().trim().min(6, 'Request id is required')
  }),
  body: z.object({
    status: z.enum([LOR_STATUS.APPROVED, LOR_STATUS.REJECTED], { message: 'Status must be approved or rejected' }),
    facultyRemark: z.string().trim().max(500, 'Remark can be at most 500 characters').optional()
  })
});

export const facultyEditLorRequestContentSchema = z.object({
  params: z.object({
    requestId: z.string().trim().min(6, 'Request id is required')
  }),
  body: z.object({
    achievements: z.string().trim().min(5, 'Achievements should be at least 5 characters').max(600, 'Achievements cannot exceed 600 characters').optional(),
    lorRequirements: z.string().trim().min(10, 'LOR requirements should be at least 10 characters').max(500, 'LOR requirements cannot exceed 500 characters').optional()
  }).refine(
    (data) => data.achievements !== undefined || data.lorRequirements !== undefined,
    'At least one field (achievements or lorRequirements) must be provided'
  )
});
