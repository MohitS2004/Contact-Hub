
# Contact Hub Backend

This is the backend service for the Contact Hub project, built with NestJS.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and update values:
   - Database connection (PostgreSQL)
   - JWT secret and expiry
3. Make sure PostgreSQL is running and the database exists.
4. Run the development server:
   ```bash
   npm run start:dev
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password

## Database

- Uses TypeORM with PostgreSQL
- `synchronize: true` in development (auto-creates tables from entities)
- Tables are created automatically when the app starts

## Folders

- `src/` – Source code
- `src/auth/` – Authentication module
- `uploads/` – File uploads
