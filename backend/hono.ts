import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { config, validateConfig } from "./config";
import { initializeDatabase, closeDatabase } from "./database";
import { 
  rateLimitMiddleware, 
  securityHeadersMiddleware, 
  requestValidationMiddleware 
} from "./middleware/security";
import crypto from "crypto";

// Валидация конфигурации при запуске
try {
  validateConfig();
  console.log('✅ Configuration validated successfully');
} catch (error) {
  console.error('❌ Configuration validation failed:', error);
  process.exit(1);
}

// app will be mounted at /api
const app = new Hono();

// Security middleware (применяется первым)
app.use("*", securityHeadersMiddleware());
app.use("*", requestValidationMiddleware());

// Rate limiting (только в production)
if (process.env.NODE_ENV === 'production') {
  app.use("*", rateLimitMiddleware());
}

// Logging middleware
app.use("*", logger());
app.use("*", prettyJSON());

// Enable CORS for all routes
app.use("*", cors({
  origin: config.server.cors.origin === true ? '*' : config.server.cors.origin as string[],
  credentials: config.server.cors.credentials,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
    onError: ({ error, path, type, input }) => {
      console.error(`❌ tRPC Error on ${type} ${path}:`, {
        error: error.message,
        code: error.code,
        input,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    },
    batching: {
      enabled: true,
    },
  })
);

// API информация
app.get("/", (c) => {
  return c.json({ 
    name: "Military Management System API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: "/api/health",
      trpc: "/api/trpc",
      docs: "/api/docs"
    }
  });
});

// Health check endpoint
app.get("/health", async (c) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: "connected", // В реальном приложении проверить подключение к БД
      redis: "connected",    // В реальном приложении проверить подключение к Redis
    }
  };
  
  return c.json(health);
});

// Supabase SMS Webhook endpoint
app.post("/webhooks/supabase/sms", async (c) => {
  try {
    const body = await c.req.text();
    const signature = c.req.header('x-supabase-signature');
    
    // Получаем webhook secret из переменных окружения
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET || 'v1,whsec_ll6hvMMRV620VYFElyWffcT7PhKszRkpjf/kdVds8VZOWHCwxqFBo18/sle4qvMUxi0nfLO3HkZH2AW';
    
    // Верификация подписи webhook
    if (signature && webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret.replace('v1,whsec_', ''))
        .update(body, 'utf8')
        .digest('base64');
      
      if (signature !== `v1=${expectedSignature}`) {
        console.error('❌ Invalid webhook signature');
        return c.json({ error: 'Invalid signature' }, 401);
      }
    }
    
    const payload = JSON.parse(body);
    
    console.log('📱 Supabase SMS Webhook received:', {
      type: payload.type,
      timestamp: new Date().toISOString(),
    });

    // Обработка различных типов событий
    switch (payload.type) {
      case 'user.created':
        console.log('👤 New user created via SMS:', payload.record?.email);
        break;
        
      case 'user.updated':
        console.log('👤 User updated via SMS:', payload.record?.email);
        break;
        
      case 'user.deleted':
        console.log('👤 User deleted:', payload.old_record?.email);
        break;
        
      default:
        console.log(`📱 Unhandled SMS webhook type: ${payload.type}`);
    }

    return c.json({
      success: true,
      message: 'SMS webhook processed successfully',
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Error processing SMS webhook:', error);
    return c.json({ 
      error: 'Failed to process webhook',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// Endpoint для получения конфигурации (только публичные данные)
app.get("/config", (c) => {
  return c.json({
    server: {
      environment: process.env.NODE_ENV || 'development',
    },
    features: {
      mockData: config.development.mockData,
      playground: config.development.enablePlayground,
      pushNotifications: config.notifications.push.enabled,
      emailNotifications: config.notifications.email.enabled,
    },
    limits: {
      maxFileSize: config.storage.local.maxFileSize,
      rateLimit: {
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
      },
    },
  });
});

// Endpoint для метрик (в реальном приложении защитить авторизацией)
app.get("/metrics", (c) => {
  return c.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    // В реальном приложении добавить метрики приложения
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: "Not Found",
    message: "The requested endpoint does not exist",
    timestamp: new Date().toISOString(),
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('❌ Unhandled error:', err);
  
  return c.json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong",
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  }, 500);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

// Initialize database on startup
console.log('🔧 Initializing database connection...');
initializeDatabase().then((success) => {
  if (success) {
    console.log('✅ Database initialized successfully');
    if (config.development.mockData) {
      console.log('🔧 Mock data fallback is enabled for development');
    }
  } else {
    console.error('❌ Failed to initialize database');
    if (config.development.mockData) {
      console.log('🔧 Continuing with mock data fallback');
    } else {
      process.exit(1);
    }
  }
});

export default app;