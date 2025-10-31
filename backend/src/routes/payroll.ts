import { Router } from "express";
import { db, PayItem } from "../db/memory";
import { v4 as uuid } from "uuid";

const router = Router();

function hoursBetween(inAt?: string, outAt?: string, breakMins?: number) {
  if (!inAt || !outAt) return 0;
  const start = new Date(inAt).getTime();
  const end = new Date(outAt).getTime();
  const mins = Math.max(0, (end - start) / 60000 - (breakMins ?? 0));
  return mins / 60;
}

router.post("/run", (req, res) => {
  const { period = "2025-10", hourlyRate = 5 } = req.body || {};
  const results: PayItem[] = [];

  // Very naive: sum timesheet hours * hourlyRate
  for (const s of db.staff) {
    const sheets = db.timesheets.filter((t) => t.staffId === s.id);
    let totalHours = 0;
    for (const t of sheets)
      totalHours += hoursBetween(t.inAt, t.outAt, t.breakMins);
    const gross = Math.round(totalHours * hourlyRate * 100) / 100;
    results.push({
      id: uuid(),
      staffId: s.id,
      period,
      component: "BASE",
      quantity: totalHours,
      amount: gross,
    });
  }
  db.payItems.push(...results);
  res.json({ period, items: results });
});

router.get("/items", (_req, res) => {
  res.json({ data: db.payItems });
});

export default router;
