import { Context, Next } from 'hono';
import { config } from '../config';

// Rate limiting store (в production использовать Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimitMiddleware = () => {
  return async (c: Context, next: Next) => {
    const clientIP = c.req.header('x-forwarded-for') || 
                     c.req.header('x-real-ip') || 
                     c.env?.ip || 
                     'unknown';
    
    const key = `rate_limit:${clientIP}`;
    const now = Date.now();
    const windowMs = config.rateLimit.windowMs;
    const maxRequests = config.rateLimit.max;
    
    // Получаем текущие данные для IP
    let rateLimitData = rateLimitStore.get(key);
    
    // Если данных нет или окно истекло, создаем новые
    if (!rateLimitData || now > rateLimitData.resetTime) {
      rateLimitData = {
        count: 0,
        resetTime: now + windowMs
      };
    }
    
    // Увеличиваем счетчик
    rateLimitData.count++;
    rateLimitStore.set(key, rateLimitData);
    
    // Проверяем лимит
    if (rateLimitData.count > maxRequests) {
      const resetIn = Math.ceil((rateLimitData.resetTime - now) / 1000);
      
      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', resetIn.toString());
      
      return c.json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
        retryAfter: resetIn
      }, 429);
    }
    
    // Добавляем заголовки с информацией о лимитах
    const remaining = Math.max(0, maxRequests - rateLimitData.count);
    const resetIn = Math.ceil((rateLimitData.resetTime - now) / 1000);
    
    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', resetIn.toString());
    
    await next();
  };
};

export const securityHeadersMiddleware = () => {
  return async (c: Context, next: Next) => {
    await next();
    
    // Security headers
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    if (process.env.NODE_ENV === 'production') {
      c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
  };
};

export const requestValidationMiddleware = () => {
  return async (c: Context, next: Next) => {
    // Проверка размера запроса
    const contentLength = c.req.header('content-length');
    if (contentLength && parseInt(contentLength) > config.storage.local.maxFileSize) {
      return c.json({
        error: 'Payload Too Large',
        message: `Request size exceeds maximum allowed size of ${config.storage.local.maxFileSize} bytes`
      }, 413);
    }
    
    // Проверка Content-Type для POST/PUT запросов
    const method = c.req.method;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = c.req.header('content-type');
      if (contentType && !contentType.includes('application/json') && 
          !contentType.includes('multipart/form-data') &&
          !contentType.includes('application/x-www-form-urlencoded')) {
        return c.json({
          error: 'Unsupported Media Type',
          message: 'Content-Type must be application/json, multipart/form-data, or application/x-www-form-urlencoded'
        }, 415);
      }
    }
    
    await next();
  };
};

// Очистка старых записей rate limit (запускать периодически)
export const cleanupRateLimit = () => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

// Запускаем очистку каждые 5 минут
setInterval(cleanupRateLimit, 5 * 60 * 1000);