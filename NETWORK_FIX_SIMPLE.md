# Quick Network Fix Guide

Your app is failing to connect to the backend because the server isn't running or the IP address is incorrect.

## Quick Fix (Recommended)

1. **Find your local IP address:**
   ```bash
   node find-local-ip-simple.js
   ```

2. **Update your .env file with the correct IP:**
   ```bash
   # Replace with your actual IP from step 1
   LOCAL_IP=192.168.1.XXX
   ```

3. **Start the full stack (backend + frontend):**
   ```bash
   node start-full-stack.js
   ```

## Alternative: Manual Steps

1. **Start backend only:**
   ```bash
   node start-backend-simple.js
   ```

2. **In another terminal, start the app:**
   ```bash
   npm run start
   ```

## Test Your Connection

After starting the backend, test these URLs in your browser:
- http://localhost:3000/api/health
- http://YOUR_IP:3000/api/health (replace YOUR_IP with your actual IP)

## Common Issues

1. **Backend not starting:** Make sure you have `bun` installed
2. **IP not working:** Try different IPs from the find-ip script
3. **Firewall blocking:** Temporarily disable firewall or add port 3000 exception
4. **Different network:** Make sure your phone and computer are on the same WiFi

## Mock Data Fallback

If you can't get the backend working, the app will automatically use mock data. You'll see "(Mock)" in the data titles.

## Need Help?

The app is designed to work with mock data if the backend is unavailable, so you can still test all features even without a working backend connection.