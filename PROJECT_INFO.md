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

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Server**: Nginx (production)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: MySQL 8.0
- **Web Server**: Nginx (frontend)

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
│   (Nginx)       │◄────►│ (Express)│◄────►│ (MySQL)  │
│   Port: 80      │      │ Port:4000│      │ Port:3306│
└─────────────────┘      └──────────┘      └──────────┘
```

## Database Schema

### Tables
- `users` - Authentication users
- `staff` - Staff members
- `shifts` - Work shifts
- `timesheets` - Clock in/out records
- `pay_items` - Payroll items
- `training_courses` - Training courses
- `training_assignments` - Course assignments

## API Structure

All API endpoints are RESTful:

- `/auth/*` - Authentication
- `/staff/*` - Staff management
- `/shifts/*` - Shift and timesheet management
- `/payroll/*` - Payroll calculations
- `/training/*` - Training management
- `/ai/*` - AI document Q&A

## Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS enabled for frontend
- Environment variables for secrets

## File Storage

- Documents: `backend/data/docs/`
- Training files: `backend/data/training/`
- Uploads: `backend/uploads/`

## Development vs Production

### Development
- Hot reload enabled
- Source maps available
- Detailed error messages

### Production (Docker)
- Optimized builds
- Multi-stage Docker builds
- Nginx for static serving
- Production dependencies only

