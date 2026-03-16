import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email address')
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email address'),
    token: z.string().min(20, 'Reset token looks invalid'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
  })
});
