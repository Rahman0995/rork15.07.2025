import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req,
    // You can add more context items here like database connections, auth, etc.
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Добавляем дополнительную информацию об ошибке в development режиме
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
        }),
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

// Auth middleware defined here to avoid circular dependency
const authMiddleware = middleware(async ({ ctx, next }) => {
  // Mock authentication - in real app, verify JWT from request headers
  const mockUser = {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as const,
    unit: 'Security',
  };
  
  return next({
    ctx: {
      ...ctx,
      user: mockUser,
    },
  });
});

// Protected procedure with authentication
export const protectedProcedure = t.procedure.use(authMiddleware);