import { z } from 'zod';

export const registerStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain at least one special character'),
    enrollment: z.string().min(3, 'Enrollment ID must be at least 3 characters'),
    mobile: z.string().min(7, 'Mobile number must be at least 7 digits'),
    govtId: z.string()
      .transform((v) => v.trim().toUpperCase())
      .refine(
        (val) => /^\d{12}$/.test(val) || /^[A-Z]{5}\d{4}[A-Z]$/.test(val),
        { message: 'Enter a valid Aadhaar number (12 digits) or PAN card number (e.g. ABCDE1234F)' }
      )
  })
});

export const loginStudentSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});
