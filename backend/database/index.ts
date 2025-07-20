import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { runMigrations } from './migrations';

let mysqlDb: mysql.Connection | null = null;
let sqliteDb: Database.Database | null = null;

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    if (config.database.useSqlite) {
      console.log('🔧 Initializing SQLite database...');
      
      // Ensure data directory exists
      const fs = require('fs');
      const path = require('path');
      const dbPath = '/app/data/database.sqlite';
      const dbDir = path.dirname(dbPath);
      
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      sqliteDb = new Database(dbPath);
      sqliteDb.pragma('journal_mode = WAL');
      
      console.log('✅ SQLite database connection established');
      
      // Run migrations for SQLite
      await runSQLiteMigrations();
      
      // Insert default data if needed
      await insertDefaultDataSQLite();
      
    } else {
      console.log('🔧 Initializing MySQL database...');
      
      // Create MySQL connection
      mysqlDb = await mysql.createConnection({
        uri: config.database.url,
        timezone: '+00:00',
        dateStrings: false,
        supportBigNumbers: true,
        bigNumberStrings: false,
      });
      
      // Test connection
      await mysqlDb.ping();
      console.log('✅ MySQL database connection established');
      
      // Run migrations
      const migrationSuccess = await runMigrations(mysqlDb);
      if (!migrationSuccess) {
        console.error('❌ Migration failed');
        return false;
      }
      
      // Insert default data if needed
      await insertDefaultData();
    }
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    
    // Always fallback to mock data in development
    console.log('🔧 Using mock data fallback for development');
    return true;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Closing database connections...');
    
    if (mysqlDb) {
      await mysqlDb.end();
      mysqlDb = null;
    }
    
    if (sqliteDb) {
      sqliteDb.close();
      sqliteDb = null;
    }
    
    console.log('✅ Database connections closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};

const runSQLiteMigrations = async () => {
  if (!sqliteDb) return;
  
  try {
    // Create users table
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        rank TEXT,
        role TEXT DEFAULT 'soldier',
        avatar_url TEXT,
        unit TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create tasks table
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        assigned_to TEXT,
        created_by TEXT,
        due_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    
    // Create reports table
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        type TEXT DEFAULT 'general',
        status TEXT DEFAULT 'draft',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    
    console.log('✅ SQLite migrations completed');
  } catch (error) {
    console.error('❌ SQLite migration failed:', error);
  }
};

const insertDefaultDataSQLite = async () => {
  if (!sqliteDb) return;
  
  try {
    // Check if users already exist
    const count = sqliteDb.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    
    if (count.count === 0) {
      console.log('📝 Inserting default data into SQLite...');
      
      const insertUser = sqliteDb.prepare(`
        INSERT INTO users (id, email, password_hash, first_name, last_name, rank, role, avatar_url, unit, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
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
        }
      ];

      for (const user of defaultUsers) {
        insertUser.run(
          user.id, user.email, user.password_hash, user.first_name, 
          user.last_name, user.rank, user.role, user.avatar_url, 
          user.unit, user.phone
        );
      }

      console.log('✅ Default SQLite data inserted successfully');
    }
  } catch (error) {
    console.error('❌ Failed to insert default SQLite data:', error);
  }
};

// Таблицы теперь создаются через миграции

const insertDefaultData = async () => {
  if (!mysqlDb) return;
  
  try {
    // Check if users already exist
    const [rows] = await mysqlDb.execute('SELECT COUNT(*) as count FROM users');
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
        await mysqlDb.execute(
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
  if (config.database.useSqlite) {
    if (!sqliteDb) {
      throw new Error('SQLite database not initialized. Call initializeDatabase() first.');
    }
    return sqliteDb;
  } else {
    if (!mysqlDb) {
      throw new Error('MySQL database not initialized. Call initializeDatabase() first.');
    }
    return mysqlDb;
  }
};

export const getSQLiteDb = () => sqliteDb;
export const getMySQLDb = () => mysqlDb;

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