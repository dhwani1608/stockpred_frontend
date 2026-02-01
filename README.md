# 📈 StockPred Frontend

A modern, production-ready Next.js frontend for AI-powered stock prediction analysis.

## ✨ Features

### Core Functionality
- 🤖 **AI-Powered Predictions** - Real-time stock direction predictions using XGBoost ML model
- 📊 **Batch Analysis** - Analyze multiple stocks simultaneously
- ⭐ **Watchlist Management** - Track and monitor your favorite stocks
- 📈 **Interactive Charts** - Beautiful, responsive charts with Recharts
- 📜 **Prediction History** - View and filter past predictions
- 🎯 **Analytics Dashboard** - Visualize trends and patterns

### Authentication & Security
- 🔐 **JWT Authentication** - Secure token-based auth
- 👤 **User Management** - Signup, login, and profile management
- 🛡️ **Protected Routes** - Automatic authentication checks
- 🔒 **Password Hashing** - Bcrypt password encryption

### UI/UX
- 🌓 **Dark/Light Mode** - Fully themed with next-themes
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 🎨 **Modern Design** - ShadCN/UI components, Tailwind CSS
- ⚡ **Fast & Smooth** - Optimized performance, skeleton loaders
- 🔔 **Toast Notifications** - User feedback for all actions

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** ShadCN/UI
- **State Management:** React Query (TanStack Query)
- **Charts:** Recharts
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with jose
- **Icons:** Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- FastAPI backend running (see backend README)

## 🚀 Installation

### 1. Clone and Navigate
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the frontend directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stockpred?schema=public"

# Backend API
NEXT_PUBLIC_API_URL="http://localhost:8000/api"

# JWT Secret (use a strong, random string)
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── me/
│   │   ├── watchlist/         # Watchlist CRUD
│   │   └── predictions/       # Prediction history
│   ├── dashboard/             # Main application
│   │   ├── page.tsx          # Prediction dashboard
│   │   ├── batch/            # Batch predictions
│   │   ├── watchlist/        # Watchlist management
│   │   ├── history/          # Prediction history
│   │   ├── analytics/        # Charts & analytics
│   │   └── layout.tsx        # Dashboard layout
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home (redirects to login)
│   └── globals.css           # Global styles
│
├── components/
│   ├── ui/                   # ShadCN/UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   ├── select.tsx
│   │   └── ...
│   └── providers.tsx         # React Query & Theme providers
│
├── lib/
│   ├── api.ts               # Backend API client
│   ├── auth.ts              # JWT utilities
│   ├── db.ts                # Prisma client
│   └── utils.ts             # Helper functions
│
├── prisma/
│   └── schema.prisma        # Database schema
│
├── public/                  # Static assets
├── .env                     # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🗄️ Database Schema

### Users
```prisma
model User {
  id           String       @id @default(cuid())
  email        String       @unique
  passwordHash String
  name         String?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  
  watchlists   Watchlist[]
  predictions  Prediction[]
}
```

### Watchlist
```prisma
model Watchlist {
  id        String   @id @default(cuid())
  userId    String
  symbol    String
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, symbol])
}
```

### Predictions
```prisma
model Prediction {
  id         String   @id @default(cuid())
  userId     String
  symbol     String
  prediction String   // "UP" or "DOWN"
  confidence Float
  signal     String   // "BUY", "SELL", or "NO_TRADE"
  date       DateTime @default(now())
  createdAt  DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 🎯 API Integration

The frontend connects to the FastAPI backend for predictions:

### Prediction Flow
1. User enters stock symbol
2. Frontend calls `POST /api/predict/` on FastAPI backend
3. Backend fetches live data and runs ML model
4. Prediction returned with confidence and signal
5. Frontend saves prediction to database
6. Results displayed with charts

### Example API Call
```typescript
const response = await fetch('http://localhost:8000/api/predict/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ symbol: 'AAPL' }),
})

