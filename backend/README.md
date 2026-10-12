# Third Eye Backend API

The authentication and cloud synchronization backend for the Third Eye Agentic IDE.

## Features
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing.
- **Registration Fields**: Full Name, Email, Phone Number, Password.
- **Social OAuth Ready**: Endpoints for Google and Apple authentication.
- **MongoDB Database**: Mongoose model with in-memory dev mode fallback when MongoDB is offline.
- **Protected Endpoints**: Bearer token authentication middleware for user profile retrieval and updates.

## Tech Stack
- **Node.js** (v18+)
- **Express.js**
- **MongoDB / Mongoose**
- **JSON Web Tokens (JWT)**
- **Bcryptjs**

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Configuration variables:
```env
PORT=5001
JWT_SECRET=your_jwt_secret_key_here
MONGODB_URI=mongodb://localhost:27017/thirdeye
DEV_MOCK_STORAGE=true
```

### 3. Run the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Public Endpoints
- `GET /api/health` — Health check status
- `POST /api/auth/register` — Register a new account (`name`, `email`, `phone`, `password`)
- `POST /api/auth/login` — Sign in with email and password (`email`, `password`)
- `POST /api/auth/google` — Continue with Google (`googleId`, `email`, `name`, `avatar`, `phone`)
- `POST /api/auth/apple` — Continue with Apple (`appleId`, `email`, `name`, `phone`)

### Protected Endpoints (Requires `Authorization: Bearer <token>`)
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `PUT /api/auth/profile` — Update account profile details
