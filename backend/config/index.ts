export const config = {
  server: {
    port: process.env.PORT || 3000,
    cors: {
      origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : true,
      credentials: true,
    },
  },
  development: {
    mockData: true,
    enablePlayground: true,
  },
  notifications: {
    push: {
      enabled: false,
    },
    email: {
      enabled: false,
    },
  },
  storage: {
    local: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};

export const validateConfig = () => {
  // Add validation logic here if needed
  return true;
};