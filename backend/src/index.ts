import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

// ⬇️ ADD THIS
import { ensureSeed } from './db/bootstrap';

import authRouter from './routes/auth';
import staffRouter from './routes/staff';
import shiftRouter from './routes/shifts';
import payrollRouter from './routes/payroll';
import aiRouter from './routes/ai';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json({ limit: '4mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/staff', staffRouter);
app.use('/shifts', shiftRouter);
app.use('/payroll', payrollRouter);
app.use('/ai', aiRouter);

// ⬇️ ADD THIS (ensure seed before starting the server)
async function main() {
  await ensureSeed();
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}
main().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
