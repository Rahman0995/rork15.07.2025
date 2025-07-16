import { Context } from '../trpc/create-context';

// Mock user type
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'manager';
  unit?: string;
}

// Mock authentication utilities
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    unit: 'Security',
  },
  {
    id: '2',
    email: 'manager@example.com',
    name: 'Manager User',
    role: 'manager',
    unit: 'Operations',
  },
  {
    id: '3',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
    unit: 'Field',
  },
];

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  // Mock authentication - in real app, verify against database
  if (email === 'admin@example.com' && password === 'password') {
    return mockUsers[0];
  }
  if (email === 'manager@example.com' && password === 'password') {
    return mockUsers[1];
  }
  if (email === 'user@example.com' && password === 'password') {
    return mockUsers[2];
  }
  return null;
};

export const getUserById = async (id: string): Promise<User | null> => {
  return mockUsers.find(user => user.id === id) || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return mockUsers.find(user => user.email === email) || null;
};

export const generateToken = (user: User): string => {
  // Mock JWT token generation
  return `mock-jwt-token-${user.id}`;
};

export const generateRefreshToken = (user: User): string => {
  // Mock refresh token generation
  return `mock-refresh-token-${user.id}`;
};

export const verifyToken = async (token: string): Promise<User | null> => {
  // Mock token verification
  if (token.startsWith('mock-jwt-token-')) {
    const userId = token.replace('mock-jwt-token-', '');
    return getUserById(userId);
  }
  return null;
};

export const verifyRefreshToken = async (refreshToken: string): Promise<User | null> => {
  // Mock refresh token verification
  if (refreshToken.startsWith('mock-refresh-token-')) {
    const userId = refreshToken.replace('mock-refresh-token-', '');
    return getUserById(userId);
  }
  return null;
};

export const hashPassword = async (password: string): Promise<string> => {
  // Mock password hashing - in real app, use bcrypt
  return `hashed-${password}`;
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  // Mock password comparison
  return hashedPassword === `hashed-${password}`;
};

// Authorization helpers
export const requireAuth = (ctx: Context): User => {
  // Mock auth check - in real app, verify JWT from request headers
  const mockUser = mockUsers[0]; // Always return admin for mock
  if (!mockUser) {
    throw new Error('Unauthorized');
  }
  return mockUser;
};

export const requireRole = (user: User, requiredRole: User['role']): void => {
  const roleHierarchy = { admin: 3, manager: 2, user: 1 };
  if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    throw new Error('Insufficient permissions');
  }
};

export const canAccessUnit = (user: User, targetUnit?: string): boolean => {
  if (user.role === 'admin') return true;
  if (!targetUnit) return true;
  return user.unit === targetUnit;
};