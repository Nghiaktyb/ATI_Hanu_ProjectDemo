import { Router } from "express";
import { db, Staff } from "../db/memory";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ data: db.staff });
});

router.post("/", (req, res) => {
  const { firstName, lastName, email, department, location } = req.body || {};
  const s: Staff = {
    id: uuid(),
    firstName,
    lastName,
    email,
    department,
    location,
  };
  db.staff.push(s);
  res.status(201).json({ data: s });
});

router.get("/:id", (req, res) => {
  const s = db.staff.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  res.json({ data: s });
});

router.patch("/:id", (req, res) => {
  const s = db.staff.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  Object.assign(s, req.body);
  res.json({ data: s });
});

router.delete("/:id", (req, res) => {
  const i = db.staff.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  db.staff.splice(i, 1);
  res.status(204).end();
});

export default router;
