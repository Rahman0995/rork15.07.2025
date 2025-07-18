# Railway MySQL Database Setup Guide

## Database Connection Details

Your Railway MySQL database is now configured with the following connection details:

```
Host: switchyard.proxy.rlwy.net
Port: 13348
Username: root
Password: iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT
Database: railway
```

**Connection String:**
```
mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway
```

## Quick Start

### 1. Test Database Connection
```bash
node test-railway-db.js
```

### 2. Start Application with Railway Database
```bash
node start-with-railway.js
```

### 3. Manual Backend Start
```bash
# Set environment variables
export DATABASE_URL="mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway"
export NODE_ENV="development"

# Start backend
bun run backend/index.ts
```

## Environment Configuration

The following environment variables have been configured in your `.env` file:

```env
# Database Configuration
DATABASE_URL=mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway
MYSQL_MYSQL_URL=mysql://root:iIZFrgdMlpXAJrScrhPwSsYjmjKcyfLT@switchyard.proxy.rlwy.net:13348/railway

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
API_PORT=3000
API_HOST=0.0.0.0
```

## Database Schema

Your application will automatically create the following tables on first run:

- `users` - User accounts and profiles
- `reports` - Military reports and documents
- `tasks` - Task management
- `chats` - Chat system
- `chat_participants` - Chat membership
- `chat_messages` - Chat messages
- `calendar_events` - Calendar events
- `event_participants` - Event attendance
- `attachments` - File attachments
- `report_comments` - Report comments
- `report_approvals` - Report approval workflow
- `report_revisions` - Report version history
- `notifications` - User notifications
- `user_activity_log` - Activity tracking
- `user_sessions` - Session management

## Default Users

The system will create these default users on first run:

1. **Полковник Зингиев** (Battalion Commander)
   - Email: ivanov@military.gov
   - Role: battalion_commander

2. **Майор Петров** (Company Commander)
   - Email: petrov@military.gov
   - Role: company_commander

3. **Капитан Сидоров** (Officer)
   - Email: sidorov@military.gov
   - Role: officer

4. **Сержант Козлов** (Soldier)
   - Email: kozlov@military.gov
   - Role: soldier

## Deployment to Railway

### Option 1: Using Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up
```

### Option 2: GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub repository to Railway
3. Railway will automatically deploy on push

## Production Configuration

For production deployment, update these environment variables in Railway dashboard:

```env
NODE_ENV=production
JWT_SECRET=your-actual-secure-jwt-secret
CORS_ORIGIN=https://yourdomain.com
ENABLE_MOCK_DATA=false
```

## Troubleshooting

### Connection Issues
1. Verify your IP is not blocked by Railway
2. Check if the database service is running
3. Ensure connection string is correct

### Database Initialization
If tables are not created automatically:
```bash
# Run the test script to check connection
node test-railway-db.js

# Check backend logs for initialization errors
bun run backend/index.ts
```

### Mock Data Fallback
If database connection fails, the app will fall back to mock data. This is controlled by the `ENABLE_MOCK_DATA` environment variable.

## Security Notes

⚠️ **Important Security Reminders:**

1. **Change JWT Secret**: Update `JWT_SECRET` to a secure random string in production
2. **Database Credentials**: Keep your database credentials secure and never commit them to public repositories
3. **CORS Configuration**: Set proper CORS origins for production
4. **Environment Variables**: Use Railway's environment variable management for sensitive data

## Support

If you encounter any issues:

1. Check the database connection with `node test-railway-db.js`
2. Review backend logs for detailed error messages
3. Ensure all environment variables are properly set
4. Verify Railway database service is running

## Next Steps

1. Test the database connection
2. Start your application
3. Verify all features work with the Railway database
4. Deploy to Railway for production use
5. Set up proper monitoring and backups