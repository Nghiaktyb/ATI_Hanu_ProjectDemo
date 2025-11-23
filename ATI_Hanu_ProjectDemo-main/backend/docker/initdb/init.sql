-- init.sql
-- This script runs only on fresh container initialization and ensures the database exists
CREATE DATABASE IF NOT EXISTS `staff_platform` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Note: user creation is managed by the container env (MYSQL_USER / MYSQL_PASSWORD). If you rely on a non-root user
-- make sure to set DB_USER/DB_PASS in your backend/.env to match.
