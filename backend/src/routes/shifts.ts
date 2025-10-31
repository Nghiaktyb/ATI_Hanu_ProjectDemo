import { Router } from "express";
import { db, Shift, Timesheet } from "../db/memory";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/", (req, res) => {
  const { from, to } = req.query;
  // naive filter for demo
  res.json({ data: db.shifts });
});

router.post("/", (req, res) => {
  const { title, location, startAt, endAt } = req.body || {};
  const shift: Shift = {
    id: uuid(),
    title,
    location,
    startAt,
    endAt,
    assignedStaffIds: [],
  };
  db.shifts.push(shift);
  res.status(201).json({ data: shift });
});

router.post("/:id/assign", (req, res) => {
  const shift = db.shifts.find((s) => s.id === req.params.id);
  if (!shift) return res.status(404).json({ error: "Shift not found" });
  const { staffId } = req.body || {};
  if (staffId && !shift.assignedStaffIds.includes(staffId))
    shift.assignedStaffIds.push(staffId);
  res.json({ data: shift });
});

router.get("/timesheets", (req, res) => {
  res.json({ data: db.timesheets });
});

router.post("/timesheets/clockin", (req, res) => {
  const { staffId, date, inAt } = req.body || {};
  const ts: Timesheet = { id: uuid(), staffId, date, inAt };
  db.timesheets.push(ts);
  res.status(201).json({ data: ts });
});

router.post("/timesheets/clockout", (req, res) => {
  const { staffId, date, outAt, breakMins } = req.body || {};
  const ts = db.timesheets.find(
    (t) => t.staffId === staffId && t.date === date
  );
  if (!ts) return res.status(404).json({ error: "Timesheet not found" });
  ts.outAt = outAt;
  ts.breakMins = breakMins ?? 0;
  res.json({ data: ts });
});

export default router;
