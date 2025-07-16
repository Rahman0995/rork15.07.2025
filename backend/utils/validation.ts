import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(6);
export const idSchema = z.string().min(1);

// User validation schemas
export const userCreateSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1),
  role: z.enum(['admin', 'user', 'manager']),
  unit: z.string().optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'user', 'manager']).optional(),
  unit: z.string().optional(),
});

// Task validation schemas
export const taskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  assignedTo: z.string(),
  dueDate: z.string(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
});

// Report validation schemas
export const reportCreateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export const reportUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

// Chat validation schemas
export const messageCreateSchema = z.object({
  content: z.string().min(1),
  chatId: z.string(),
});

export const chatCreateSchema = z.object({
  name: z.string().min(1),
  participants: z.array(z.string()),
});

// Event validation schemas
export const eventCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string().optional(),
});

export const eventUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
});

// Notification validation schemas
export const notificationCreateSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['info', 'warning', 'error', 'success']),
  userId: z.string(),
});

// File upload validation schemas
export const fileUploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string(),
  size: z.number().positive(),
});

// Utility functions
export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

export const validateId = (id: string): boolean => {
  return idSchema.safeParse(id).success;
};