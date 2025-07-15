import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { mockUsers, getUser, getUnitUsers } from '@/constants/mockData';

export const getUsersProcedure = publicProcedure
  .query(() => {
    return mockUsers;
  });

export const getUserByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    const user = getUser(input.id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  });

export const getUsersByUnitProcedure = publicProcedure
  .input(z.object({ unit: z.string() }))
  .query(({ input }) => {
    return getUnitUsers(input.unit);
  });

export const updateUserProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    name: z.string().optional(),
    rank: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    unit: z.string().optional(),
  }))
  .mutation(({ input }) => {
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
    // В реальном приложении здесь будет получение текущего пользователя из контекста/токена
    return mockUsers[0]; // Возвращаем первого пользователя как текущего
  });