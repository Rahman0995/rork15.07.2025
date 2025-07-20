import { publicProcedure } from '../../middleware';
import { z } from 'zod';
import crypto from 'crypto';

// Схема для webhook payload от Supabase Auth
const supabaseWebhookSchema = z.object({
  type: z.string(),
  table: z.string().optional(),
  record: z.any().optional(),
  schema: z.string().optional(),
  old_record: z.any().optional(),
});

// Функция для верификации webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Supabase использует HMAC-SHA256 для подписи webhook
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    // Signature приходит в формате "sha256=<hash>"
    const receivedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

export const smsWebhookProcedure = publicProcedure
  .input(supabaseWebhookSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('📱 SMS Webhook received:', {
        type: input.type,
        timestamp: new Date().toISOString(),
      });

      // Здесь можно добавить логику обработки различных типов SMS событий
      switch (input.type) {
        case 'user.created':
          console.log('👤 New user created via SMS');
          // Логика для нового пользователя
          break;
          
        case 'user.updated':
          console.log('👤 User updated via SMS');
          // Логика для обновления пользователя
          break;
          
        case 'user.deleted':
          console.log('👤 User deleted');
          // Логика для удаления пользователя
          break;
          
        default:
          console.log(`📱 Unhandled SMS webhook type: ${input.type}`);
      }

      return {
        success: true,
        message: 'SMS webhook processed successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error processing SMS webhook:', error);
      throw new Error('Failed to process SMS webhook');
    }
  });