# Project Information

## Technology Stack

### Backend

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL 8.0
- **ORM**: Knex.js
- **Authentication**: JWT (jsonwebtoken)
- **File Processing**: pdf-parse, mammoth, xlsx, tesseract.js
- **AI Integration**: Google Gemini API

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Development Server**: Vite Dev Server (port 5173)
- **Production Server**: Nginx

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Database**: MySQL 8.0
- **Web Server**: Nginx (production) / Vite (development)
- **Database Admin**: Adminer

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ HTTP
       │
┌──────▼──────────┐      ┌──────────┐      ┌──────────┐
│   Frontend      │      │ Backend  │      │ Database │
│   (Vite/Nginx)  │◄────►│ (Express)│◄────►│ (MySQL)  │
│   Port: 5173/80 │      │ Port:4000│      │ Port:3307│
└─────────────────┘      └──────────┘      └──────────┘
```

## Database Schema

### Tables

- `users` - Authentication users (admin, manager, staff roles)
- `staff` - Staff members with role, department, jobTitle
- `shifts` - Work shifts with assignments
- `timesheets` - Clock in/out records
- `pay_items` - Payroll items
- `training_courses` - Training courses
- `training_course_materials` - Multiple materials per course (PDF, DOCX, etc.)
- `training_assignments` - Course assignments with progress tracking

### Key Features

- **Role-Based Access Control**: Admin, Manager, Staff with different permissions
- **Progress Tracking**: Training assignments track completion percentage, time spent, and notes
- **Multiple Materials**: Each course can have multiple uploaded materials
- **Admin Mode**: Separate document storage for confidential files in AI assistant

## API Structure

All API endpoints are RESTful and require JWT authentication:

### Authentication

- `POST /auth/login` - User login
- `POST /auth/reset-password` - Password reset

### Staff Management

- `GET /staff` - List all staff (role-filtered)
- `POST /staff` - Create staff (admin/manager only)
- `PATCH /staff/:id` - Update staff (admin/manager only)
- `DELETE /staff/:id` - Delete staff (admin/manager only)

### Scheduling & Timesheets

- `GET /shifts` - List shifts (role-filtered)
- `POST /shifts` - Create shift (admin/manager only)
- `PATCH /shifts/:id` - Update shift (admin/manager only)
- `DELETE /shifts/:id` - Delete shift (admin/manager only)
- `GET /timesheets` - List timesheets (role-filtered)
- `POST /timesheets` - Create timesheet entry
- `PATCH /timesheets/:id` - Update timesheet

### Payroll

- `POST /payroll/run` - Calculate payroll (admin only)
- `GET /payroll/items` - List payroll items (admin: all, staff: own only)

### Training

- `GET /training/courses` - List all courses
- `GET /training/courses/:id` - Get course with materials
- `POST /training/courses` - Create course (admin/manager only)
- `PATCH /training/courses/:id` - Update course (admin/manager only)
- `DELETE /training/courses/:id` - Delete course (admin/manager only)
- `POST /training/courses/:id/upload` - Upload multiple materials (admin/manager only)
- `GET /training/courses/:id/materials` - List course materials
- `DELETE /training/courses/:id/materials/:materialId` - Delete material (admin/manager only)
- `GET /training/courses/:id/materials/:materialId/download` - Download material
- `GET /training/assignments` - List assignments (role-filtered)
- `POST /training/assignments` - Assign course to staff (admin/manager only)
- `PATCH /training/assignments/:id` - Update assignment (progress, status, notes)
- `DELETE /training/assignments/:id` - Delete assignment (admin/manager only)
- `GET /training/stats` - Training statistics (admin/manager only)

### AI Assistant

- `POST /ai/chat` - Ask questions (supports admin mode for confidential docs)
- `GET /ai/documents` - List documents (supports admin mode)
- `POST /ai/documents/upload` - Upload documents (admin/manager only, supports admin mode)
- `DELETE /ai/documents/:name` - Delete document (admin/manager only, supports admin mode)

## Security

- JWT-based authentication with role-based access control
- Password hashing with bcrypt
- CORS enabled for frontend
- Environment variables for secrets (API keys, JWT secret, DB credentials)
- Role-based route protection (admin, manager, staff)
- Admin mode for confidential document separation

## Role Permissions

### Admin

- Full access to all features
- Can calculate payroll
- Can manage all staff, shifts, timesheets
- Can upload and manage course materials
- Can access admin mode in AI assistant

### Manager

- Access to all features except payroll
- Can manage staff, shifts, timesheets
- Can upload and manage course materials
- Can access admin mode in AI assistant
- Cannot calculate payroll

### Staff

- View own timesheets and payroll items
- View assigned courses
- Update own training progress
- Can use AI assistant (public documents only)
- Cannot upload documents or materials

## File Storage

- **Documents (AI)**:
  - Public: `backend/data/docs/public/`
  - Admin: `backend/data/docs/admin/`
  - Metadata: `backend/data/docs_metadata.json` and `docs_admin_metadata.json`
- **Training Materials**: `backend/data/training/`
- **Temporary Uploads**: `backend/uploads/`

## Features

### Staff Management

- Create, read, update, delete staff
- Role assignment (admin, manager, staff)
- Department and job title assignment
- Profile display with role, department, job title

### Scheduling

- Create and manage work shifts
- Assign multiple staff to shifts
- View shifts by date and location

### Timesheets

- Clock in/out functionality
- Break time tracking
- Automatic hours calculation
- View timesheet history

### Payroll

- Calculate payroll by period
- Hourly rate configuration
- Automatic calculation from timesheets
- Role-restricted (admin only)

### Training

- Create courses with multiple materials
- Assign courses to multiple staff at once
- Progress tracking (percentage, time spent, notes)
- Material upload/download
- "My Courses" view for staff
- Course expansion to view details

### AI Assistant

- Document upload (PDF, DOCX, XLSX, TXT, MD, CSV, images)
- Question answering based on uploaded documents
- Admin mode for confidential documents
- Separate document storage for admin/manager
- Citation tracking

## Development vs Production

### Development

- Hot module replacement (HMR) enabled
- Vite dev server on port 5173
- Source maps available
- Detailed error messages
- Auto-rebuild on file changes
- Volume mounts for live code editing

### Production (Docker)

- Optimized builds
- Multi-stage Docker builds
- Nginx for static serving
- Production dependencies only
- Environment variable configuration

## Environment Variables

### Backend (.env)

- `PORT` - Backend port (default: 4000)
- `JWT_SECRET` - JWT signing secret
- `DB_HOST` - Database host
- `DB_PORT` - Database port (default: 3306)
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASS` - Database password
- `GEMINI_API_KEY` - Google Gemini API key (optional)
- `GEMINI_MODEL` - Gemini model (default: gemini-2.5-flash)

### Frontend

- `VITE_API_URL` - Backend API URL (default: http://localhost:4000)

## Default Credentials

- **Admin**: `admin@example.com` / `admin123`
- **Manager**: `manager@example.com` / `manager123`
- **Staff**: `linh@example.com` / `staff123` or `an@example.com` / `staff123`
