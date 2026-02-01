# 🚀 Quick Start Guide

## Prerequisites Checklist

- [ ] Node.js 18 or higher installed
- [ ] PostgreSQL installed and running
- [ ] FastAPI backend running on port 8000
- [ ] Git installed

## Step-by-Step Setup

### 1. Database Setup (PostgreSQL)

#### Option A: Local PostgreSQL
```bash
# Start PostgreSQL service
# Windows:
net start postgresql

# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Create database
createdb stockpred

# Or using psql:
psql -U postgres
CREATE DATABASE stockpred;
\q
```

#### Option B: Docker PostgreSQL
```bash
docker run --name stockpred-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=stockpred \
  -p 5432:5432 \
  -d postgres:15
```

#### Option C: Cloud Database (Supabase)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string
4. Use in DATABASE_URL

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
# Windows: notepad .env
# macOS/Linux: nano .env
```

### 3. Configure Environment

Edit `.env` file:
```env
# Database - Update with your credentials
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/stockpred?schema=public"

# Backend API - Ensure backend is running
NEXT_PUBLIC_API_URL="http://localhost:8000/api"

# JWT Secret - Generate a random string (min 32 chars)
# Use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="paste-generated-secret-here"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="another-random-secret"
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Verify database setup (opens Prisma Studio)
npx prisma studio
```

### 5. Start Backend (in separate terminal)

```bash
# Navigate to backend directory
cd ../backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Start FastAPI server
uvicorn app.main:app --reload
```

Verify backend is running:
```bash
curl http://localhost:8000/api/predict/ -X POST \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL"}'
```

### 6. Start Frontend

```bash
# In frontend directory
npm run dev
```

### 7. Access Application

Open browser and go to:
```
http://localhost:3000
```

### 8. Create Your First User

1. Click "Sign up"
2. Enter email and password (min 6 chars)
3. Click "Create account"
4. You'll be redirected to dashboard

### 9. Test Prediction

1. Enter a stock symbol (e.g., `AAPL`)
2. Click "Predict"
3. View results with direction and signal

## Common Issues & Solutions

### Issue: "Database connection failed"

**Solution:**
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d stockpred
```

### Issue: "Backend connection failed"

**Solution:**
1. Verify backend is running: `curl http://localhost:8000`
2. Check NEXT_PUBLIC_API_URL in .env
3. Restart both frontend and backend

### Issue: "Prisma Client not found"

**Solution:**
```bash
npx prisma generate
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Or use different port:
npm run dev -- -p 3001
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment Checklist

- [ ] Update DATABASE_URL with production database
- [ ] Set strong JWT_SECRET
- [ ] Update NEXT_PUBLIC_API_URL with production backend
- [ ] Set NODE_ENV=production
- [ ] Run `npm run build` successfully
- [ ] Test all features work
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Configure CORS on backend
- [ ] Set up database backups

## Testing the Application

### Test User Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Prediction (requires token)
```bash
TOKEN="your-jwt-token"

curl -X POST http://localhost:3000/api/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"symbol":"AAPL","prediction":"UP","confidence":0.67,"signal":"BUY"}'
```

## Next Steps

1. ✅ Explore the dashboard
2. ✅ Try batch predictions
3. ✅ Add stocks to watchlist
4. ✅ View analytics charts
5. ✅ Check prediction history
6. ✅ Toggle dark/light mode

## Need Help?

- Check [README.md](README.md) for detailed documentation
- Review [Prisma documentation](https://www.prisma.io/docs)
- Check [Next.js documentation](https://nextjs.org/docs)
- Review backend README for API details

## Development Tips

### Hot Reload
Both frontend and backend support hot reload - save files and see changes instantly

### Database Schema Changes
```bash
# After modifying schema.prisma:
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

### View Database
```bash
# Open Prisma Studio
npx prisma studio
# Opens at http://localhost:5555
```

### Environment Variables
Never commit `.env` file - it contains secrets!

---

**You're all set! Happy predicting! 📈**
