# Reset Database to Create All Users

If you can't sign in with manager or staff accounts, you may need to reset the database to create all user accounts.

## Option 1: Reset Database (Removes All Data)

```bash
# Stop all services
docker-compose down -v

# Start services again (will recreate database and all users)
docker-compose up -d --build
```

Wait 30-60 seconds for the database to initialize, then try logging in with:

- **Admin**: `admin@example.com` / `admin123`
- **Manager**: `manager@example.com` / `manager123`
- **Staff 1**: `linh@example.com` / `staff123`
- **Staff 2**: `an@example.com` / `staff123`

## Option 2: Manually Create Users via Adminer

1. Open http://localhost:8080 (Adminer)
2. Login with:
   - System: MySQL
   - Server: `db`
   - Username: `root`
   - Password: `Nghia27112004@`
   - Database: `staff_platform`

3. Go to SQL command and run:

```sql
-- Create manager user (if doesn't exist)
INSERT IGNORE INTO users (id, email, passwordHash, role, createdAt)
VALUES (
  UUID(),
  'manager@example.com',
  '$2a$10$rK8qJ8qJ8qJ8qJ8qJ8qJ8uJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8q',
  'manager',
  NOW()
);

-- Create staff user 1 (if doesn't exist)
INSERT IGNORE INTO users (id, email, passwordHash, role, createdAt)
VALUES (
  UUID(),
  'linh@example.com',
  '$2a$10$rK8qJ8qJ8qJ8qJ8qJ8qJ8uJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8q',
  'staff',
  NOW()
);

-- Create staff user 2 (if doesn't exist)
INSERT IGNORE INTO users (id, email, passwordHash, role, createdAt)
VALUES (
  UUID(),
  'an@example.com',
  '$2a$10$rK8qJ8qJ8qJ8qJ8qJ8qJ8uJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8q',
  'staff',
  NOW()
);
```

**Note**: The password hashes above are placeholders. You'll need to generate proper bcrypt hashes for `manager123` and `staff123`.

## Option 3: Use the Create Users Script

The backend now has improved bootstrap logic that will create users if they don't exist. Simply restart the backend:

```bash
docker-compose restart backend
```

The updated bootstrap code will check for each user individually and create them if they don't exist.

