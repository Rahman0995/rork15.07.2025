import { createTRPCRouter } from "./create-context";
import { hiProcedure } from "./routes/example/hi/route";

// Auth
import {
  loginProcedure,
  logoutProcedure,
  refreshTokenProcedure,
  changePasswordProcedure,
  resetPasswordProcedure,
} from "./routes/auth/route";

// Users
import {
  getUsersProcedure,
  getUserByIdProcedure,
  getUsersByUnitProcedure,
  updateUserProcedure,
  getCurrentUserProcedure,
} from "./routes/users/route";

// Reports
import {
  getReportsProcedure,
  getReportByIdProcedure,
  createReportProcedure,
  updateReportProcedure,
  deleteReportProcedure,
  addReportCommentProcedure,
  approveReportProcedure,
  getReportsForApprovalProcedure,
} from "../../../backend/trpc/routes/reports/route";

// Tasks
import {
  getTasksProcedure,
  getTaskByIdProcedure,
  createTaskProcedure,
  updateTaskProcedure,
  deleteTaskProcedure,
  getTaskStatsProcedure,
} from "../../../backend/trpc/routes/tasks/route";

// Chat
import {
  getChatsProcedure,
  getChatByIdProcedure,
  getChatMessagesProcedure,
  sendMessageProcedure,
  markMessagesAsReadProcedure,
  createChatProcedure,
  deleteChatProcedure,
  getUnreadCountProcedure as getChatUnreadCountProcedure,
} from "../../../backend/trpc/routes/chat/route";

// Calendar
import {
  getEventsProcedure,
  getEventByIdProcedure,
  createEventProcedure,
  updateEventProcedure,
  deleteEventProcedure,
  getUpcomingEventsProcedure,
} from "./routes/calendar/route";

// Notifications
import {
  getNotificationsProcedure,
  markNotificationAsReadProcedure,
  markAllNotificationsAsReadProcedure,
  createNotificationProcedure,
  deleteNotificationProcedure,
  getUnreadCountProcedure as getNotificationUnreadCountProcedure,
} from "./routes/notifications/route";

// Analytics
import {
  getReportsAnalyticsProcedure,
  getTasksAnalyticsProcedure,
  getUserActivityProcedure,
  getDashboardStatsProcedure,
} from "./routes/analytics/route";

// Media
import {
  uploadFileProcedure,
  getFilesProcedure,
  getFileByIdProcedure,
  deleteFileProcedure,
  generateUploadUrlProcedure,
  getStorageStatsProcedure,
} from "./routes/media/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  
  auth: createTRPCRouter({
    login: loginProcedure,
    logout: logoutProcedure,
    refreshToken: refreshTokenProcedure,
    changePassword: changePasswordProcedure,
    resetPassword: resetPasswordProcedure,
  }),
  
  users: createTRPCRouter({
    getAll: getUsersProcedure,
    getById: getUserByIdProcedure,
    getByUnit: getUsersByUnitProcedure,
    update: updateUserProcedure,
    getCurrent: getCurrentUserProcedure,
  }),
  
  reports: createTRPCRouter({
    getAll: getReportsProcedure,
    getById: getReportByIdProcedure,
    create: createReportProcedure,
    update: updateReportProcedure,
    delete: deleteReportProcedure,
    addComment: addReportCommentProcedure,
    approve: approveReportProcedure,
    getForApproval: getReportsForApprovalProcedure,
  }),
  
  tasks: createTRPCRouter({
    getAll: getTasksProcedure,
    getById: getTaskByIdProcedure,
    create: createTaskProcedure,
    update: updateTaskProcedure,
    delete: deleteTaskProcedure,
    getStats: getTaskStatsProcedure,
  }),
  
  chat: createTRPCRouter({
    getAll: getChatsProcedure,
    getById: getChatByIdProcedure,
    getMessages: getChatMessagesProcedure,
    sendMessage: sendMessageProcedure,
    markAsRead: markMessagesAsReadProcedure,
    create: createChatProcedure,
    delete: deleteChatProcedure,
    getUnreadCount: getChatUnreadCountProcedure,
  }),
  
  calendar: createTRPCRouter({
    getEvents: getEventsProcedure,
    getById: getEventByIdProcedure,
    create: createEventProcedure,
    update: updateEventProcedure,
    delete: deleteEventProcedure,
    getUpcoming: getUpcomingEventsProcedure,
  }),
  
  notifications: createTRPCRouter({
    getAll: getNotificationsProcedure,
    markAsRead: markNotificationAsReadProcedure,
    markAllAsRead: markAllNotificationsAsReadProcedure,
    create: createNotificationProcedure,
    delete: deleteNotificationProcedure,
    getUnreadCount: getNotificationUnreadCountProcedure,
  }),
  
  analytics: createTRPCRouter({
    getReportsAnalytics: getReportsAnalyticsProcedure,
    getTasksAnalytics: getTasksAnalyticsProcedure,
    getUserActivity: getUserActivityProcedure,
    getDashboardStats: getDashboardStatsProcedure,
  }),
  
  media: createTRPCRouter({
    upload: uploadFileProcedure,
    getAll: getFilesProcedure,
    getById: getFileByIdProcedure,
    delete: deleteFileProcedure,
    generateUploadUrl: generateUploadUrlProcedure,
    getStorageStats: getStorageStatsProcedure,
  }),
});

export type AppRouter = typeof appRouter;