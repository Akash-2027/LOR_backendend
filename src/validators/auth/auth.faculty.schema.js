import { z } from 'zod';

export const registerFacultySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid personal email address'),
    collegeEmail: z.string().email('Enter a valid college email address'),
    department: z.string().min(2, 'Department must be at least 2 characters'),
    mobile: z.string().min(7, 'Mobile number must be at least 7 digits').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters')
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
