import { Router } from "express";
import { getAllStaff, createStaff, getStaffById, updateStaff, deleteStaff, Staff, findStaffByEmail, findUserByEmail, createUser, updateUserByEmail } from "../db/mysql";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import bcrypt from "bcryptjs";

const router = Router();

// All staff routes require authentication
router.use(authenticate);

// GET /staff - All authenticated users can see all staff
router.get("/", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    
    // All authenticated users (admin, manager, staff) can see all staff
    const data = await getAllStaff();
    return res.json({ data });
  } catch (e: any) {
    console.error('[/staff] Get error:', e);
    res.status(500).json({ error: e.message || "Failed to fetch staff" });
  }
});

const ALLOWED_ROLES = ['admin', 'manager', 'staff'];

function normalizeRole(role?: string | null) {
  if (!role) return 'staff';
  const lower = role.toLowerCase();
  return ALLOWED_ROLES.includes(lower) ? lower : 'staff';
}

// POST /staff - Only Admin/Manager can create staff
router.post("/", authorize('admin', 'manager'), async (req, res) => {
  try {
    const { firstName, lastName, email, department, location, role, jobTitle } = req.body || {};
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: "First name, last name, and email are required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedRole = normalizeRole(role);
    
    // Check if user already exists
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ error: "A user with this email already exists" });
    }
    
    // Generate a temporary password (8 characters: 4 random letters + 4 random digits)
    const generateTempPassword = () => {
      const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const digits = '0123456789';
      let password = '';
      // 4 random letters
      for (let i = 0; i < 4; i++) {
        password += letters.charAt(Math.floor(Math.random() * letters.length));
      }
      // 4 random digits
      for (let i = 0; i < 4; i++) {
        password += digits.charAt(Math.floor(Math.random() * digits.length));
      }
      // Shuffle the password
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };
    
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    
    // Create user account
    await createUser({ email: normalizedEmail, passwordHash, role: normalizedRole });
    
    // Create staff record
    const s = await createStaff({ firstName, lastName, email: normalizedEmail, department, location, jobTitle, role: normalizedRole });
    
    // Return staff data with temporary password (only shown once)
    res.status(201).json({ 
      data: s,
      tempPassword: tempPassword // Include temporary password in response
    });
  } catch (e: any) {
    console.error('[/staff] Create error:', e);
    res.status(500).json({ error: e.message || "Failed to create staff" });
  }
});

// GET /staff/:id - Admin/Manager: any staff, Staff: own profile only
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const s = await getStaffById(req.params.id);
    if (!s) return res.status(404).json({ error: "Not found" });
    
    // Staff can only view their own profile
    if (user.role === 'staff' && s.email !== user.email) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    res.json({ data: s });
  } catch (e: any) {
    console.error('[/staff/:id] Get error:', e);
    res.status(500).json({ error: e.message || "Failed to fetch staff" });
  }
});

// PATCH /staff/:id - Admin/Manager: any staff, Staff: own profile only
router.patch("/:id", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const s = await getStaffById(req.params.id);
    if (!s) return res.status(404).json({ error: "Not found" });
    
    // Staff can only update their own profile
    if (user.role === 'staff' && s.email !== user.email) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    const { role: requestedRole, email: requestedEmail, jobTitle, ...rest } = req.body || {};

    // Prevent staff users from elevating privileges
    if (requestedRole && user.role === 'staff') {
      return res.status(403).json({ error: "Insufficient permissions to change role" });
    }

    const updates: Record<string, any> = { ...rest };
    if (typeof jobTitle !== 'undefined') {
      updates.jobTitle = jobTitle;
    }
    let targetEmail = s.email;

    if (requestedEmail && requestedEmail !== s.email) {
      const emailLower = String(requestedEmail).trim().toLowerCase();
      if (!emailLower) {
        return res.status(400).json({ error: "Email cannot be empty" });
      }
      const emailExists = await findUserByEmail(emailLower);
      if (emailExists) {
        return res.status(400).json({ error: "Another user already uses this email" });
      }
      updates.email = emailLower;
      await updateUserByEmail(s.email, { email: emailLower });
      targetEmail = emailLower;
    }

    if (requestedRole) {
      const normalizedRole = normalizeRole(requestedRole);
      await updateUserByEmail(targetEmail, { role: normalizedRole });
      updates.role = normalizedRole;
    }

    let updated: Staff | null = null;
    if (Object.keys(updates).length > 0) {
      const staffRecord = await updateStaff(req.params.id, updates);
      if (!staffRecord) return res.status(404).json({ error: "Not found" });
      updated = staffRecord;
    } else {
      const staffRecord = await getStaffById(req.params.id);
      updated = staffRecord || null;
    }
    
    // If role was changed and this is the current user's profile, return the new role
    const response: any = { data: updated };
    if (requestedRole && updated && updated.email === user.email) {
      response.updatedRole = normalizeRole(requestedRole);
    }
    
    res.json(response);
  } catch (e: any) {
    console.error('[/staff/:id] Update error:', e);
    res.status(500).json({ error: e.message || "Failed to update staff" });
  }
});

// DELETE /staff/:id - Only Admin/Manager can delete staff
router.delete("/:id", authorize('admin', 'manager'), async (req, res) => {
  try {
    await deleteStaff(req.params.id);
    res.status(204).end();
  } catch (e: any) {
    console.error('[/staff/:id] Delete error:', e);
    res.status(500).json({ error: e.message || "Failed to delete staff" });
  }
});

export default router;
