import { z } from 'zod';
import { publicProcedure } from '../create-context';

const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    unit: 'Security',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'manager@example.com',
    name: 'Manager User',
    role: 'manager',
    unit: 'Operations',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9e0e4b0?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'officer@example.com',
    name: 'Security Officer',
    role: 'officer',
    unit: 'Security',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date().toISOString(),
  },
];

export const getUsersProcedure = publicProcedure
  .input(z.object({
    unit: z.string().optional(),
    role: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional())
  .query(({ input }: { input: any }) => {
    let users = [...mockUsers];
    
    if (input?.unit) {
      users = users.filter(user => user.unit === input.unit);
    }
    
    if (input?.role) {
      users = users.filter(user => user.role === input.role);
    }
    
    if (input?.offset || input?.limit) {
      const offset = input.offset || 0;
      const limit = input.limit || 10;
      users = users.slice(offset, offset + limit);
    }
    
    return {
      users,
      total: mockUsers.length,
    };
  });

export const getUserByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }: { input: any }) => {
    const user = mockUsers.find(u => u.id === input.id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  });

export const getUsersByUnitProcedure = publicProcedure
  .input(z.object({ unit: z.string() }))
  .query(({ input }: { input: any }) => {
    return mockUsers.filter(user => user.unit === input.unit);
  });

export const updateUserProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.string().optional(),
    unit: z.string().optional(),
    avatar: z.string().optional(),
  }))
  .mutation(({ input }: { input: any }) => {
    const userIndex = mockUsers.findIndex(user => user.id === input.id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...mockUsers[userIndex],
      ...input,
    };
    
    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  });

export const getCurrentUserProcedure = publicProcedure
  .query(() => {
    // Return mock current user
    return mockUsers[0];
  });