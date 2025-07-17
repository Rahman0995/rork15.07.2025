import { logUserActivity } from '../database';

export const createActivityLogger = (action: string, entityType: string) => {
  return async (opts: any) => {
    const { ctx, next, input } = opts;
    
    try {
      // Execute the procedure
      const result = await next();
      
      // Log successful activity
      if (ctx.user?.id) {
        const entityId = result?.id || input?.id || input?.reportId || input?.taskId || input?.chatId;
        
        await logUserActivity(
          ctx.user.id,
          action,
          entityType,
          entityId,
          {
            input: input ? JSON.stringify(input) : null,
            success: true,
            timestamp: new Date().toISOString()
          },
          ctx.req?.headers?.['x-forwarded-for'] || ctx.req?.headers?.['x-real-ip'] || 'unknown',
          ctx.req?.headers?.['user-agent'] || 'unknown'
        );
      }
      
      return result;
    } catch (error) {
      // Log failed activity
      if (ctx.user?.id) {
        await logUserActivity(
          ctx.user.id,
          `${action}_failed`,
          entityType,
          input?.id || input?.reportId || input?.taskId || input?.chatId,
          {
            input: input ? JSON.stringify(input) : null,
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false,
            timestamp: new Date().toISOString()
          },
          ctx.req?.headers?.['x-forwarded-for'] || ctx.req?.headers?.['x-real-ip'] || 'unknown',
          ctx.req?.headers?.['user-agent'] || 'unknown'
        );
      }
      
      throw error;
    }
  };
};

// Predefined activity loggers for common actions
export const activityLoggers = {
  // Reports
  createReport: createActivityLogger('create', 'report'),
  updateReport: createActivityLogger('update', 'report'),
  deleteReport: createActivityLogger('delete', 'report'),
  viewReport: createActivityLogger('view', 'report'),
  approveReport: createActivityLogger('approve', 'report'),
  rejectReport: createActivityLogger('reject', 'report'),
  
  // Tasks
  createTask: createActivityLogger('create', 'task'),
  updateTask: createActivityLogger('update', 'task'),
  deleteTask: createActivityLogger('delete', 'task'),
  viewTask: createActivityLogger('view', 'task'),
  completeTask: createActivityLogger('complete', 'task'),
  
  // Chat
  sendMessage: createActivityLogger('send', 'message'),
  createChat: createActivityLogger('create', 'chat'),
  joinChat: createActivityLogger('join', 'chat'),
  leaveChat: createActivityLogger('leave', 'chat'),
  
  // Calendar
  createEvent: createActivityLogger('create', 'event'),
  updateEvent: createActivityLogger('update', 'event'),
  deleteEvent: createActivityLogger('delete', 'event'),
  viewEvent: createActivityLogger('view', 'event'),
  
  // Auth
  login: createActivityLogger('login', 'auth'),
  logout: createActivityLogger('logout', 'auth'),
  
  // General
  view: (entityType: string) => createActivityLogger('view', entityType),
  create: (entityType: string) => createActivityLogger('create', entityType),
  update: (entityType: string) => createActivityLogger('update', entityType),
  delete: (entityType: string) => createActivityLogger('delete', entityType),
};