const prediction = await response.json()
// {
//   symbol: 'AAPL',
//   direction: 'UP',
//   confidence: 0.67,
//   signal: 'BUY',
//   timestamp: '2025-02-01T10:30:00'
// }
```

## 🎨 Features Walkthrough

### 1️⃣ Authentication
- **Signup:** Create account with email/password
- **Login:** JWT token stored in localStorage
- **Auto-redirect:** Unauthenticated users redirected to login
- **Logout:** Clear session and redirect

### 2️⃣ Dashboard
- Enter any stock symbol (e.g., AAPL, GOOGL, TSLA)
- Get instant prediction with direction and confidence
- View trading signal (BUY/SELL/NO_TRADE)
- Beautiful, color-coded UI

### 3️⃣ Batch Predictions
- Add multiple symbols
- Get predictions for all at once
- Sortable table by symbol, confidence, or signal
- Click headers to sort

### 4️⃣ Watchlist
- Save favorite stocks
- Get quick predictions for all watchlist items
- Remove stocks easily
- Persistent storage per user

### 5️⃣ History
- View all past predictions
- Filter by symbol or signal type
- See statistics (total, buy/sell counts, avg confidence)
- Detailed table view

### 6️⃣ Analytics
- **Confidence Over Time:** Line chart showing trends
- **Signal Distribution:** Pie chart of BUY/SELL/NO_TRADE
- **Direction Distribution:** Bar chart of UP vs DOWN
- **Confidence by Signal:** Compare signal confidence levels
- Filter by symbol

## 🔧 Configuration

### Backend URL
Update `NEXT_PUBLIC_API_URL` in `.env`:
```env
NEXT_PUBLIC_API_URL="http://your-backend-url:8000/api"
```

### Database
For PostgreSQL on a different host:
```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"
```

For production (e.g., Supabase, Heroku):
```env
DATABASE_URL="postgresql://user:pass@db.host.com:5432/dbname?sslmode=require"
```

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    DEFAULT: "hsl(221.2 83.2% 53.3%)",
    foreground: "hsl(210 40% 98%)",
  },
  // Add custom colors...
}
```

### Trading Signal Thresholds
Edit signal logic in backend or update UI in `lib/utils.ts`

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables (Production)
```env
DATABASE_URL="postgresql://prod-user:prod-pass@prod-db:5432/stockpred"
NEXT_PUBLIC_API_URL="https://api.yourapp.com/api"
JWT_SECRET="super-strong-secret-min-32-chars"
NODE_ENV="production"
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Build command
npm run build

# Publish directory
.next
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration with valid/invalid data
- [ ] Login with correct/incorrect credentials
- [ ] Dashboard prediction for various symbols
- [ ] Batch prediction with multiple symbols
- [ ] Add/remove watchlist items
- [ ] View prediction history with filters
- [ ] Analytics charts display correctly
- [ ] Dark/light mode toggle
- [ ] Mobile responsiveness
- [ ] Toast notifications appear

### Test with Mock Data
```bash
# Seed database with test predictions
npx prisma db seed
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL format
# postgresql://username:password@localhost:5432/database
```

### Backend Connection Error
```bash
# Verify backend is running
curl http://localhost:8000/api/predict/ -X POST \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL"}'
```

### Prisma Issues
```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

### Build Errors
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

## 📊 Performance Optimization

- **React Query** caches API responses
- **Skeleton loaders** for better perceived performance
- **Lazy loading** for charts
- **Optimized images** with Next.js Image
- **Code splitting** automatic with App Router

## 🔒 Security Best Practices

✅ JWT tokens with secure secrets  
✅ Password hashing with bcrypt  
✅ SQL injection prevention (Prisma)  
✅ XSS protection (React escaping)  
✅ HTTPS in production  
✅ Environment variables for secrets  
✅ Protected API routes  

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [ShadCN/UI](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Query](https://tanstack.com/query)
- [Recharts](https://recharts.org)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License - feel free to use this project for learning or production.

## 🙏 Acknowledgments

- FastAPI backend team
- ShadCN for amazing UI components
- Vercel for Next.js
- The open-source community

---

**Built with ❤️ for modern stock prediction analysis**

For backend setup, see `../backend/README.md`
