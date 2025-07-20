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
        \`rank\` VARCHAR(50),
        unit VARCHAR(100),
        role ENUM('admin', 'officer', 'soldier') DEFAULT 'soldier',
        avatar_url TEXT,
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_unit (unit)
      )`,
      
      `CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('incident', 'maintenance', 'personnel', 'training', 'other') NOT NULL,
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
        INDEX idx_status (status),
        INDEX idx_type (type),
        INDEX idx_priority (priority),
        INDEX idx_unit (unit),
        INDEX idx_created_at (created_at)
      )`,
      
      `CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        assigned_to VARCHAR(36) NULL,
        created_by VARCHAR(36) NOT NULL,
        unit VARCHAR(100),
        due_date TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_assigned_to (assigned_to),
        INDEX idx_created_by (created_by),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_due_date (due_date),
        INDEX idx_unit (unit)
      )`,
      
      `CREATE TABLE IF NOT EXISTS calendar_events (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('training', 'meeting', 'operation', 'maintenance', 'other') NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        location VARCHAR(255),
        created_by VARCHAR(36) NOT NULL,
        unit VARCHAR(100),
        participants JSON,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_created_by (created_by),
        INDEX idx_start_time (start_time),
        INDEX idx_end_time (end_time),
        INDEX idx_type (type),
        INDEX idx_unit (unit)
      )`,
      
      `CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(36) PRIMARY KEY,
        content TEXT NOT NULL,
        sender_id VARCHAR(36) NOT NULL,
        recipient_id VARCHAR(36) NULL,
        channel_id VARCHAR(100) NULL,
        message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
        attachments JSON,
        is_read BOOLEAN DEFAULT false,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_sender (sender_id),
        INDEX idx_recipient (recipient_id),
        INDEX idx_channel (channel_id),
        INDEX idx_created_at (created_at),
        INDEX idx_is_read (is_read)
      )`,
      
      `CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
        user_id VARCHAR(36) NOT NULL,
        is_read BOOLEAN DEFAULT false,
        action_url VARCHAR(500),
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
      )`,
      
      `CREATE TABLE IF NOT EXISTS migration_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        version VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_version (version)
      )`
    ],
    down: [
      'DROP TABLE IF EXISTS migration_history',
      'DROP TABLE IF EXISTS notifications',
      'DROP TABLE IF EXISTS chat_messages',
      'DROP TABLE IF EXISTS calendar_events',
      'DROP TABLE IF EXISTS tasks',
      'DROP TABLE IF EXISTS reports',
      'DROP TABLE IF EXISTS users'
    ]
  },
  
  {
    version: '002',
    name: 'add_user_preferences',
    up: [
      `ALTER TABLE users ADD COLUMN preferences JSON DEFAULT '{}' AFTER metadata`,
      `ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC' AFTER preferences`
    ],
    down: [
      'ALTER TABLE users DROP COLUMN timezone',
      'ALTER TABLE users DROP COLUMN preferences'
    ]
  }
];

export async function runMigrations(db: any): Promise<boolean> {
  try {
    console.log('🔄 Running database migrations...');
    
    // Создаем таблицу миграций если её нет
    await db.execute(`
      CREATE TABLE IF NOT EXISTS migration_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        version VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_version (version)
      )
    `);
    
    // Получаем выполненные миграции
    const [executedMigrations] = await db.execute(
      'SELECT version FROM migration_history ORDER BY version'
    );
    
    const executedVersions = new Set(
      executedMigrations.map((row: any) => row.version)
    );
    
    // Выполняем новые миграции
    for (const migration of migrations) {
      if (!executedVersions.has(migration.version)) {
        console.log(`🔄 Running migration ${migration.version}: ${migration.name}`);
        
        // Выполняем SQL команды миграции
        for (const sql of migration.up) {
          await db.execute(sql);
        }
        
        // Записываем в историю
        await db.execute(
          'INSERT INTO migration_history (version, name) VALUES (?, ?)',
          [migration.version, migration.name]
        );
        
        console.log(`✅ Migration ${migration.version} completed`);
      }
    }
    
    console.log('✅ All migrations completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

export async function rollbackMigration(db: any, version: string): Promise<boolean> {
  try {
    const migration = migrations.find(m => m.version === version);
    if (!migration) {
      throw new Error(`Migration ${version} not found`);
    }
    
    console.log(`🔄 Rolling back migration ${version}: ${migration.name}`);
    
    // Выполняем rollback команды
    for (const sql of migration.down) {
      await db.execute(sql);
    }
    
    // Удаляем из истории
    await db.execute(
      'DELETE FROM migration_history WHERE version = ?',
      [version]
    );
    
    console.log(`✅ Migration ${version} rolled back successfully`);
    return true;
    
  } catch (error) {
    console.error(`❌ Rollback failed for migration ${version}:`, error);
    return false;
  }
}