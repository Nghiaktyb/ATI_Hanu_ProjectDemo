import { Router } from "express";
import { getAllStaff, getAllTimesheets, createPayItems, getPayItems, findStaffByEmail } from "../db/mysql";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();

// All payroll routes require authentication
router.use(authenticate);

function hoursBetween(inAt?: string, outAt?: string, breakMins?: number) {
  if (!inAt || !outAt) return 0;
  const start = new Date(inAt).getTime();
  const end = new Date(outAt).getTime();
  const mins = Math.max(0, (end - start) / 60000 - (breakMins ?? 0));
  return mins / 60;
}

// POST /payroll/run - Only Admin can run payroll
router.post("/run", authorize('admin'), async (req, res) => {
  try {
    const now = new Date();
    const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const { period = defaultPeriod, hourlyRate = 5 } = req.body || {};
    
    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: "Period must be in format YYYY-MM" });
    }
    
    const rate = typeof hourlyRate === 'number' ? hourlyRate : parseFloat(String(hourlyRate));
    if (isNaN(rate) || rate < 0) {
      return res.status(400).json({ error: "Hourly rate must be a positive number" });
    }
    
  const results: any[] = [];
  const staff = await getAllStaff();
  const times = await getAllTimesheets();

  for (const s of staff) {
    const sheets = times.filter((t) => t.staffId === s.id);
    let totalHours = 0;
    for (const t of sheets) totalHours += hoursBetween(t.inAt, t.outAt, t.breakMins);
      const gross = Math.round(totalHours * rate * 100) / 100;
    results.push({ staffId: s.id, period, component: 'BASE', quantity: totalHours, amount: gross });
  }

  const created = await createPayItems(results);
  res.json({ period, items: created });
  } catch (e: any) {
    console.error('[/payroll/run] Error:', e);
    res.status(500).json({ error: e.message || "Failed to run payroll" });
  }
});

// GET /payroll/items - Admin only: all items, Staff: own items only, Managers: blocked
router.get("/items", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const userRole = (user.role || '').toLowerCase().trim();

    // Managers are explicitly blocked from accessing payroll
    if (userRole === 'manager') {
      return res.status(403).json({ error: "Payroll access is restricted to administrators only" });
    }

    const allItems = await getPayItems();

    // Only admins can see all items
    if (userRole === 'admin') {
      return res.json({ data: allItems });
    }

    // Staff can only see their own items
    if (userRole === 'staff') {
      const staff = await findStaffByEmail(user.email);
      if (!staff) {
        return res.json({ data: [] });
      }
      const ownItems = allItems.filter(item => item.staffId === staff.id);
      return res.json({ data: ownItems });
    }

    // Any other role is blocked
    return res.status(403).json({ error: "Insufficient permissions" });
  } catch (e: any) {
    console.error('[/payroll/items] Get error:', e);
    res.status(500).json({ error: e.message || "Failed to fetch pay items" });
  }
});

export default router;
