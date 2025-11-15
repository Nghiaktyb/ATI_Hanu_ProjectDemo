import { Router } from "express";
import {
  getAllShifts,
  createShift,
  assignShift,
  assignMultipleStaff,
  unassignShift,
  getAllTimesheets,
  createTimesheet,
  updateTimesheetByStaffDate,
  findStaffByEmail,
} from "../db/mysql";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();

// All shift routes require authentication
router.use(authenticate);

// GET /shifts - Admin/Manager: all shifts, Staff: assigned shifts only
router.get("/", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const allShifts = await getAllShifts();
    
    // Admin and Manager can see all shifts
    if (user.role === 'admin' || user.role === 'manager') {
      return res.json({ data: allShifts });
    }
    
    // Staff can only see shifts they're assigned to
    if (user.role === 'staff') {
      const staff = await findStaffByEmail(user.email);
      if (!staff) {
        console.log(`[Shifts] Staff not found for email: ${user.email}`);
        return res.json({ data: [] });
      }
      console.log(`[Shifts] Staff ${staff.email} (ID: ${staff.id}) requesting shifts`);
      console.log(`[Shifts] Total shifts: ${allShifts.length}`);
      const assignedShifts = allShifts.filter(shift => {
        if (!shift.assignedStaffIds || !Array.isArray(shift.assignedStaffIds)) {
          console.log(`[Shifts] Shift ${shift.id} has invalid assignedStaffIds:`, shift.assignedStaffIds);
          return false;
        }
        const isAssigned = shift.assignedStaffIds.includes(staff.id);
        if (isAssigned) {
          console.log(`[Shifts] Shift ${shift.id} (${shift.title}) is assigned to staff ${staff.id}`);
          console.log(`[Shifts] Shift assignedStaffIds:`, shift.assignedStaffIds);
        } else {
          console.log(`[Shifts] Shift ${shift.id} assignedStaffIds:`, shift.assignedStaffIds, `(looking for ${staff.id})`);
        }
        return isAssigned;
      });
      console.log(`[Shifts] Assigned shifts for ${staff.email}: ${assignedShifts.length}`);
      return res.json({ data: assignedShifts });
    }
    
    res.json({ data: [] });
  } catch (e: any) {
    console.error('[/shifts] Get error:', e);
    res.status(500).json({ error: e.message || "Failed to fetch shifts" });
  }
});

// POST /shifts - Only Admin/Manager can create shifts
router.post("/", authorize('admin', 'manager'), async (req, res) => {
  try {
  const { title, location, startAt, endAt } = req.body || {};
    if (!title || !startAt || !endAt) {
      return res.status(400).json({ error: "Title, start time, and end time are required" });
    }
  const shifts = await createShift({ title, location, startAt, endAt, assignedStaffIds: [] });
  res.status(201).json({ data: shifts });
  } catch (e: any) {
    console.error('[/shifts] Create error:', e);
    res.status(500).json({ error: e.message || "Failed to create shift" });
  }
});

// POST /shifts/:id/assign - Only Admin/Manager can assign staff to shifts
// Supports both single staffId and multiple staffIds array
router.post("/:id/assign", authorize('admin', 'manager'), async (req, res) => {
  try {
    const { staffId, staffIds } = req.body || {};
    
    // If staffIds array is provided, use bulk assignment
    if (staffIds && Array.isArray(staffIds) && staffIds.length > 0) {
      console.log(`[/shifts/:id/assign] Bulk assigning ${staffIds.length} staff to shift ${req.params.id}`);
      const shift = await assignMultipleStaff(req.params.id, staffIds);
      if (!shift) return res.status(404).json({ error: "Shift not found" });
      console.log(`[/shifts/:id/assign] Bulk assignment complete. Shift now has ${shift.assignedStaffIds.length} staff:`, shift.assignedStaffIds);
      return res.json({ data: shift });
    }
    
    // Otherwise, use single assignment
    if (!staffId) {
      return res.status(400).json({ error: "Staff ID or staffIds array is required" });
    }
  const shift = await assignShift(req.params.id, staffId);
  if (!shift) return res.status(404).json({ error: "Shift not found" });
  res.json({ data: shift });
  } catch (e: any) {
    console.error('[/shifts/:id/assign] Error:', e);
    res.status(500).json({ error: e.message || "Failed to assign shift" });
  }
});

