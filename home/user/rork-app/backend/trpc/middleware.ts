import { TRPCError } from '@trpc/server';
import { middleware } from './create-context';

// Middleware для логирования запросов
export const loggingMiddleware = middleware(async ({ path, type, next }) => {
  const start = Date.now();
  
  console.log(`[${new Date().toISOString()}] ${type.toUpperCase()} ${path} - START`);
  
  const result = await next();
  
  const duration = Date.now() - start;
  
  if (result.ok) {
    console.log(`[${new Date().toISOString()}] ${type.toUpperCase()} ${path} - SUCCESS (${duration}ms)`);
  } else {
    console.error(`[${new Date().toISOString()}] ${type.toUpperCase()} ${path} - ERROR (${duration}ms):`, result.error);
  }
  
  return result;
});

// Middleware для проверки аутентификации
export const authMiddleware = middleware(async ({ ctx, next }) => {
  // В реальном приложении здесь будет проверка JWT токена
  const authHeader = ctx.req?.headers?.get?.('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  
  const token = authHeader.substring(7);
  
  // Mock проверка токена
  if (!token.startsWith('mock_token_')) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid token',
    });
  }
  
  const userId = token.replace('mock_token_', '').split('_')[0];
  
  return next({
    ctx: {
      ...ctx,
      user: {
        id: userId,
        // В реальном приложении здесь будут данные пользователя из токена
      },
    },
  });
});

// Middleware для проверки прав доступа
export const roleMiddleware = (allowedRoles: string[]) => {
  return middleware(async ({ ctx, next }) => {
    // В реальном приложении здесь будет проверка роли пользователя
    const userRole = 'admin'; // Mock роль
    
    if (!allowedRoles.includes(userRole)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      });
    }
    
    return next();
  });
};

// Middleware для валидации входных данных
export const validationMiddleware = middleware(async ({ input, next }) => {
  // Дополнительная валидация, если нужна
  // Zod уже обрабатывает основную валидацию
  
  return next();
});

// Middleware для обработки ошибок
export const errorHandlingMiddleware = middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    // Логирование ошибки
    console.error('TRPC Error:', error);
    
    // Преобразование ошибок в стандартный формат
    if (error instanceof TRPCError) {
      throw error;
    }
    
    // Обработка неожиданных ошибок
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      cause: error,
    });
  }
});

// Middleware для ограничения частоты запросов (rate limiting)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 60000) => {
  return middleware(async ({ ctx, next }) => {
    const clientId = ctx.req?.headers?.get?.('x-forwarded-for') || ctx.req?.headers?.get?.('x-real-ip') || 'unknown';
    const now = Date.now();
    
    const clientData = requestCounts.get(clientId as string);
    
    if (!clientData || now > clientData.resetTime) {
      requestCounts.set(clientId as string, {
        count: 1,
        resetTime: now + windowMs,
      });
    } else {
      clientData.count++;
      
      if (clientData.count > maxRequests) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded',
        });
      }
    }
    
    return next();
  });
};