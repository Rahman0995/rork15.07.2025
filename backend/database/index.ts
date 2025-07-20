import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { runMigrations } from './migrations';

let db: mysql.Connection | null = null;

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('🔧 Initializing MySQL database...');
    
    // Create MySQL connection
    db = await mysql.createConnection({
      uri: config.database.url,
      timezone: '+00:00',
      dateStrings: false,
      supportBigNumbers: true,
      bigNumberStrings: false,
    });
    
    // Test connection
    await db.ping();
    console.log('✅ Database connection established');
    
    // Run migrations
    const migrationSuccess = await runMigrations(db);
    if (!migrationSuccess) {
      console.error('❌ Migration failed');
      return false;
    }
    
    // Insert default data if needed
    await insertDefaultData();
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    
    // Fallback to mock data in development
    if (config.development.mockData) {
      console.log('🔧 Using mock data fallback');
      return true;
    }
    
    return false;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Closing database connections...');
    
    if (db) {
      await db.end();
      db = null;
    }
    
    console.log('✅ Database connections closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};

// Таблицы теперь создаются через миграции

const insertDefaultData = async () => {
  if (!db) return;
  
  try {
    // Check if users already exist
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM users');
    const count = (rows as any)[0].count;
    
    if (count === 0) {
      console.log('📝 Inserting default data...');
      
      const defaultUsers = [
        {
          id: 'user-1',
          email: 'admin@military.gov',
          password_hash: '$2b$10$example.hash.for.demo.purposes.only',
          first_name: 'Иван',
          last_name: 'Зингиев',
          rank: 'Полковник',
          role: 'admin',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          unit: '1-й батальон',
          phone: '+7-900-123-4567'
        },
        {
          id: 'user-2',
          email: 'petrov@military.gov',
          password_hash: '$2b$10$example.hash.for.demo.purposes.only',
          first_name: 'Алексей',
          last_name: 'Петров',
          rank: 'Майор',
          role: 'officer',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          unit: '1-я рота',
          phone: '+7-900-234-5678'
        },
        {
          id: 'user-3',
          email: 'sidorov@military.gov',
          password_hash: '$2b$10$example.hash.for.demo.purposes.only',
          first_name: 'Михаил',
          last_name: 'Сидоров',
          rank: 'Капитан',
          role: 'officer',
          avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          unit: '2-я рота',
          phone: '+7-900-345-6789'
        },
        {
          id: 'user-4',
          email: 'kozlov@military.gov',
          password_hash: '$2b$10$example.hash.for.demo.purposes.only',
          first_name: 'Сергей',
          last_name: 'Козлов',
          rank: 'Сержант',
          role: 'soldier',
          avatar_url: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
          unit: '1-я рота',
          phone: '+7-900-456-7890'
        }
      ];

      for (const user of defaultUsers) {
        await db.execute(
          'INSERT INTO users (id, email, password_hash, first_name, last_name, rank, role, avatar_url, unit, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [user.id, user.email, user.password_hash, user.first_name, user.last_name, user.rank, user.role, user.avatar_url, user.unit, user.phone]
        );
      }

      console.log('✅ Default data inserted successfully');
    }
  } catch (error) {
    console.error('❌ Failed to insert default data:', error);
  }
};

export const getConnection = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

export const logUserActivity = async (
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    const conn = getConnection();
    
    // В MySQL нет user_activity_log таблицы в миграциях, добавим позже
    // Пока просто логируем в консоль
    console.log('User Activity:', {
      userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log user activity:', error);
  }
};