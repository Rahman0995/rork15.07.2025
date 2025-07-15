import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { mockUsers } from '@/constants/mockData';

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }))
  .mutation(({ input }) => {
    // В реальном приложении здесь будет проверка пароля и создание JWT токена
    const user = mockUsers.find(u => u.email === input.email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Mock успешной аутентификации
    return {
      user,
      token: `mock_token_${user.id}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
    };
  });

export const logoutProcedure = publicProcedure
  .mutation(() => {
    // В реальном приложении здесь будет инвалидация токена
    return { success: true };
  });

export const refreshTokenProcedure = publicProcedure
  .input(z.object({
    token: z.string(),
  }))
  .mutation(({ input }) => {
    // В реальном приложении здесь будет проверка и обновление токена
    const userId = input.token.replace('mock_token_', '');
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('Invalid token');
    }
    
    return {
      user,
      token: `mock_token_${user.id}_refreshed`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  });

export const changePasswordProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    currentPassword: z.string(),
    newPassword: z.string().min(6),
  }))
  .mutation(({ input }) => {
    const user = mockUsers.find(u => u.id === input.userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // В реальном приложении здесь будет проверка текущего пароля и обновление
    return { success: true };
  });

export const resetPasswordProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
  }))
  .mutation(({ input }) => {
    const user = mockUsers.find(u => u.email === input.email);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // В реальном приложении здесь будет отправка email с ссылкой для сброса пароля
    return { 
      success: true, 
      message: 'Password reset instructions sent to your email' 
    };
  });