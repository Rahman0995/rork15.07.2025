import { serve } from "@hono/node-server";
import app from "./hono";
import { config } from "./config";

const port = config.server.port;
const host = config.server.host;

console.log(`🚀 Starting Military Management System API...`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Server: http://${host}:${port}`);
console.log(`🔗 API Base: http://${host}:${port}/api`);
console.log(`❤️ Health Check: http://${host}:${port}/api/health`);
console.log(`📡 tRPC Endpoint: http://${host}:${port}/api/trpc`);

serve({
  fetch: app.fetch,
  port,
  hostname: host,
}, (info) => {
  console.log(`✅ Server is running on http://${info.address}:${info.port}`);
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

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});