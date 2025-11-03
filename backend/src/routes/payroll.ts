import { Router } from "express";
import { getAllStaff, getAllTimesheets, createPayItems, getPayItems } from "../db/mysql";

const router = Router();

function hoursBetween(inAt?: string, outAt?: string, breakMins?: number) {
  if (!inAt || !outAt) return 0;
  const start = new Date(inAt).getTime();
  const end = new Date(outAt).getTime();
  const mins = Math.max(0, (end - start) / 60000 - (breakMins ?? 0));
  return mins / 60;
}

router.post("/run", async (req, res) => {
  const { period = "2025-10", hourlyRate = 5 } = req.body || {};
  const results: any[] = [];

  const staff = await getAllStaff();
  const times = await getAllTimesheets();

  for (const s of staff) {
    const sheets = times.filter((t) => t.staffId === s.id);
    let totalHours = 0;
    for (const t of sheets) totalHours += hoursBetween(t.inAt, t.outAt, t.breakMins);
    const gross = Math.round(totalHours * hourlyRate * 100) / 100;
    results.push({ staffId: s.id, period, component: 'BASE', quantity: totalHours, amount: gross });
  }

  const created = await createPayItems(results);
  res.json({ period, items: created });
});

router.get("/items", async (_req, res) => {
  const data = await getPayItems();
  res.json({ data });
});

export default router;
