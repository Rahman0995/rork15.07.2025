import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { database } from '../../../../lib/supabase';

export const getUsersProcedure = publicProcedure
  .input(z.object({
    unit: z.string().optional(),
    role: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional())
  .query(async ({ input }: { input: any }) => {
    try {
      const { data: users, error } = await database.users.getAll();
      
      if (error) {
        console.error('Error fetching users:', error);
        return { users: [], total: 0 };
      }
      
      let filteredUsers = users || [];
      
      // Apply filters
      if (input?.unit) {
        filteredUsers = filteredUsers.filter(user => user.unit === input.unit);
      }
      
      if (input?.role) {
        filteredUsers = filteredUsers.filter(user => user.role === input.role);
      }
      
      const total = filteredUsers.length;
      
      // Apply pagination
      if (input?.offset || input?.limit) {
        const offset = input.offset || 0;
        const limit = input.limit || 10;
        filteredUsers = filteredUsers.slice(offset, offset + limit);
      }
      
      return {
        users: filteredUsers,
        total,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], total: 0 };
    }
  });

export const getUserByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }: { input: any }) => {
    try {
      const { data: user, error } = await database.users.getById(input.id);
      
      if (error) {
        throw new Error(error.message || 'User not found');
      }
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw new Error('User not found');
    }
  });

export const getUsersByUnitProcedure = publicProcedure
  .input(z.object({ unit: z.string() }))
  .query(async ({ input }: { input: any }) => {
    try {
      const connection = getConnection();
      const stmt = connection.prepare('SELECT * FROM users WHERE unit = ? ORDER BY created_at DESC');
      return stmt.all(input.unit) as User[];
    } catch (error) {
      console.error('Error fetching users by unit:', error);
      
      if (config.development.mockData) {
        return [
          {
            id: 'user-1',
            name: 'Mock User 1',
            rank: 'Капитан',
            role: 'officer',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            unit: input.unit,
            email: 'mock1@military.gov',
            phone: '+7-900-000-0001',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];
      }
      
      throw new Error('Failed to fetch users by unit');
    }
  });

export const updateUserProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(['admin', 'officer', 'soldier']).optional(),
    unit: z.string().optional(),
    avatar_url: z.string().optional(),
    rank: z.string().optional(),
    phone: z.string().optional(),
  }))
  .mutation(async ({ input }: { input: any }) => {
    try {
      const updates: any = {};
      
      if (input.first_name) updates.first_name = input.first_name;
      if (input.last_name) updates.last_name = input.last_name;
      if (input.email) updates.email = input.email;
      if (input.role) updates.role = input.role;
      if (input.unit) updates.unit = input.unit;
      if (input.avatar_url) updates.avatar_url = input.avatar_url;
      if (input.rank) updates.rank = input.rank;
      if (input.phone) updates.phone = input.phone;
      
      if (Object.keys(updates).length === 0) {
        throw new Error('No fields to update');
      }
      
      const { data: user, error } = await database.users.update(input.id, updates);
      
      if (error) {
        throw new Error(error.message || 'Failed to update user');
      }
      
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  });

export const getCurrentUserProcedure = publicProcedure
  .query(async ({ ctx }) => {
    try {
      // In a real app, get user ID from JWT token in ctx
      // For now, return the first user as current user
      const { data: users, error } = await database.users.getAll();
      
      if (error || !users || users.length === 0) {
        throw new Error('No users found');
      }
      
      return users[0];
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw new Error('Failed to fetch current user');
    }
  });