#!/usr/bin/env node

// Simple script to add sample data to the database
const mysql = require('mysql2/promise');

async function addSampleData() {
  let connection;
  
  try {
    console.log('🔧 Connecting to database...');
    
    // Create connection - adjust these settings to match your database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'military_app',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Connected to database');
    
    // Check if data already exists
    const [existingTasks] = await connection.execute('SELECT COUNT(*) as count FROM tasks');
    const [existingReports] = await connection.execute('SELECT COUNT(*) as count FROM reports');
    
    if (existingTasks[0].count > 0 || existingReports[0].count > 0) {
      console.log('📝 Sample data already exists, skipping...');
      return;
    }
    
    console.log('📝 Adding sample tasks...');
    
    // Add sample tasks
    const sampleTasks = [
      {
        id: 'task-1',
        title: 'Проверка оборудования',
        description: 'Провести плановую проверку всего оборудования в секторе А.',
        assignedTo: 'user-2',
        createdBy: 'user-1',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'task-2',
        title: 'Обновление документации',
        description: 'Обновить техническую документацию по новым стандартам.',
        assignedTo: 'user-3',
        createdBy: 'user-1',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        priority: 'medium'
      },
      {
        id: 'task-3',
        title: 'Патрулирование периметра',
        description: 'Выполнить вечернее патрулирование периметра объекта.',
        assignedTo: 'user-4',
        createdBy: 'user-2',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'high'
      }
    ];

    for (const task of sampleTasks) {
      await connection.execute(
        'INSERT INTO tasks (id, title, description, assigned_to, created_by, due_date, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [task.id, task.title, task.description, task.assignedTo, task.createdBy, task.dueDate, task.status, task.priority]
      );
    }

    console.log('📝 Adding sample reports...');
    
    // Add sample reports
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

    for (const report of sampleReports) {
      await connection.execute(
        'INSERT INTO reports (id, title, content, author_id, status, type, unit, priority, current_revision) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [report.id, report.title, report.content, report.authorId, report.status, report.type, report.unit, report.priority, report.currentRevision]
      );
    }

    console.log('✅ Sample data added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔄 Database connection closed');
    }
  }
}

// Run the script
addSampleData();