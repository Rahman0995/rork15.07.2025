import { serve } from "@hono/node-server";
import app from "./hono";
import { config } from "./config";

console.log(`🚀 Starting Military Management System Backend...`);
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Port: ${config.server.port}`);
console.log(`🌐 Host: ${config.server.host}`);

const server = serve({
  fetch: app.fetch,
  port: config.server.port,
  hostname: config.server.host,
});

console.log(`✅ Server running at http://${config.server.host}:${config.server.port}`);
console.log(`📡 API available at http://${config.server.host}:${config.server.port}/api`);
console.log(`🔗 tRPC endpoint: http://${config.server.host}:${config.server.port}/api/trpc`);
console.log(`💚 Health check: http://${config.server.host}:${config.server.port}/api/health`);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  server.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  server.close();
  process.exit(0);
});