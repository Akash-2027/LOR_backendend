import { z } from 'zod';

export const createStudentLorRequestSchema = z.object({
  body: z.object({
    facultyId: z.string().min(6, 'Please select faculty'),
    purpose: z.string().min(5, 'Purpose should be at least 5 characters'),
    targetUniversity: z.string().min(2, 'Target university is required'),
    program: z.string().min(2, 'Program is required'),
    dueDate: z.string().min(8, 'Due date is required'),
    achievements: z.string().min(5, 'Achievements should be at least 5 characters'),
    lorRequirements: z.string().min(10, 'Please add what should be included in LOR'),
    documentType: z.enum(['marksheet', 'idCard'], { message: 'Document type must be marksheet or idCard' }),
    documentName: z.string().min(1, 'Document name is required'),
    documentData: z.string().min(10, 'Please upload marksheet or id card')
  })
});

export const updateFacultyLorRequestStatusSchema = z.object({
  params: z.object({
    requestId: z.string().min(6, 'Request id is required')
  }),
  body: z.object({
    status: z.enum(['approved', 'rejected'], { message: 'Status must be approved or rejected' }),
    facultyRemark: z.string().max(500, 'Remark can be at most 500 characters').optional()
  })
});
