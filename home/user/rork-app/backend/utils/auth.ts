// Утилиты для аутентификации и авторизации
// В реальном приложении здесь будет работа с JWT токенами, bcrypt для хеширования паролей и т.д.

import { mockUsers } from '../../constants/mockData';
import type { User, UserRole } from '../../types';

// Mock функции для демонстрации
export function hashPassword(password: string): string {
  // В реальном приложении используйте bcrypt
  return `hashed_${password}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  // В реальном приложении используйте bcrypt.compare
  return hashedPassword === `hashed_${password}`;
}

export function generateToken(user: User): string {
  // В реальном приложении используйте jsonwebtoken
  return `mock_token_${user.id}_${Date.now()}`;
}

export function verifyToken(token: string): { userId: string; valid: boolean } {
  // В реальном приложении используйте jsonwebtoken.verify
  if (!token.startsWith('mock_token_')) {
    return { userId: '', valid: false };
  }
  
  const parts = token.split('_');
  if (parts.length < 3) {
    return { userId: '', valid: false };
  }
  
  const userId = parts[2];
  const timestamp = parseInt(parts[3]);
  const now = Date.now();
  
  // Токен действителен 24 часа
  const isExpired = now - timestamp > 24 * 60 * 60 * 1000;
  
  return {
    userId,
    valid: !isExpired && mockUsers.some(u => u.id === userId),
  };
}

export function refreshToken(oldToken: string): string | null {
  const { userId, valid } = verifyToken(oldToken);
  
  if (!valid) {
    return null;
  }
  
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return null;
  }
  
  return generateToken(user);
}

// Функции для проверки прав доступа
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    soldier: 1,
    officer: 2,
    company_commander: 3,
    battalion_commander: 4,
    admin: 5,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canAccessReport(user: User, reportAuthorId: string): boolean {
  // Пользователь может видеть свои отчеты
  if (user.id === reportAuthorId) {
    return true;
  }
  
  // Командиры могут видеть отчеты подчиненных
  return hasPermission(user.role, 'officer');
}

export function canEditReport(user: User, reportAuthorId: string): boolean {
  // Только автор может редактировать отчет
  if (user.id === reportAuthorId) {
    return true;
  }
  
  // Командиры могут редактировать отчеты подчиненных
  return hasPermission(user.role, 'company_commander');
}

export function canDeleteReport(user: User, reportAuthorId: string): boolean {
  // Только автор или командир батальона может удалить отчет
  if (user.id === reportAuthorId) {
    return true;
  }
  
  return hasPermission(user.role, 'battalion_commander');
}

export function canApproveReport(user: User): boolean {
  // Только офицеры и выше могут утверждать отчеты
  return hasPermission(user.role, 'officer');
}