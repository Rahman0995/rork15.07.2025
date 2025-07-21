#!/usr/bin/env node

/**
 * Скрипт для создания тестовых данных в Supabase
 * Запуск: node scripts/init-test-data.js
 */

const { createClient } = require('@supabase/supabase-js');

// Конфигурация Supabase
const supabaseUrl = 'https://qcdqofdmflhgsabyopfe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZHFvZmRtZmxoZ3NhYnlvcGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk4OTE1MywiZXhwIjoyMDY4NTY1MTUzfQ.Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7E'; // Замените на ваш service_role ключ

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Тестовые пользователи
const testUsers = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'admin@military.gov',
    password: 'admin123456',
    first_name: 'Иван',
    last_name: 'Зингиев',
    rank: 'Полковник',
    role: 'admin',
    unit: '1-й батальон',
    phone: '+7-900-123-4567',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'petrov@military.gov',
    password: 'petrov123456',
    first_name: 'Алексей',
    last_name: 'Петров',
    rank: 'Майор',
    role: 'battalion_commander',
    unit: '1-я рота',
    phone: '+7-900-234-5678',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'sidorov@military.gov',
    password: 'sidorov123456',
    first_name: 'Михаил',
    last_name: 'Сидоров',
    rank: 'Капитан',
    role: 'company_commander',
    unit: '2-я рота',
    phone: '+7-900-345-6789',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    email: 'kozlov@military.gov',
    password: 'kozlov123456',
    first_name: 'Сергей',
    last_name: 'Козлов',
    rank: 'Сержант',
    role: 'soldier',
    unit: '1-я рота',
    phone: '+7-900-456-7890',
    avatar_url: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face'
  }
];

// Тестовые задачи
const testTasks = [
  {
    title: 'Проверка оборудования',
    description: 'Провести полную проверку всего оборудования в подразделении',
    status: 'pending',
    priority: 'high',
    assigned_to: '550e8400-e29b-41d4-a716-446655440004',
    created_by: '550e8400-e29b-41d4-a716-446655440002',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'Подготовка отчета',
    description: 'Подготовить ежемесячный отчет о состоянии подразделения',
    status: 'in_progress',
    priority: 'medium',
    assigned_to: '550e8400-e29b-41d4-a716-446655440003',
    created_by: '550e8400-e29b-41d4-a716-446655440001',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Тестовые отчеты
const testReports = [
  {
    title: 'Отчет о проведенных учениях',
    content: 'Подробный отчет о результатах проведенных тактических учений',
    type: 'training',
    status: 'pending',
    created_by: '550e8400-e29b-41d4-a716-446655440003'
  },
  {
    title: 'Отчет о состоянии техники',
    content: 'Ежемесячный отчет о техническом состоянии военной техники',
    type: 'equipment',
    status: 'approved',
    created_by: '550e8400-e29b-41d4-a716-446655440004'
  }
];

async function createTestData() {
  try {
    console.log('🚀 Создание тестовых данных...');

    // 1. Создание пользователей
    console.log('\n👥 Создание тестовых пользователей...');
    for (const user of testUsers) {
      try {
        // Создаем пользователя в Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            first_name: user.first_name,
            last_name: user.last_name,
            rank: user.rank,
            role: user.role,
            unit: user.unit,
            phone: user.phone
          }
        });

        if (authError && !authError.message.includes('already registered')) {
          console.error(`❌ Ошибка создания пользователя ${user.email}:`, authError.message);
          continue;
        }

        // Создаем профиль в таблице users
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            password_hash: '',
            first_name: user.first_name,
            last_name: user.last_name,
            rank: user.rank,
            role: user.role,
            unit: user.unit,
            phone: user.phone,
            avatar_url: user.avatar_url
          });

        if (profileError) {
          console.error(`❌ Ошибка создания профиля ${user.email}:`, profileError.message);
        } else {
          console.log(`✅ Пользователь создан: ${user.first_name} ${user.last_name} (${user.role})`);
        }
      } catch (error) {
        console.error(`❌ Ошибка при создании пользователя ${user.email}:`, error.message);
      }
    }

    // 2. Создание задач
    console.log('\n📋 Создание тестовых задач...');
    for (const task of testTasks) {
      try {
        const { error } = await supabase
          .from('tasks')
          .insert(task);

        if (error) {
          console.error(`❌ Ошибка создания задачи "${task.title}":`, error.message);
        } else {
          console.log(`✅ Задача создана: ${task.title}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка при создании задачи "${task.title}":`, error.message);
      }
    }

    // 3. Создание отчетов
    console.log('\n📄 Создание тестовых отчетов...');
    for (const report of testReports) {
      try {
        const { error } = await supabase
          .from('reports')
          .insert(report);

        if (error) {
          console.error(`❌ Ошибка создания отчета "${report.title}":`, error.message);
        } else {
          console.log(`✅ Отчет создан: ${report.title}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка при создании отчета "${report.title}":`, error.message);
      }
    }

    console.log('\n🎉 Тестовые данные созданы!');
    console.log('\n📱 Теперь вы можете войти в приложение с любым из следующих аккаунтов:');
    testUsers.forEach(user => {
      console.log(`  - ${user.email} / ${user.password} (${user.role})`);
    });

  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error);
  }
}

// Запуск скрипта
createTestData();