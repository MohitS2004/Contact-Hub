# Contact Hub

A full-stack contact management application built with NestJS and Next.js.

## Tech Stack

- **Backend**: NestJS, PostgreSQL, TypeORM, JWT Authentication
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4
- **Features**: User authentication, role-based access control, contact CRUD, dark mode, CSV export, PWA support, mobile responsive

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

## Docker Setup

### Prerequisites

- Docker and Docker Compose installed

### Running with Docker

1. Build and start all services:
   ```bash
   docker-compose up -d
   ```

2. View logs:
   ```bash
   docker-compose logs -f
   ```

3. Stop all services:
   ```bash
   docker-compose down
   ```

4. Stop and remove volumes (clears database):
   ```bash
   docker-compose down -v
   ```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

## Usage

1. Register a new account at `/register`
2. Login at `/login`
3. Create and manage contacts at `/contacts`
4. Admin users can access `/admin` for user and contact management
5. Export contacts to CSV from the contacts list page
6. Upload profile photos for contacts during creation or editing

## PWA Features

The application is a Progressive Web App (PWA) with:

- **Offline Support**: Service worker caches essential pages for offline access
- **Installable**: Can be installed on mobile devices and desktops
- **Mobile Responsive**: Fully responsive design with hamburger menu for mobile navigation
- **App Icons**: Add `icon-192x192.png` and `icon-512x512.png` to `frontend/public/` to complete PWA setup (see `frontend/public/PWA_ICONS_README.md`)

## Mobile Responsiveness

The application is fully responsive and optimized for:

- Mobile phones (320px and up)
- Tablets (768px and up)
- Desktops (1024px and up)

Features include:
- Hamburger menu for mobile navigation
- Responsive tables with horizontal scroll
- Mobile-optimized forms and buttons
- Touch-friendly interface elements

## API Documentation

Base URL: `http://localhost:3001`

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Contacts

All contact endpoints require authentication (Bearer token).

#### Get All Contacts
```http
GET /contacts?page=1&limit=10&search=john&sortBy=name&sortOrder=ASC
Authorization: Bearer <token>
```

#### Get Contact by ID
```http
GET /contacts/:id
Authorization: Bearer <token>
```

#### Create Contact
```http
POST /contacts
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "photo": <file> (optional)
}
```

#### Update Contact
```http
PUT /contacts/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "0987654321",
  "photo": <file> (optional)
}
```

#### Delete Contact
```http
DELETE /contacts/:id
Authorization: Bearer <token>
```

#### Export Contacts to CSV
```http
GET /contacts/export
Authorization: Bearer <token>
```

### Admin Endpoints

Admin endpoints require admin role.

#### Get Stats
```http
GET /admin/stats
Authorization: Bearer <token>
```

#### Get All Users
```http
GET /admin/users?page=1&limit=10&search=user
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /admin/users/:id
Authorization: Bearer <token>
```

#### Update User Role
```http
PUT /admin/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"
}
```

#### Delete User
```http
DELETE /admin/users/:id
Authorization: Bearer <token>
```

#### Get All Contacts (Admin)
```http
GET /admin/contacts?page=1&limit=10
Authorization: Bearer <token>
```

#### Delete Contact (Admin)
```http
DELETE /admin/contacts/:id
Authorization: Bearer <token>
```

### Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

**Paginated Response:**
```json
{
  "items": [ ... ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

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

