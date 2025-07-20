const crypto = require('crypto');

// Тестовый payload для webhook
const testPayload = {
  type: 'user.created',
  table: 'auth.users',
  record: {
    id: '12345',
    email: 'test@example.com',
    phone: '+79991234567',
    created_at: new Date().toISOString(),
  },
  schema: 'auth',
};

// Webhook secret из .env
const webhookSecret = 'v1,whsec_ll6hvMMRV620VYFElyWffcT7PhKszRkpjf/kdVds8VZOWHCwxqFBo18/sle4qvMUxi0nfLO3HkZH2AW';

// Функция для создания подписи
function createWebhookSignature(payload, secret) {
  const secretKey = secret.replace('v1,whsec_', '');
  const payloadString = JSON.stringify(payload);
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(payloadString, 'utf8')
    .digest('base64');
  
  return `v1=${signature}`;
}

// Тестирование webhook
async function testWebhook() {
  const payloadString = JSON.stringify(testPayload);
  const signature = createWebhookSignature(testPayload, webhookSecret);
  
  console.log('🧪 Тестирование SMS Webhook');
  console.log('📦 Payload:', payloadString);
  console.log('🔐 Signature:', signature);
  
  try {
    const response = await fetch('http://localhost:3000/api/webhooks/supabase/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-supabase-signature': signature,
      },
      body: payloadString,
    });
    
    const result = await response.text();
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response:', result);
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('❌ Webhook test failed!');
    }
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
    console.log('💡 Make sure your backend is running on port 3000');
  }
}

// Запуск теста
testWebhook();