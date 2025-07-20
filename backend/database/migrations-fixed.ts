import { config } from '../config';

export interface Migration {
  version: string;
  name: string;
  up: string[];
  down: string[];
}

export const migrations: Migration[] = [
  {
    version: '001',
    name: 'initial_schema',
    up: [
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        user_rank VARCHAR(50),
        unit VARCHAR(100),
        user_role ENUM('admin', 'officer', 'soldier') DEFAULT 'soldier',
        avatar_url TEXT,
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (user_role),
        INDEX idx_unit (unit)
      )`,
      
      `CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        report_type ENUM('incident', 'maintenance', 'personnel', 'training', 'other') NOT NULL,
        status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected') DEFAULT 'draft',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        author_id VARCHAR(36) NOT NULL,
        reviewer_id VARCHAR(36) NULL,
        unit VARCHAR(100),
        location VARCHAR(255),
        incident_date TIMESTAMP NULL,
        attachments JSON,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_author (author_id),
        INDEX idx_reviewer (reviewer_id),
        INDEX idx_status (status),
        INDEX idx_type (report_type),
        INDEX idx_unit (unit)
      )`,
      
      `CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        task_type ENUM('training', 'maintenance', 'patrol', 'administrative', 'other') NOT NULL,
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        assigned_to VARCHAR(36) NOT NULL,
        assigned_by VARCHAR(36) NOT NULL,
        unit VARCHAR(100),
        location VARCHAR(255),
        due_date TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_assigned_to (assigned_to),
        INDEX idx_assigned_by (assigned_by),
        INDEX idx_status (status),
        INDEX idx_type (task_type),
        INDEX idx_unit (unit),
        INDEX idx_due_date (due_date)
      )`,
      
      `CREATE TABLE IF NOT EXISTS calendar_events (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_type ENUM('training', 'meeting', 'exercise', 'maintenance', 'other') NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        location VARCHAR(255),
        organizer_id VARCHAR(36) NOT NULL,
        unit VARCHAR(100),
        participants JSON,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_organizer (organizer_id),
        INDEX idx_start_time (start_time),
        INDEX idx_end_time (end_time),
        INDEX idx_type (event_type),
        INDEX idx_unit (unit)
      )`,
      
      `CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        notification_type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
        recipient_id VARCHAR(36) NOT NULL,
        sender_id VARCHAR(36) NULL,
        is_read BOOLEAN DEFAULT false,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_recipient (recipient_id),
        INDEX idx_sender (sender_id),
        INDEX idx_read (is_read),
        INDEX idx_type (notification_type),
        INDEX idx_created (created_at)
      )`,
      
      `CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(36) PRIMARY KEY,
        content TEXT NOT NULL,
        message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
        sender_id VARCHAR(36) NOT NULL,
        channel_id VARCHAR(100) NOT NULL,
        reply_to VARCHAR(36) NULL,
        attachments JSON,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reply_to) REFERENCES chat_messages(id) ON DELETE SET NULL,
        INDEX idx_sender (sender_id),
        INDEX idx_channel (channel_id),
        INDEX idx_created (created_at),
        INDEX idx_type (message_type)
      )`
    ],
    down: [
      'DROP TABLE IF EXISTS chat_messages',
      'DROP TABLE IF EXISTS notifications',
      'DROP TABLE IF EXISTS calendar_events',
      'DROP TABLE IF EXISTS tasks',
      'DROP TABLE IF EXISTS reports',
      'DROP TABLE IF EXISTS users'
    ]
  }
];

// Database connection and migration runner
export async function runMigrations(db: any) {
  console.log('🔄 Running database migrations...');
  
  try {
    // Create migrations table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        version VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get executed migrations
    const [executedMigrations] = await db.execute('SELECT version FROM migrations');
    const executedVersions = executedMigrations.map((m: any) => m.version);
    
    // Run pending migrations
    for (const migration of migrations) {
      if (!executedVersions.includes(migration.version)) {
        console.log(`🔄 Running migration ${migration.version}: ${migration.name}`);
        
        try {
          // Execute all up statements
          for (const statement of migration.up) {
            await db.execute(statement);
          }
          
          // Record migration as executed
          await db.execute(
            'INSERT INTO migrations (version, name) VALUES (?, ?)',
            [migration.version, migration.name]
          );
          
          console.log(`✅ Migration ${migration.version} completed successfully`);
        } catch (error) {
          console.error(`❌ Migration failed:`, error);
          throw error;
        }
      }
    }
    
    console.log('✅ All migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed');
    throw error;
  }
}