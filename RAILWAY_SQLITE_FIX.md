# Railway SQLite Build Fix

## Problem
Your Railway deployment is failing because `better-sqlite3` requires native compilation with `node-gyp`, which isn't available in the Railway build environment.

## Solution
Remove SQLite dependencies from package.json since your backend already uses MySQL.

## Steps to Fix

### 1. Remove SQLite Dependencies
Remove these packages from your `package.json`:
- `better-sqlite3`
- `@types/better-sqlite3`
- `drizzle-kit`
- `drizzle-orm`
- `expo-sqlite`

### 2. Update package.json
Your dependencies section should look like this (without the SQLite packages):

```json
{
  "dependencies": {
    "@expo/config-plugins": "~10.1.1",
    "@expo/metro-config": "^0.20.17",
    "@expo/vector-icons": "^14.1.0",
    "@hono/node-server": "^1.16.0",
    "@hono/trpc-server": "^0.4.0",
    "@nkzw/create-context-hook": "^1.1.0",
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-navigation/native": "^7.1.6",
    "@tanstack/react-query": "^5.83.0",
    "@trpc/client": "^11.4.3",
    "@trpc/react-query": "^11.4.3",
    "@trpc/server": "^11.4.3",
    "babel-plugin-transform-import-meta": "^2.3.3",
    "babel-preset-expo": "~13.0.0",
    "expo": "53.0.20",
    "expo-audio": "~0.4.8",
    "expo-av": "~15.1.7",
    "expo-blur": "~14.1.5",
    "expo-camera": "~16.1.10",
    "expo-constants": "~17.1.7",
    "expo-document-picker": "~13.1.6",
    "expo-file-system": "~18.1.11",
    "expo-font": "~13.3.2",
    "expo-haptics": "~14.1.4",
    "expo-image": "~2.4.0",
    "expo-image-picker": "~16.1.4",
    "expo-linear-gradient": "~14.1.5",
    "expo-linking": "~7.1.7",
    "expo-localization": "~16.1.6",
    "expo-location": "~18.1.6",
    "expo-media-library": "~17.1.7",
    "expo-notifications": "~0.31.4",
    "expo-router": "~5.1.4",
    "expo-splash-screen": "~0.30.10",
    "expo-status-bar": "~2.2.3",
    "expo-symbols": "~0.4.5",
    "expo-system-ui": "~5.0.10",
    "expo-video": "~2.2.2",
    "expo-web-browser": "~14.2.0",
    "hono": "^4.8.5",
    "lucide-react-native": "^0.475.0",
    "mysql2": "^3.14.2",
    "nativewind": "^4.1.23",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-error-boundary": "^6.0.0",
    "react-native": "0.79.5",
    "react-native-gesture-handler": "~2.24.0",
    "react-native-reanimated": "~3.17.4",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "~4.11.1",
    "react-native-svg": "15.11.2",
    "react-native-web": "^0.20.0",
    "superjson": "^2.2.2",
    "zod": "^4.0.5",
    "zustand": "^5.0.2"
  }
}
```

### 3. Run Installation
After updating package.json:
```bash
bun install
```

### 4. Commit and Push
```bash
git add .
git commit -m "Remove SQLite dependencies for Railway deployment"
git push
```

## Why This Works
- Your backend already uses MySQL (mysql2 package)
- The database initialization in `backend/database/index.ts` uses raw SQL queries
- SQLite dependencies were causing build failures due to native compilation requirements
- Railway will now be able to build your app successfully

## Database Configuration
Make sure your Railway environment has the correct MySQL database URL set in the `DATABASE_URL` environment variable.

Your app will continue to work exactly the same since it's already configured to use MySQL instead of SQLite.