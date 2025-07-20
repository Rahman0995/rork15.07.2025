export const config = {
  server: {
    port: parseInt(process.env.API_PORT || process.env.PORT || '3000'),
    host: process.env.API_HOST || '0.0.0.0',
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? (process.env.CORS_ORIGIN?.split(',') || ['https://yourdomain.com'])
        : true,
      credentials: true,
    },
  },
  database: {
    url: process.env.DATABASE_URL || process.env.MYSQL_MYSQL_URL || 'mysql://root:password@localhost:3306/rork_app',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: '7d',
  },
  development: {
    mockData: process.env.NODE_ENV !== 'production',
    enablePlayground: process.env.NODE_ENV !== 'production',
  },
  notifications: {
    push: {
      enabled: process.env.PUSH_NOTIFICATIONS_ENABLED === 'true',
    },
    email: {
      enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
    },
  },
  storage: {
    local: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
      uploadPath: process.env.UPLOAD_PATH || './uploads',
    },
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'pretty',
  },
};

export const validateConfig = () => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push('CORS_ORIGIN');
    
    // Проверяем что JWT_SECRET не дефолтный
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key' || 
        process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
      throw new Error('JWT_SECRET must be changed in production!');
    }
    
    // Проверяем минимальную длину JWT_SECRET
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long in production!');
    }
  }

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return true;
};

// Генерация безопасного JWT секрета
export const generateJWTSecret = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
};