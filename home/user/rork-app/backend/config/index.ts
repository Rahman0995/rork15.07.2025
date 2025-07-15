// Конфигурация для backend приложения

export const config = {
  // Настройки сервера
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    cors: {
      origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:8081'],
      credentials: true,
    },
  },

  // Настройки базы данных
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/military_app',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    ssl: process.env.NODE_ENV === 'production',
  },

  // Настройки аутентификации
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  },

  // Настройки файлового хранилища
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local', // 'local', 's3', 'gcs'
    local: {
      uploadDir: process.env.UPLOAD_DIR || './uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    },
    s3: {
      bucket: process.env.S3_BUCKET || '',
      region: process.env.S3_REGION || 'us-east-1',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
  },

  // Настройки Redis (для кеширования и сессий)
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: parseInt(process.env.REDIS_TTL || '3600'), // 1 час
  },

  // Настройки email
  email: {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
    from: process.env.EMAIL_FROM || 'noreply@military-app.com',
  },

  // Настройки логирования
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    file: process.env.LOG_FILE || './logs/app.log',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
    maxSize: process.env.LOG_MAX_SIZE || '10m',
  },

  // Настройки rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 минут
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // максимум запросов за окно
    message: 'Too many requests from this IP, please try again later.',
  },

  // Настройки уведомлений
  notifications: {
    push: {
      enabled: process.env.PUSH_NOTIFICATIONS_ENABLED === 'true',
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
      vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
    },
    email: {
      enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
    },
  },

  // Настройки безопасности
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    },
    session: {
      secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 часа
    },
  },

  // Настройки для разработки
  development: {
    mockData: process.env.USE_MOCK_DATA === 'true',
    seedDatabase: process.env.SEED_DATABASE === 'true',
    enablePlayground: process.env.ENABLE_PLAYGROUND === 'true',
  },

  // Настройки мониторинга
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    endpoint: process.env.MONITORING_ENDPOINT || '',
    apiKey: process.env.MONITORING_API_KEY || '',
  },
};

// Валидация конфигурации
export function validateConfig() {
  const requiredEnvVars = [];

  if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push(
      'JWT_SECRET',
      'DATABASE_URL',
      'SESSION_SECRET'
    );
  }

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Дополнительные проверки
  if (config.auth.jwtSecret === 'your-secret-key-change-in-production' && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be changed in production');
  }

  if (config.security.session.secret === 'your-session-secret-change-in-production' && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be changed in production');
  }
}

// Экспорт отдельных секций конфигурации для удобства
export const {
  server,
  database,
  auth,
  storage,
  redis,
  email,
  logging,
  rateLimit,
  notifications,
  security,
  development,
  monitoring,
} = config;