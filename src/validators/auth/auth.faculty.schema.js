import { z } from 'zod';

export const registerFacultySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid personal email address'),
    collegeEmail: z.string().email('Enter a valid college email address'),
    department: z.string().min(2, 'Department must be at least 2 characters'),
    mobile: z.string().min(7, 'Mobile number must be at least 7 digits').optional(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain at least one special character')
  })
});

export const loginFacultySchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});

export const approveFacultySchema = z.object({
  params: z.object({
    facultyId: z.string().min(6)
  })
});

export const updateFacultySubjectsSchema = z.object({
  body: z.object({
    subjects: z.array(z.string().trim().min(2, 'Subject must be at least 2 characters'))
      .max(20)
      .refine(
        (arr) => new Set(arr.map((s) => s.toLowerCase())).size === arr.length,
        'Subjects must be unique'
      )
  })
});

export const updateFacultyProfileSchema = z.object({
  body: z.object({
    name:         z.string().min(2, 'Name must be at least 2 characters').optional(),
    mobile:       z.string().min(7, 'Mobile must be at least 7 digits').optional(),
    collegeEmail: z.string().email('Enter a valid college email').optional()
  }).refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' })
});
