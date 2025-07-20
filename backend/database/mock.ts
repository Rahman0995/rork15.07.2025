// Mock database для разработки без реальной БД

export const initializeMockDatabase = async (): Promise<boolean> => {
  console.log('🔧 Initializing mock database...');
  
  // Имитируем задержку инициализации
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('✅ Mock database initialized successfully');
  return true;
};

export const closeMockDatabase = async (): Promise<void> => {
  console.log('🔄 Closing mock database connections...');
  console.log('✅ Mock database connections closed successfully');
};

export const getMockConnection = () => {
  return {
    execute: async (query: string, params?: any[]) => {
      console.log('Mock DB Query:', query, params);
      return [[], {}];
    },
    ping: async () => {
      return true;
    },
    end: async () => {
      return true;
    }
  };
};

export const logMockUserActivity = async (
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
) => {
  console.log('Mock User Activity:', {
    userId,
    action,
    entityType,
    entityId,
    details,
    ipAddress,
    userAgent,
    timestamp: new Date().toISOString()
  });
};