#!/usr/bin/env node

/**
 * Скрипт для создания тестовых данных в Supabase
 * Запуск: node scripts/init-test-data.js
 */

const { createClient } = require('@supabase/supabase-js');

// Конфигурация Supabase
const supabaseUrl = 'https://qcdqofdmflhgsabyopfe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZHFvZmRtZmxoZ3NhYnlvcGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk4OTE1MywiZXhwIjoyMDY4NTY1MTUzfQ.Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7E';

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

    // Сначала очищаем существующие данные (в правильном порядке из-за внешних ключей)
    console.log('\n🧹 Очистка существующих данных...');
    
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('chats').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 1. Создание пользователей
    console.log('\n👥 Создание тестовых пользователей...');
    
    // Сначала создаем записи в таблице users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .insert(testUsers.map(user => ({
        id: user.id,
        email: user.email,
        password_hash: '$2b$10$example.hash.for.demo.purposes.only',
        first_name: user.first_name,
        last_name: user.last_name,
        rank: user.rank,
        role: user.role,
        unit: user.unit,
        phone: user.phone,
        avatar_url: user.avatar_url
      })))
      .select();

    if (usersError) {
      console.error('❌ Ошибка создания пользователей:', usersError);
      return;
    } else {
      console.log(`✅ Создано ${usersData.length} пользователей`);
    }

    // Затем создаем пользователей в Auth
    for (const user of testUsers) {
      try {
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
          console.warn(`⚠️ Auth пользователь ${user.email}:`, authError.message);
        } else {
          console.log(`✅ Auth пользователь: ${user.first_name} ${user.last_name}`);
        }
      } catch (error) {
        console.warn(`⚠️ Ошибка Auth для ${user.email}:`, error.message);
      }
    }

    // 2. Создание задач
    console.log('\n📋 Создание тестовых задач...');
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .insert(testTasks)
      .select();

    if (tasksError) {
      console.error('❌ Ошибка создания задач:', tasksError);
    } else {
      console.log(`✅ Создано ${tasksData.length} задач`);
    }

    // 3. Создание отчетов
    console.log('\n📄 Создание тестовых отчетов...');
    const { data: reportsData, error: reportsError } = await supabase
      .from('reports')
      .insert(testReports)
      .select();

    if (reportsError) {
      console.error('❌ Ошибка создания отчетов:', reportsError);
    } else {
      console.log(`✅ Создано ${reportsData.length} отчетов`);
    }

    // 4. Создание чатов
    console.log('\n💬 Создание тестовых чатов...');
    const testChats = [
      {
        name: 'Общий чат',
        type: 'group',
        created_by: '550e8400-e29b-41d4-a716-446655440001'
      },
      {
        name: 'Командование',
        type: 'group',
        created_by: '550e8400-e29b-41d4-a716-446655440001'
      }
    ];

    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .insert(testChats)
      .select();

    if (chatsError) {
      console.error('❌ Ошибка создания чатов:', chatsError);
    } else {
      console.log(`✅ Создано ${chatsData.length} чатов`);
    }

    // 5. Создание событий
    console.log('\n📅 Создание тестовых событий...');
    const testEvents = [
      {
        title: 'Плановые учения',
        description: 'Тактические учения подразделения',
        start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Полигон №1',
        type: 'training',
        created_by: '550e8400-e29b-41d4-a716-446655440001'
      },
      {
        title: 'Совещание командования',
        description: 'Еженедельное совещание командного состава',
        start_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        location: 'Штаб',
        type: 'meeting',
        created_by: '550e8400-e29b-41d4-a716-446655440001'
      }
    ];

    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .insert(testEvents)
      .select();

    if (eventsError) {
      console.error('❌ Ошибка создания событий:', eventsError);
    } else {
      console.log(`✅ Создано ${eventsData.length} событий`);
    }

    console.log('\n🎉 Тестовые данные созданы!');
    console.log('\n📊 Статистика:');
    console.log(`👥 Пользователи: ${usersData?.length || 0}`);
    console.log(`📋 Задачи: ${tasksData?.length || 0}`);
    console.log(`📄 Отчеты: ${reportsData?.length || 0}`);
    console.log(`💬 Чаты: ${chatsData?.length || 0}`);
    console.log(`📅 События: ${eventsData?.length || 0}`);
    
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