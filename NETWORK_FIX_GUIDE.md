# Network Connection Fix Guide

## Problem
The frontend is trying to connect to the backend but getting network errors:
- `NetworkError when attempting to fetch resource`
- tRPC batch requests failing

## Quick Fix

### 1. Start the Backend Server
```bash
# Make the script executable and run it
chmod +x fix-and-start.sh
./fix-and-start.sh
```

### 2. Alternative: Manual Backend Start
```bash
# Start backend manually
chmod +x run-backend.sh
./run-backend.sh
```

### 3. Test Connection
```bash
# Test if backend is working
node test-backend-connection.js
```

### 4. Network Diagnostics
```bash
# Get detailed network information
node diagnose-network.js
```

## What the Fix Does

1. **Backend Server**: Starts the Hono backend server on port 3000
2. **Network Binding**: Binds to `0.0.0.0:3000` so it's accessible from all interfaces
3. **Mock Data**: Provides fallback mock data if backend is unreachable
4. **Multiple URLs**: Tests multiple connection URLs automatically

## Expected Output

When backend is running correctly:
```
🚀 Starting Military Management System Backend...
📍 Environment: development
🔧 Port: 3000
🌐 Host: 0.0.0.0
✅ Server running at http://0.0.0.0:3000
📡 API available at http://0.0.0.0:3000/api
🔗 tRPC endpoint: http://0.0.0.0:3000/api/trpc
💚 Health check: http://0.0.0.0:3000/api/health
```

## Testing URLs

The app will try these URLs in order:
1. `http://localhost:3000/api/trpc`
2. `http://127.0.0.1:3000/api/trpc`
3. `http://10.0.2.2:3000/api/trpc` (Android emulator)
4. `http://192.168.1.100:3000/api/trpc` (Local network)

## If Backend Still Doesn't Work

The app will automatically fall back to mock data, so you'll see:
- Mock tasks and reports
- "(Mock)" suffix in titles
- Console messages about using mock data

## Environment Variables

For production or specific network setup:
```bash
export EXPO_PUBLIC_RORK_API_BASE_URL=http://your-server:3000
export API_HOST=0.0.0.0
export API_PORT=3000
```

## Troubleshooting

1. **Port 3000 in use**: Change `API_PORT` environment variable
2. **Firewall blocking**: Allow port 3000 in firewall
3. **Network interface**: Check `node diagnose-network.js` output
4. **Mobile testing**: Use your computer's IP address instead of localhost