// POST /shifts/:id/unassign - Only Admin/Manager can unassign staff from shifts
router.post("/:id/unassign", authorize('admin', 'manager'), async (req, res) => {
  try {
    const { staffId } = req.body || {};
    if (!staffId) {
      return res.status(400).json({ error: "Staff ID is required" });
    }
    const shift = await unassignShift(req.params.id, staffId);
    if (!shift) return res.status(404).json({ error: "Shift not found" });
    res.json({ data: shift });
  } catch (e: any) {
    console.error('[/shifts/:id/unassign] Error:', e);
    res.status(500).json({ error: e.message || "Failed to unassign shift" });
  }
});

// GET /shifts/timesheets - Admin/Manager: all timesheets, Staff: own timesheets only
router.get("/timesheets", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const allTimesheets = await getAllTimesheets();
    
    // Admin and Manager can see all timesheets
    if (user.role === 'admin' || user.role === 'manager') {
      return res.json({ data: allTimesheets });
    }
    
    // Staff can only see their own timesheets
    if (user.role === 'staff') {
      const staff = await findStaffByEmail(user.email);
      if (!staff) {
        return res.json({ data: [] });
      }
      const ownTimesheets = allTimesheets.filter(t => t.staffId === staff.id);
      return res.json({ data: ownTimesheets });
    }
    
    res.json({ data: [] });
  } catch (e: any) {
    console.error('[/shifts/timesheets] Get error:', e);
    res.status(500).json({ error: e.message || "Failed to fetch timesheets" });
  }
});

// POST /shifts/timesheets/clockin - Staff: own clock-in, Admin/Manager: any staff
router.post("/timesheets/clockin", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    let { staffId, date, inAt } = req.body || {};
    
    // Staff can only clock in for themselves
    if (user.role === 'staff') {
      const staff = await findStaffByEmail(user.email);
      if (!staff) {
        return res.status(404).json({ error: "Staff profile not found" });
      }
      staffId = staff.id; // Force staff to use their own ID
    }
    
    if (!staffId || !date || !inAt) {
      return res.status(400).json({ error: "Staff ID, date, and in time are required" });
    }
    
  const ts = await createTimesheet({ staffId, date, inAt });
  res.status(201).json({ data: ts });
  } catch (e: any) {
    console.error('[/shifts/timesheets/clockin] Error:', e);
    res.status(500).json({ error: e.message || "Failed to clock in" });
  }
});

// POST /shifts/timesheets/clockout - Staff: own clock-out, Admin/Manager: any staff
router.post("/timesheets/clockout", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    let { staffId, date, outAt, breakMins } = req.body || {};
    
    // Staff can only clock out for themselves
    if (user.role === 'staff') {
      const staff = await findStaffByEmail(user.email);
      if (!staff) {
        return res.status(404).json({ error: "Staff profile not found" });
      }
      staffId = staff.id; // Force staff to use their own ID
    }
    
    if (!staffId || !date || !outAt) {
      return res.status(400).json({ error: "Staff ID, date, and out time are required" });
    }
    
    const breakMinsNum = typeof breakMins === 'number' ? breakMins : (breakMins ? parseInt(String(breakMins)) : 0);
    const ts = await updateTimesheetByStaffDate(staffId, date, { outAt, breakMins: breakMinsNum });
  if (!ts) return res.status(404).json({ error: "Timesheet not found" });
  res.json({ data: ts });
  } catch (e: any) {
    console.error('[/shifts/timesheets/clockout] Error:', e);
    res.status(500).json({ error: e.message || "Failed to clock out" });
  }
});

export default router;
