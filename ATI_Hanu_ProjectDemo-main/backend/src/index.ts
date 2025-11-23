import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ensureSeed } from './db/bootstrap';
import { initTrainingTables } from './routes/training';

// Routes
import authRoutes from './routes/auth';
import staffRoutes from './routes/staff';
import shiftsRoutes from './routes/shifts';
import payrollRoutes from './routes/payroll';
import aiRoutes from './routes/ai';
import trainingRoutes from './routes/training';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Initialize database and seed data
(async () => {
  try {
    await ensureSeed();
    await initTrainingTables();
    console.log('[DB] Database initialized and seeded');
  } catch (e) {
    console.error('[DB] Database initialization failed:', e);
    // Don't exit - allow server to start even if seeding fails
    // Database might already be initialized
  }
})();

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/staff', staffRoutes);
app.use('/shifts', shiftsRoutes);
app.use('/payroll', payrollRoutes);
app.use('/ai', aiRoutes);
app.use('/training', trainingRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[API] Routes available:`);
  console.log(`   - /auth/login`);
  console.log(`   - /staff`);
  console.log(`   - /shifts`);
  console.log(`   - /payroll`);
  console.log(`   - /ai`);
  console.log(`   - /training`);
});