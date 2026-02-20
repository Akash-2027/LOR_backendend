import { z } from 'zod';

export const registerStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    enrollment: z.string().min(3, 'Enrollment ID must be at least 3 characters'),
    mobile: z.string().min(7, 'Mobile number must be at least 7 digits')
  })
});

export const loginStudentSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});
