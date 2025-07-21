#!/usr/bin/env node

/**
 * Скрипт для создания администратора в Supabase
 * Запуск: node scripts/create-admin.js
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

async function createAdmin() {
  try {
    console.log('🚀 Создание администратора...');

    // Данные администратора
    const adminData = {
      email: 'admin@military.gov',
      password: 'admin123456',
      first_name: 'Иван',
      last_name: 'Зингиев',
      rank: 'Полковник',
      role: 'admin',
      unit: '1-й батальон',
      phone: '+7-900-123-4567'
    };

    // 1. Создаем пользователя в Auth
    console.log('📝 Создание пользователя в Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      email_confirm: true,
      user_metadata: {
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        rank: adminData.rank,
        role: adminData.role,
        unit: adminData.unit,
        phone: adminData.phone
      }
    });

    if (authError) {
      console.error('❌ Ошибка создания пользователя в Auth:', authError.message);
      return;
    }

    console.log('✅ Пользователь создан в Auth:', authData.user.id);

    // 2. Создаем профиль в таблице users
    console.log('📝 Создание профиля в базе данных...');
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: adminData.email,
        password_hash: '', // Будет обрабатываться Supabase Auth
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        rank: adminData.rank,
        role: adminData.role,
        unit: adminData.unit,
        phone: adminData.phone,
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Ошибка создания профиля:', profileError.message);
      return;
    }

    console.log('✅ Профиль создан в базе данных');

    console.log('\n🎉 Администратор успешно создан!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Пароль:', adminData.password);
    console.log('👤 Роль:', adminData.role);
    console.log('🆔 ID:', authData.user.id);

    console.log('\n📱 Теперь вы можете войти в приложение с этими данными.');

  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error);
  }
}

// Запуск скрипта
createAdmin();