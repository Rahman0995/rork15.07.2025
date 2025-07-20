#!/usr/bin/env node

// Simple Node.js backend starter
const { serve } = require('@hono/node-server');
const path = require('path');

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.API_PORT = process.env.API_PORT || '3000';
process.env.API_HOST = process.env.API_HOST || '0.0.0.0';
process.env.USE_SQLITE = 'true';
process.env.DATABASE_URL = 'sqlite:///tmp/database.sqlite';

console.log('🚀 Starting Military Management System API...');
console.log(`📊 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Server: http://${process.env.API_HOST}:${process.env.API_PORT}`);
console.log(`🔗 API Base: http://${process.env.API_HOST}:${process.env.API_PORT}/api`);

// Simple mock app for now
const { Hono } = require('hono');
const app = new Hono();

// Basic routes
app.get('/', (c) => {
  return c.json({ 
    name: "Military Management System API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: "/api/health",
      trpc: "/api/trpc",
    }
  });
});

app.get('/health', (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mock tRPC endpoints
app.all('/trpc/*', (c) => {
  return c.json({
    success: true,
    data: { message: "Mock tRPC response - backend is running" },
    timestamp: new Date().toISOString(),
  });
});

const port = parseInt(process.env.API_PORT || '3000');
const host = process.env.API_HOST || '0.0.0.0';

serve({
  fetch: app.fetch,
  port,
  hostname: host,
}, (info) => {
  console.log(`✅ Server is running on http://${info.address}:${info.port}`);
  console.log(`❤️ Health Check: http://${info.address}:${info.port}/health`);
  console.log(`📡 Mock tRPC: http://${info.address}:${info.port}/trpc`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  process.exit(0);
});