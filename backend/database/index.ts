import Database from 'better-sqlite3';
import { config } from '../config';
import path from 'path';

let db: Database.Database;

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('🔧 Initializing SQLite database...');
    
    // Create SQLite database
    const dbPath = path.join(process.cwd(), 'database.sqlite');
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create tables if they don't exist
    createTables();
    
    // Insert default data
    insertDefaultData();
    
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
    
    if (db) {
      db.close();
    }
    
    console.log('✅ Database connections closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};

const createTables = () => {
  // Create tables using SQLite syntax
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rank TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT NOT NULL,
      unit TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      type TEXT DEFAULT 'text',
      unit TEXT,
      priority TEXT DEFAULT 'medium',
      due_date DATETIME,
      current_approver TEXT,
      current_revision INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      assigned_to TEXT NOT NULL,
      created_by TEXT NOT NULL,
      due_date DATETIME NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'medium',
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      name TEXT,
      is_group INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS chat_participants (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      text TEXT,
      type TEXT NOT NULL DEFAULT 'text',
      read INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      location TEXT,
      organizer TEXT NOT NULL,
      unit TEXT NOT NULL,
      color TEXT,
      is_all_day INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizer) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS event_participants (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'invited',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES calendar_events(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      size INTEGER,
      duration INTEGER,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS report_comments (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      content TEXT NOT NULL,
      is_revision INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES reports(id),
      FOREIGN KEY (author_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS report_approvals (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      approver_id TEXT NOT NULL,
      status TEXT NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES reports(id),
      FOREIGN KEY (approver_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS report_revisions (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_by TEXT NOT NULL,
      author_id TEXT NOT NULL,
      changes TEXT,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES reports(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (author_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS user_activity_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      device_info TEXT,
      ip_address TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`
  ];

  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_reports_author_id ON reports(author_id)',
    'CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
    'CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id)',
    'CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id)',
    'CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_events_organizer ON calendar_events(organizer)',
    'CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id)',
    'CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token)'
  ];

  // Execute table creation
  for (const table of tables) {
    db.exec(table);
  }

  // Execute index creation
  for (const index of indexes) {
    db.exec(index);
  }
};

const insertDefaultData = () => {
  // Check if users already exist
  const result = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (result.count === 0) {
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

    const insertUser = db.prepare('INSERT INTO users (id, name, rank, role, avatar, unit, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const user of defaultUsers) {
      insertUser.run(user.id, user.name, user.rank, user.role, user.avatar, user.unit, user.email, user.phone);
    }

    // Insert sample tasks
    const sampleTasks = [
      {
        id: 'task-1',
        title: 'Проверка оборудования',
        description: 'Провести плановую проверку всего оборудования в секторе А.',
        assignedTo: 'user-2',
        createdBy: 'user-1',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'task-2',
        title: 'Обновление документации',
        description: 'Обновить техническую документацию по новым стандартам.',
        assignedTo: 'user-3',
        createdBy: 'user-1',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_progress',
        priority: 'medium'
      },
      {
        id: 'task-3',
        title: 'Патрулирование периметра',
        description: 'Выполнить вечернее патрулирование периметра объекта.',
        assignedTo: 'user-4',
        createdBy: 'user-2',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'high'
      }
    ];

    const insertTask = db.prepare('INSERT INTO tasks (id, title, description, assigned_to, created_by, due_date, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const task of sampleTasks) {
      insertTask.run(task.id, task.title, task.description, task.assignedTo, task.createdBy, task.dueDate, task.status, task.priority);
    }

    // Insert sample reports
    const sampleReports = [
      {
        id: 'report-1',
        title: 'Отчет о проведении учений',
        content: 'Проведены плановые учения по тактической подготовке. Все задачи выполнены в срок.',
        authorId: 'user-1',
        status: 'pending',
        type: 'text',
        unit: '1-й батальон',
        priority: 'high',
        currentRevision: 1
      },
      {
        id: 'report-2',
        title: 'Отчет о техническом обслуживании',
        content: 'Выполнено плановое техническое обслуживание оборудования. Выявлены незначительные неисправности.',
        authorId: 'user-2',
        status: 'approved',
        type: 'text',
        unit: 'Техническая служба',
        priority: 'medium',
        currentRevision: 1
      },
      {
        id: 'report-3',
        title: 'Инцидент в секторе Б',
        content: 'Зафиксирован незначительный инцидент в секторе Б. Приняты необходимые меры.',
        authorId: 'user-3',
        status: 'needs_revision',
        type: 'incident',
        unit: '2-я рота',
        priority: 'high',
        currentRevision: 1
      }
    ];

    const insertReport = db.prepare('INSERT INTO reports (id, title, content, author_id, status, type, unit, priority, current_revision) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const report of sampleReports) {
      insertReport.run(report.id, report.title, report.content, report.authorId, report.status, report.type, report.unit, report.priority, report.currentRevision);
    }

    console.log('✅ Default data inserted successfully');
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
    
    const insertActivity = conn.prepare(
      'INSERT INTO user_activity_log (id, user_id, action, entity_type, entity_id, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    
    insertActivity.run(
      `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      entityType,
      entityId,
      details ? JSON.stringify(details) : null,
      ipAddress,
      userAgent
    );
  } catch (error) {
    console.error('Failed to log user activity:', error);
  }
};