import { TRPCError } from '@trpc/server';
import { requireRole, User } from '../utils/auth';

// Note: Auth middleware is defined in create-context.ts to avoid circular dependency

// Helper function to create role-based middleware
export const createRoleMiddleware = (requiredRole: User['role']) => {
  return async ({ ctx, next }: { ctx: any; next: any }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }
    
    try {
      requireRole(ctx.user, requiredRole);
      return next({ ctx });
    } catch (error) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `${requiredRole} access required`,
      });
    }
  };
};

// Rate limiting middleware
export const rateLimitMiddleware = middleware(async ({ ctx, next }) => {
  // Mock rate limiting - in real app, use Redis or similar
  console.log('Rate limit check for request');
  return next({ ctx });
});

// Logging middleware
export const loggingMiddleware = middleware(async ({ ctx, next }) => {
  const start = Date.now();
  const result = await next({ ctx });
  const duration = Date.now() - start;
  
  console.log(`Request completed in ${duration}ms`);
  return result;
});

// Input validation middleware
export const validationMiddleware = middleware(async ({ ctx, next }) => {
  // Additional validation logic can be added here
  return next({ ctx });
});