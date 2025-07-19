import { z } from 'zod';
import { publicProcedure } from '../../create-context';

// In-memory user storage for demo purposes
// In production, this would be a database
const users: any[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password', // In production, this would be hashed
    name: 'Admin User',
    rank: 'Полковник',
    role: 'admin',
    avatar: '',
    unit: 'Security',
    phone: '+7 (999) 123-45-67',
  }
];

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }))
  .mutation(({ input }: { input: any }) => {
    // Find user by email
    const user = users.find(u => u.email === input.email);
    
    if (!user || user.password !== input.password) {
      throw new Error('Invalid credentials');
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    
    return {
      success: true,
      user: userWithoutPassword,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
    };
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

export const registerProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    rank: z.string().min(1),
    unit: z.string().min(1),
    phone: z.string().optional(),
    role: z.enum(['battalion_commander', 'company_commander', 'officer', 'soldier', 'admin']).default('soldier'),
  }))
  .mutation(({ input }: { input: any }) => {
    // Check if user already exists
    const existingUser = users.find(u => u.email === input.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: input.email,
      password: input.password, // In production, this would be hashed
      name: input.name,
      rank: input.rank,
      role: input.role,
      avatar: '',
      unit: input.unit,
      phone: input.phone || '',
    };
    
    // Add to users array
    users.push(newUser);
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    
    return {
      success: true,
      user: userWithoutPassword,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
    };
  });

export const verifyProcedure = publicProcedure
  .query(() => {
    // Mock session verification - always return success for now
    return { success: true };
  });