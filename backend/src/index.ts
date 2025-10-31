import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRouter from "./routes/auth";
import staffRouter from "./routes/staff";
import shiftRouter from "./routes/shifts";
import payrollRouter from "./routes/payroll";
import aiRouter from "./routes/ai";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json({ limit: "4mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRouter);
app.use("/staff", staffRouter);
app.use("/shifts", shiftRouter);
app.use("/payroll", payrollRouter);
app.use("/ai", aiRouter);

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
