import { z } from 'zod';
import { publicProcedure } from '../../create-context';

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }))
  .mutation(({ input }: { input: any }) => {
    // Mock authentication
    if (input.email === 'admin@example.com' && input.password === 'password') {
      return {
        success: true,
        user: {
          id: '1',
          email: input.email,
          name: 'Admin User',
          rank: 'Полковник',
          role: 'admin',
          avatar: '',
          unit: 'Security',
          phone: '+7 (999) 123-45-67',
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      };
    }
    
    throw new Error('Invalid credentials');
  });

export const logoutProcedure = publicProcedure
  .mutation(() => {
    return { success: true };
  });

export const refreshTokenProcedure = publicProcedure
  .input(z.object({
    refreshToken: z.string(),
  }))
  .mutation(({ input }: { input: any }) => {
    // Mock token refresh
    return {
      token: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token',
    };
  });

export const changePasswordProcedure = publicProcedure
  .input(z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6),
  }))
  .mutation(({ input }: { input: any }) => {
    // Mock password change
    return { success: true };
  });

export const resetPasswordProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
  }))
  .mutation(({ input }: { input: any }) => {
    // Mock password reset
    return { success: true, message: 'Password reset email sent' };
  });

export const verifyProcedure = publicProcedure
  .query(() => {
    // Mock session verification - always return success for now
    return { success: true };
  });