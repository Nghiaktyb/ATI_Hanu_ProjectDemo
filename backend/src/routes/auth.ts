import { Router } from "express";
import { db } from "../db/memory";
import bcrypt from "bcryptjs";
import { signJwt } from "../utils/auth";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = db.users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = signJwt({ sub: user.id, role: user.role, email: user.email });
  res.json({ token, role: user.role, email: user.email });
});

export default router;
