import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { sql } from 'drizzle-orm';
import { config } from '../config';
import type { MySql2Database } from 'drizzle-orm/mysql2';

let db: MySql2Database<typeof schema>;
let connection: mysql.Connection;

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('🔧 Initializing MySQL database...');
    
    // Create MySQL connection
    connection = await mysql.createConnection(config.database.url);
    
    // Create drizzle instance
    db = drizzle(connection, { schema });
    
    // Create tables if they don't exist
    await createTables();
    
    // Insert default data
    await insertDefaultData();
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    return false;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Closing database connections...');
    
    if (connection) {
      await connection.end();
    }
    
    console.log('✅ Database connections closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};

const createTables = async () => {
  // Create tables using raw SQL since we don't have migrations set up
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      rank VARCHAR(100) NOT NULL,
      role VARCHAR(100) NOT NULL,
      avatar TEXT NOT NULL,
      unit VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      author_id VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      type VARCHAR(50) DEFAULT 'text',
      unit VARCHAR(255),
      priority VARCHAR(50) DEFAULT 'medium',
      due_date DATETIME,
      current_approver VARCHAR(255),
      current_revision INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT NOT NULL,
      assigned_to VARCHAR(255) NOT NULL,
      created_by VARCHAR(255) NOT NULL,
      due_date DATETIME NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      priority VARCHAR(50) NOT NULL DEFAULT 'medium',
      completed_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS chats (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      is_group BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_participants (
      id VARCHAR(255) PRIMARY KEY,
      chat_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id VARCHAR(255) PRIMARY KEY,
      chat_id VARCHAR(255) NOT NULL,
      sender_id VARCHAR(255) NOT NULL,
      text TEXT,
      type VARCHAR(50) NOT NULL DEFAULT 'text',
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      location VARCHAR(500),
      organizer VARCHAR(255) NOT NULL,
      unit VARCHAR(255) NOT NULL,
      color VARCHAR(20),
      is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organizer) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS event_participants (
      id VARCHAR(255) PRIMARY KEY,
      event_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'invited',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES calendar_events(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(500) NOT NULL,
      type VARCHAR(100) NOT NULL,
      url TEXT NOT NULL,
      size BIGINT,
      duration INT,
      entity_type VARCHAR(100) NOT NULL,
      entity_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS report_comments (
      id VARCHAR(255) PRIMARY KEY,
      report_id VARCHAR(255) NOT NULL,
      author_id VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      is_revision BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES reports(id),
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS report_approvals (
      id VARCHAR(255) PRIMARY KEY,
      report_id VARCHAR(255) NOT NULL,
      approver_id VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES reports(id),
      FOREIGN KEY (approver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS report_revisions (
      id VARCHAR(255) PRIMARY KEY,
      report_id VARCHAR(255) NOT NULL,
      version INT NOT NULL,
      title VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      created_by VARCHAR(255) NOT NULL,
      author_id VARCHAR(255) NOT NULL,
      changes TEXT,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES reports(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(500) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(100) NOT NULL,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      data TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_activity_log (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      action VARCHAR(255) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id VARCHAR(255),
      details TEXT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      token VARCHAR(500) NOT NULL UNIQUE,
      device_info TEXT,
      ip_address VARCHAR(45),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_reports_author_id ON reports(author_id);
    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
    CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);
    CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
    CREATE INDEX IF NOT EXISTS idx_calendar_events_organizer ON calendar_events(organizer);
    CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
    CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
  `;

  await connection.execute(createTablesSQL);
};

const insertDefaultData = async () => {
  // Check if users already exist
  const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
  const existingUsers = rows as { count: number }[];
  
  if (existingUsers[0].count === 0) {
    console.log('📝 Inserting default data...');
    
    const defaultUsers = [
      {
        id: 'user-1',
        name: 'Полковник Зингиев',
        rank: 'Полковник',
        role: 'battalion_commander',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        unit: '1-й батальон',
        email: 'ivanov@military.gov',
        phone: '+7-900-123-4567'
      },
      {
        id: 'user-2',
        name: 'Майор Петров',
        rank: 'Майор',
        role: 'company_commander',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        unit: '1-я рота',
        email: 'petrov@military.gov',
        phone: '+7-900-234-5678'
      },
      {
        id: 'user-3',
        name: 'Капитан Сидоров',
        rank: 'Капитан',
        role: 'officer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        unit: '2-я рота',
        email: 'sidorov@military.gov',
        phone: '+7-900-345-6789'
      },
      {
        id: 'user-4',
        name: 'Сержант Козлов',
        rank: 'Сержант',
        role: 'soldier',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
        unit: '1-я рота',
        email: 'kozlov@military.gov',
        phone: '+7-900-456-7890'
      }
    ];

    for (const user of defaultUsers) {
      await connection.execute(
        'INSERT INTO users (id, name, rank, role, avatar, unit, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.name, user.rank, user.role, user.avatar, user.unit, user.email, user.phone]
      );
    }

    console.log('✅ Default data inserted successfully');
  }
};

export const getDatabase = () => {
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
    const database = getDatabase();
    
    await database.insert(schema.userActivityLog).values({
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      entityType,
      entityId,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('Failed to log user activity:', error);
  }
};

export { schema };