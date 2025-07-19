import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { getConnection } from '../../database';
import { User } from '../../database/schema';
import { config } from '../../config';

export const getUsersProcedure = publicProcedure
  .input(z.object({
    unit: z.string().optional(),
    role: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional())
  .query(async ({ input }: { input: any }) => {
    try {
      const connection = getConnection();
      
      let query = 'SELECT * FROM users WHERE 1=1';
      const params: any[] = [];
      
      if (input?.unit) {
        query += ' AND unit = ?';
        params.push(input.unit);
      }
      
      if (input?.role) {
        query += ' AND role = ?';
        params.push(input.role);
      }
      
      query += ' ORDER BY created_at DESC';
      
      if (input?.limit) {
        query += ' LIMIT ?';
        params.push(input.limit);
        
        if (input?.offset) {
          query += ' OFFSET ?';
          params.push(input.offset);
        }
      }
      
      const [rows] = await connection.execute(query, params);
      const users = rows as User[];
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
      const countParams: any[] = [];
      
      if (input?.unit) {
        countQuery += ' AND unit = ?';
        countParams.push(input.unit);
      }
      
      if (input?.role) {
        countQuery += ' AND role = ?';
        countParams.push(input.role);
      }
      
      const [countRows] = await connection.execute(countQuery, countParams);
      const total = (countRows as any[])[0].total;
      
      return {
        users,
        total,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Fallback to mock data if database fails and mock is enabled
      if (config.development.mockData) {
        const mockUsers = [
          {
            id: 'user-1',
            name: 'Полковник Зингиев',
            rank: 'Полковник',
            role: 'battalion_commander',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            unit: '1-й батальон',
            email: 'ivanov@military.gov',
            phone: '+7-900-123-4567',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: 'user-2',
            name: 'Майор Петров',
            rank: 'Майор',
            role: 'company_commander',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            unit: '1-я рота',
            email: 'petrov@military.gov',
            phone: '+7-900-234-5678',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];
        
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
      }
      
      throw new Error('Failed to fetch users');
    }
  });

export const getUserByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }: { input: any }) => {
    try {
      const connection = getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [input.id]
      );
      
      const users = rows as User[];
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      return users[0];
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      
      if (config.development.mockData) {
        const mockUser = {
          id: input.id,
          name: 'Mock User',
          rank: 'Капитан',
          role: 'officer',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          unit: 'Mock Unit',
          email: 'mock@military.gov',
          phone: '+7-900-000-0000',
          created_at: new Date(),
          updated_at: new Date(),
        };
        return mockUser;
      }
      
      throw new Error('User not found');
    }
  });

export const getUsersByUnitProcedure = publicProcedure
  .input(z.object({ unit: z.string() }))
  .query(async ({ input }: { input: any }) => {
    try {
      const connection = getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE unit = ? ORDER BY created_at DESC',
        [input.unit]
      );
      
      return rows as User[];
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
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.string().optional(),
    unit: z.string().optional(),
    avatar: z.string().optional(),
    rank: z.string().optional(),
    phone: z.string().optional(),
  }))
  .mutation(async ({ input }: { input: any }) => {
    try {
      const connection = getConnection();
      
      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      if (input.name) {
        updateFields.push('name = ?');
        updateValues.push(input.name);
      }
      if (input.email) {
        updateFields.push('email = ?');
        updateValues.push(input.email);
      }
      if (input.role) {
        updateFields.push('role = ?');
        updateValues.push(input.role);
      }
      if (input.unit) {
        updateFields.push('unit = ?');
        updateValues.push(input.unit);
      }
      if (input.avatar) {
        updateFields.push('avatar = ?');
        updateValues.push(input.avatar);
      }
      if (input.rank) {
        updateFields.push('rank = ?');
        updateValues.push(input.rank);
      }
      if (input.phone) {
        updateFields.push('phone = ?');
        updateValues.push(input.phone);
      }
      
      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(input.id);
      
      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      
      await connection.execute(query, updateValues);
      
      // Fetch and return updated user
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [input.id]
      );
      
      const users = rows as User[];
      if (users.length === 0) {
        throw new Error('User not found after update');
      }
      
      return users[0];
    } catch (error) {
      console.error('Error updating user:', error);
      
      if (config.development.mockData) {
        return {
          id: input.id,
          name: input.name || 'Mock User',
          rank: input.rank || 'Капитан',
          role: input.role || 'officer',
          avatar: input.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          unit: input.unit || 'Mock Unit',
          email: input.email || 'mock@military.gov',
          phone: input.phone || '+7-900-000-0000',
          created_at: new Date(),
          updated_at: new Date(),
        };
      }
      
      throw new Error('Failed to update user');
    }
  });

export const getCurrentUserProcedure = publicProcedure
  .query(async ({ ctx }) => {
    try {
      // In a real app, get user ID from JWT token in ctx
      // For now, return the first user as current user
      const connection = getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM users ORDER BY created_at ASC LIMIT 1'
      );
      
      const users = rows as User[];
      if (users.length === 0) {
        throw new Error('No users found');
      }
      
      return users[0];
    } catch (error) {
      console.error('Error fetching current user:', error);
      
      if (config.development.mockData) {
        return {
          id: 'user-1',
          name: 'Полковник Зингиев',
          rank: 'Полковник',
          role: 'battalion_commander',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          unit: '1-й батальон',
          email: 'ivanov@military.gov',
          phone: '+7-900-123-4567',
          created_at: new Date(),
          updated_at: new Date(),
        };
      }
      
      throw new Error('Failed to fetch current user');
    }
  });