import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { sql } from 'drizzle-orm';

let db: ReturnType<typeof drizzle>;
let sqlite: Database.Database;

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('🔧 Initializing SQLite database...');
    
    // Create SQLite database
    sqlite = new Database('military_app.db');
    
    // Enable WAL mode for better performance
    sqlite.pragma('journal_mode = WAL');
    
    // Create drizzle instance
    db = drizzle(sqlite, { schema });
    
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
    
    if (sqlite) {
      sqlite.close();
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
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rank TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT NOT NULL,
      unit TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'draft',
      type TEXT DEFAULT 'text',
      unit TEXT,
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      current_approver TEXT,
      current_revision INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      assigned_to TEXT NOT NULL REFERENCES users(id),
      created_by TEXT NOT NULL REFERENCES users(id),
      due_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'medium',
      completed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      name TEXT,
      is_group INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_participants (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL REFERENCES chats(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL REFERENCES chats(id),
      sender_id TEXT NOT NULL REFERENCES users(id),
      text TEXT,
      type TEXT NOT NULL DEFAULT 'text',
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      location TEXT,
      organizer TEXT NOT NULL REFERENCES users(id),
      unit TEXT NOT NULL,
      color TEXT,
      is_all_day INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_participants (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES calendar_events(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      status TEXT DEFAULT 'invited',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      size INTEGER,
      duration INTEGER,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS report_comments (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL REFERENCES reports(id),
      author_id TEXT NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      is_revision INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS report_approvals (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL REFERENCES reports(id),
      approver_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL,
      comment TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS report_revisions (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL REFERENCES reports(id),
      version INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_by TEXT NOT NULL REFERENCES users(id),
      author_id TEXT NOT NULL REFERENCES users(id),
      changes TEXT,
      comment TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_activity_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      token TEXT NOT NULL UNIQUE,
      device_info TEXT,
      ip_address TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_activity TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL
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

  sqlite.exec(createTablesSQL);
};

const insertDefaultData = async () => {
  // Check if users already exist
  const existingUsers = sqlite.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (existingUsers.count === 0) {
    console.log('📝 Inserting default data...');
    
    // Insert default users
    const insertUser = sqlite.prepare(`
      INSERT INTO users (id, name, rank, role, avatar, unit, email, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

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
      insertUser.run(user.id, user.name, user.rank, user.role, user.avatar, user.unit, user.email, user.phone);
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