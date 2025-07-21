#!/usr/bin/env node

/**
 * Скрипт для тестирования подключения к Supabase
 * Запуск: node scripts/test-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');

// Конфигурация Supabase из .env
const supabaseUrl = 'https://qcdqofdmflhgsabyopfe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZHFvZmRtZmxoZ3NhYnlvcGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODkxNTMsImV4cCI6MjA2ODU2NTE1M30.qYn87AuahL4H9Tin8nVIKlH9-3UnCmtHGEBOA3RhyjU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔗 Тестирование подключения к Supabase...');
    console.log('🌐 URL:', supabaseUrl);
    console.log('🔑 Anon Key:', supabaseAnonKey.substring(0, 20) + '...');

    // 1. Тест подключения к базе данных
    console.log('\n📊 Тестирование подключения к базе данных...');
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (tablesError) {
      console.error('❌ Ошибка подключения к базе данных:', tablesError.message);
      return;
    }

    console.log('✅ Подключение к базе данных успешно');
    console.log('👥 Количество пользователей:', tables?.count || 0);

    // 2. Тест аутентификации
    console.log('\n🔐 Тестирование аутентификации...');
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('❌ Ошибка аутентификации:', authError.message);
    } else {
      console.log('✅ Аутентификация работает');
      console.log('👤 Текущий пользователь:', authData.session?.user?.email || 'Не авторизован');
    }

    // 3. Тест получения пользователей
    console.log('\n👥 Тестирование получения пользователей...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .limit(5);

    if (usersError) {
      console.error('❌ Ошибка получения пользователей:', usersError.message);
    } else {
      console.log('✅ Получение пользователей работает');
      console.log('📋 Пользователи:');
      users?.forEach(user => {
        console.log(`  - ${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`);
      });
    }

    // 4. Тест получения задач
    console.log('\n📋 Тестирование получения задач...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, status, priority')
      .limit(5);

    if (tasksError) {
      console.error('❌ Ошибка получения задач:', tasksError.message);
    } else {
      console.log('✅ Получение задач работает');
      console.log('📋 Задачи:');
      tasks?.forEach(task => {
        console.log(`  - ${task.title} (${task.status}) - ${task.priority}`);
      });
    }

    // 5. Тест получения отчетов
    console.log('\n📄 Тестирование получения отчетов...');
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('id, title, status, type')
      .limit(5);

    if (reportsError) {
      console.error('❌ Ошибка получения отчетов:', reportsError.message);
    } else {
      console.log('✅ Получение отчетов работает');
      console.log('📋 Отчеты:');
      reports?.forEach(report => {
        console.log(`  - ${report.title} (${report.status}) - ${report.type}`);
      });
    }

    console.log('\n🎉 Все тесты завершены!');
    console.log('\n📱 Supabase готов к использованию в приложении.');

  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error);
  }
}

// Запуск тестов
testConnection();