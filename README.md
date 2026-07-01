# Eye's On U

A full-stack task management and team collaboration app built with Next.js 16.2.9 (App Router) on the frontend and Express + TypeScript + MongoDB on the backend.

## Project Overview

Eye's On U is a modern team productivity dashboard that supports:

- Authentication with signup, login, email verification, forgot password, OTP validation, and reset password flows
- Role-based access control for `admin` and `employee` users
- Admin team management with role assignment and specialization selection
- Task creation, assignment, status updates, and filtered task views
- User profile editing, avatar upload, and secure profile management
- Cloudinary image upload support and email notifications via SMTP

## Repository Structure

- `src/` - Next.js frontend application
  - `app/` - App Router pages and layouts
  - `components/` - UI components and reusable widgets
  - `services/` - API service layer for auth and dashboard calls
  - `store/` - Zustand stores for auth, tasks, team, theme, and toast state
  - `hooks/` - custom React hooks
  - `types/` - TypeScript domain models
  - `lib/` - shared client utilities like Axios config
- `backend/` - Express API server
  - `src/app.ts` - Express app config and middleware
  - `src/server.ts` - backend entrypoint
  - `src/routes/` - auth, user, and task routes
  - `src/controllers/` - request handlers for auth, users, and tasks
  - `src/models/` - Mongoose schemas for User, Task, OTP
  - `src/config/` - database, mail, and Cloudinary config
  - `src/services/` - mail, OTP, and Cloudinary helpers
  - `src/middlewares/` - auth, error, upload security middleware

## Technologies

- Frontend: Next.js 16.2.9, React 19.2.4, TypeScript, Tailwind CSS v4, Zustand, Axios, Radix UI, Framer Motion
- Backend: Node.js, Express 5, TypeScript, Mongoose, MongoDB, JSON Web Tokens, Nodemailer, Cloudinary
- Deployment-ready: app router, optimized builds, secure CORS, rate limiting, helmet headers

## Requirements

- Node.js 20+ recommended
- npm installed
- MongoDB connection string
- SMTP credentials for email delivery
- Cloudinary account for image uploads (optional but recommended)

## Local Setup

### 1. Clone repo

```bash
git clone <repository-url>
cd Eye-s-On-U
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file in `backend/` with the following values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> If you use MongoDB Atlas with `mongodb+srv://`, the backend will also try a fallback connection URL with `mongodb://...:27017`.

### 5. Run backend

```bash
cd backend
npm run dev
```

### 6. Run frontend

```bash
cd ..
npm run dev
```

Open `http://localhost:3000` in your browser.

## Backend API Endpoints

### Auth Routes

- `POST /api/auth/register` or `/api/auth/signup` - create user account with optional avatar upload
- `POST /api/auth/verify-otp` - verify signup OTP
- `POST /api/auth/login` - user login
- `POST /api/auth/forgot-password` - request password reset OTP
- `POST /api/auth/verify-forgot-otp` - validate forgot-password OTP
- `POST /api/auth/reset-password` - complete password reset
- `POST /api/auth/resend-otp` - resend OTP email
- `POST /api/auth/logout` - log out current session

### User Routes (protected)

- `GET /api/user/profile` - get current user profile
- `PUT /api/user/profile` - update name, bio, avatar, and admin-only specialization
- `GET /api/user/team` - list all team members with role and specialization
- `PUT /api/user/member/:id` - admin-only update of a specific member role/specialization
- `PUT /api/user/avatar` - upload profile avatar
- `DELETE /api/user/delete-account` - remove current user account

### Task Routes (protected)

- `GET /api/tasks` - get all tasks
- `GET /api/tasks/:id` - get a single task
- `POST /api/tasks/create` - create a new task
- `PUT /api/tasks/:id` - update task fields
- `PATCH /api/tasks/:id/status` - update task status
- `DELETE /api/tasks/:id` - delete a task

## Frontend Routes

- `/` - landing page
- `/login` - login page
- `/signup` - signup page
- `/forgot-password` - password reset flow
- `/verify-email` - signup email verification
- `/verify-otp` - OTP confirmation screen
- `/dashboard` - main admin dashboard
- `/employee/dashboard` - employee dashboard view
- `/team` - admin team management
- `/team/[id]` - manage an individual team member
- `/profile` - profile and account settings
- `/tasks` - task list and filters
- `/tasks/new` - create a new task
- `/tasks/[id]` - task details and edit

## Key Features

- Role-based admin panel for team and specialization management
- Specialization dropdown options for software development roles
- Secure profile editing with admin-only controls for specialization
- Forgot password flow with OTP verification and password reset
- Task filtering, assignment, and status updates
- Real-time toast notifications and responsive dashboard UI

## Notes

- The frontend uses a shared Zustand store for tasks, members, auth, and UI state.
- The backend enforces admin-only updates for role and specialization changes.
- Cloudinary support is built in for avatar image uploads.
- SMTP configuration is required to send OTP and verification emails.

## Build

```bash
npm run build
```

## Backend Build

```bash
cd backend
npm run build
```

## License

This project is currently unlicensed. Add a license file if you want to publish or share it publicly.
