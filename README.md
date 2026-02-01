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

**Built with ❤️ for modern stock prediction analysis**

For backend setup, see `../backend/README.md`
