import { Router } from "express";
import {
  getAllShifts,
  createShift,
  assignShift,
  getAllTimesheets,
  createTimesheet,
  updateTimesheetByStaffDate,
} from "../db/mysql";

const router = Router();

router.get("/", async (req, res) => {
  const data = await getAllShifts();
  res.json({ data });
});

router.post("/", async (req, res) => {
  const { title, location, startAt, endAt } = req.body || {};
  const shifts = await createShift({ title, location, startAt, endAt, assignedStaffIds: [] });
  res.status(201).json({ data: shifts });
});

router.post("/:id/assign", async (req, res) => {
  const { staffId } = req.body || {};
  const shift = await assignShift(req.params.id, staffId);
  if (!shift) return res.status(404).json({ error: "Shift not found" });
  res.json({ data: shift });
});

router.get("/timesheets", async (_req, res) => {
  const data = await getAllTimesheets();
  res.json({ data });
});

router.post("/timesheets/clockin", async (req, res) => {
  const { staffId, date, inAt } = req.body || {};
  const ts = await createTimesheet({ staffId, date, inAt });
  res.status(201).json({ data: ts });
});

router.post("/timesheets/clockout", async (req, res) => {
  const { staffId, date, outAt, breakMins } = req.body || {};
  const ts = await updateTimesheetByStaffDate(staffId, date, { outAt, breakMins: breakMins ?? 0 });
  if (!ts) return res.status(404).json({ error: "Timesheet not found" });
  res.json({ data: ts });
});

export default router;
