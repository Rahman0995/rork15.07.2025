import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { supabase, auth } from '../../../../lib/supabase';

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }))
  .mutation(async ({ input }: { input: any }) => {
    try {
      const { data, error } = await auth.signIn(input.email, input.password);
      
      if (error) {
        throw new Error(error.message || 'Invalid credentials');
      }
      
      if (!data?.user) {
        throw new Error('Authentication failed');
      }
      
      // Get user profile from users table
      const userProfile = await supabase
        ?.from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      return {
        success: true,
        user: userProfile?.data || {
          id: data.user.id,
          email: data.user.email || '',
          first_name: data.user.user_metadata?.first_name || '',
          last_name: data.user.user_metadata?.last_name || '',
          role: 'soldier',
        },
        session: data.session,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  });

export const logoutProcedure = publicProcedure
  .mutation(async () => {
    try {
      const { error } = await auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  });

export const refreshTokenProcedure = publicProcedure
  .input(z.object({
    refreshToken: z.string(),
  }))
  .mutation(async ({ input }: { input: any }) => {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }
      
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: input.refreshToken,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        session: data.session,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Token refresh failed');
    }
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

export const registerProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    rank: z.string().min(1),
    unit: z.string().min(1),
    phone: z.string().optional(),
    role: z.enum(['admin', 'officer', 'soldier']).default('soldier'),
  }))
  .mutation(async ({ input }: { input: any }) => {
    try {
      // Register user with Supabase Auth
      const { data, error } = await auth.signUp(input.email, input.password, {
        first_name: input.firstName,
        last_name: input.lastName,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data?.user) {
        throw new Error('Registration failed');
      }
      
      // Create user profile in users table
      const userProfile = await supabase
        ?.from('users')
        .insert({
          id: data.user.id,
          email: input.email,
          first_name: input.firstName,
          last_name: input.lastName,
          rank: input.rank,
          role: input.role,
          unit: input.unit,
          phone: input.phone || null,
          password_hash: '', // Supabase handles password hashing
        })
        .select()
        .single();
      
      return {
        success: true,
        user: userProfile?.data || {
          id: data.user.id,
          email: input.email,
          first_name: input.firstName,
          last_name: input.lastName,
          role: input.role,
        },
        session: data.session,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  });

export const verifyProcedure = publicProcedure
  .query(async () => {
    try {
      const { user, error } = await auth.getCurrentUser();
      
      if (error || !user) {
        return { success: false, error: error?.message || 'Not authenticated' };
      }
      
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message || 'Verification failed' };
    }
  });