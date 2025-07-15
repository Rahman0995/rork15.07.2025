import { z } from 'zod';

// Общие схемы валидации
export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

// Схемы для пользователей
export const userCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  rank: z.string().min(1, 'Rank is required'),
  unit: z.string().min(1, 'Unit is required'),
  role: z.enum(['battalion_commander', 'company_commander', 'officer', 'soldier', 'admin']),
});

export const userUpdateSchema = userCreateSchema.partial();

// Схемы для отчетов
export const reportCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  type: z.enum(['text', 'file', 'video']).default('text'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  unit: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  approvers: z.array(z.string()).default([]),
});

export const reportUpdateSchema = reportCreateSchema.partial();

// Схемы для задач
export const taskCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  assignedTo: z.string().min(1, 'Assigned user is required'),
  dueDate: z.string().datetime('Invalid due date format'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const taskUpdateSchema = taskCreateSchema.partial();

// Схемы для событий календаря
export const eventCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['training', 'meeting', 'exercise', 'inspection', 'ceremony', 'other']),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  location: z.string().optional(),
  organizer: z.string().min(1, 'Organizer is required'),
  participants: z.array(z.string()).min(1, 'At least one participant is required'),
  isAllDay: z.boolean().default(false),
  unit: z.string().min(1, 'Unit is required'),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const eventUpdateSchema = eventCreateSchema.partial();

// Схемы для сообщений
export const messageCreateSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty').optional(),
  type: z.enum(['text', 'image', 'file', 'voice']).default('text'),
  attachment: z.object({
    name: z.string(),
    type: z.enum(['image', 'file', 'voice']),
    url: z.string().url(),
    size: z.number().positive().optional(),
    duration: z.number().positive().optional(),
  }).optional(),
}).refine(data => data.text || data.attachment, {
  message: 'Message must have either text or attachment',
});

// Схемы для файлов
export const fileUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  type: z.enum(['image', 'video', 'document', 'audio']),
  size: z.number().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required'),
});

// Утилиты для валидации
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}

export function validatePhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}

// Функция для валидации файлов
export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size <= maxSize; // По умолчанию максимум 10MB
}

export function validateFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType);
}

// Константы для валидации
export const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  video: 100 * 1024 * 1024, // 100MB
  document: 10 * 1024 * 1024, // 10MB
  audio: 20 * 1024 * 1024, // 20MB
};

export const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a'],
};