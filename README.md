# Contact Hub

A full-stack contact management application built with NestJS and Next.js.

## Tech Stack

- **Backend**: NestJS, PostgreSQL, TypeORM, JWT Authentication
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4
- **Features**: User authentication, role-based access control, contact CRUD, dark mode

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or Supabase)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with your database credentials:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=contact_hub
   DB_SSL=false

   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRES_IN=1d
   PORT=3001
   ```

4. Start the backend server:
   ```bash
   npm run start:dev
   ```

   Backend runs on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:3000`

## Usage

1. Register a new account at `/register`
2. Login at `/login`
3. Create and manage contacts at `/contacts`
4. Admin users can access `/admin` for user and contact management

## Project Structure

```
Contact-Hub/
├── backend/          # NestJS API
│   └── src/
│       ├── auth/     # Authentication module
│       ├── contacts/ # Contact CRUD
│       ├── admin/    # Admin features
│       └── common/   # Shared utilities
└── frontend/         # Next.js app
    └── app/          # Pages and routes
```

Made with ❤️ for learning and productivity.
