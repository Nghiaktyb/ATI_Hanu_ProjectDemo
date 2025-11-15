import { Request, Response, NextFunction } from 'express';
import { verifyJwt, JwtPayload } from '../utils/auth';

// Extend Express Request to include user info
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Authentication middleware - verifies JWT token
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyJwt(token);
    
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Authorization middleware - checks if user has required role
export function authorize(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Helper to check if user is admin or manager
export function isAdminOrManager(role: string): boolean {
  return role === 'admin' || role === 'manager';
}

// Helper to check if user is admin
export function isAdmin(role: string): boolean {
  return role === 'admin';
}

