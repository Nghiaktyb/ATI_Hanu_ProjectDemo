import { Router } from "express";
import { getAllStaff, createStaff, getStaffById, updateStaff, deleteStaff, Staff } from "../db/mysql";

const router = Router();

router.get("/", async (_req, res) => {
  const data = await getAllStaff();
  res.json({ data });
});

router.post("/", async (req, res) => {
  const { firstName, lastName, email, department, location } = req.body || {};
  const s = await createStaff({ firstName, lastName, email, department, location });
  res.status(201).json({ data: s });
});

router.get("/:id", async (req, res) => {
  const s = await getStaffById(req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  res.json({ data: s });
});

router.patch("/:id", async (req, res) => {
  const s = await updateStaff(req.params.id, req.body || {});
  if (!s) return res.status(404).json({ error: "Not found" });
  res.json({ data: s });
});

router.delete("/:id", async (req, res) => {
  await deleteStaff(req.params.id);
  res.status(204).end();
});

export default router;
