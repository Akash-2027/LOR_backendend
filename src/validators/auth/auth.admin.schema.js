import { z } from 'zod';

export const loginAdminSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid admin email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});

export const adminUpdateFacultyProfileSchema = z.object({
  params: z.object({
    facultyId: z.string().min(6)
  }),
  body: z.object({
    email:        z.string().email('Enter a valid email address').optional(),
    department:   z.string().min(2, 'Department must be at least 2 characters').optional(),
    name:         z.string().min(2, 'Name must be at least 2 characters').optional(),
    mobile:       z.string().min(7, 'Mobile must be at least 7 digits').optional(),
    collegeEmail: z.string().email('Enter a valid college email').optional()
  }).refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' })
});
