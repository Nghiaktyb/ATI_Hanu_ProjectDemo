import { Router } from "express";
import { dbClient, findStaffByEmail } from "../db/mysql";
import { v4 as uuid } from "uuid";
import multer from "multer";
import fs from "fs";
import path from "path";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();

// All training routes require authentication
router.use(authenticate);
const upload = multer({ dest: "uploads/training/" });
const TRAINING_DIR = path.join(process.cwd(), "data", "training");

// Ensure training directory exists
if (!fs.existsSync(TRAINING_DIR)) {
  fs.mkdirSync(TRAINING_DIR, { recursive: true });
}

// Initialize training tables
export async function initTrainingTables() {
  const k = dbClient();
  
  // training_courses table
  const hasCourses = await k.schema.hasTable('training_courses');
  if (!hasCourses) {
    await k.schema.createTable('training_courses', (t) => {
      t.string('id').primary();
      t.string('title').notNullable();
      t.text('description').nullable();
      t.string('category').nullable();
      t.string('filePath').nullable();
      t.string('fileName').nullable();
      t.integer('durationMins').nullable();
      t.timestamp('createdAt').defaultTo(k.fn.now());
    });
  }
  
  // training_assignments table
  const hasAssignments = await k.schema.hasTable('training_assignments');
  if (!hasAssignments) {
    await k.schema.createTable('training_assignments', (t) => {
      t.string('id').primary();
      t.string('courseId').notNullable();
      t.string('staffId').notNullable();
      t.string('status').notNullable().defaultTo('pending'); // pending, in_progress, completed
      t.string('assignedBy').nullable();
      t.timestamp('assignedAt').defaultTo(k.fn.now());
      t.timestamp('completedAt').nullable();
      t.integer('score').nullable();
      t.text('notes').nullable();
    });
  }
}

// Get all training courses
router.get("/courses", async (_req, res) => {
  try {
    const k = dbClient();
    const courses = await k('training_courses').select('*').orderBy('createdAt', 'desc');
    res.json({ data: courses });
  } catch (e: any) {
    console.error('[/training/courses] Error:', e);
    res.status(500).json({ error: e.message || 'Failed to fetch courses' });
  }
});

// Get single course
router.get("/courses/:id", async (req, res) => {
  try {
    const k = dbClient();
    const course = await k('training_courses').where({ id: req.params.id }).first();
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ data: course });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to fetch course' });
  }
});

// Create new course - Only Admin/Manager
router.post("/courses", authorize('admin', 'manager'), async (req, res) => {
  try {
    const { title, description, category, durationMins } = req.body || {};
    if (!title) return res.status(400).json({ error: 'Title is required' });
    
    const k = dbClient();
    const id = uuid();
    
    await k('training_courses').insert({
      id,
      title,
      description: description || null,
      category: category || null,
      durationMins: durationMins || null,
    });
    
    const course = await k('training_courses').where({ id }).first();
    res.status(201).json({ data: course });
  } catch (e: any) {
    console.error('[/training/courses] Create error:', e);
    res.status(500).json({ error: e.message || 'Failed to create course' });
  }
});

// Upload course material - Only Admin/Manager
router.post("/courses/:id/upload", authorize('admin', 'manager'), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File required' });
    
    const k = dbClient();
    const course = await k('training_courses').where({ id: req.params.id }).first();
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    const ext = path.extname(req.file.originalname);
    const dest = path.join(TRAINING_DIR, `${req.params.id}${ext}`);
    
    // Remove old file if exists
    if (course.filePath && fs.existsSync(course.filePath)) {
      fs.unlinkSync(course.filePath);
    }
    
    // Use copyFileSync instead of renameSync to handle cross-device issues in Docker
    fs.copyFileSync(req.file.path, dest);
    fs.unlinkSync(req.file.path); // Delete the temporary file
    
    await k('training_courses').where({ id: req.params.id }).update({
      filePath: dest,
      fileName: req.file.originalname,
    });
    
    const updated = await k('training_courses').where({ id: req.params.id }).first();
    res.json({ data: updated });
  } catch (e: any) {
    console.error('[/training/courses/:id/upload] Error:', e);
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

// Update course - Only Admin/Manager
router.patch("/courses/:id", authorize('admin', 'manager'), async (req, res) => {
  try {
    const k = dbClient();
    const { title, description, category, durationMins } = req.body || {};
    
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (durationMins !== undefined) updates.durationMins = durationMins;
    
    await k('training_courses').where({ id: req.params.id }).update(updates);
    const course = await k('training_courses').where({ id: req.params.id }).first();
    
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ data: course });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to update course' });
  }
});

// Delete course - Only Admin/Manager
router.delete("/courses/:id", authorize('admin', 'manager'), async (req, res) => {
  try {
    const k = dbClient();
    const course = await k('training_courses').where({ id: req.params.id }).first();
    
    if (course?.filePath && fs.existsSync(course.filePath)) {
      fs.unlinkSync(course.filePath);
    }
    
    await k('training_assignments').where({ courseId: req.params.id }).del();
    await k('training_courses').where({ id: req.params.id }).del();
    
    res.status(204).end();
  } catch (e: any) {
    console.error('[/training/courses/:id] Delete error:', e);
    res.status(500).json({ error: e.message || 'Failed to delete course' });
  }
});

// Get all assignments - Admin/Manager: all, Staff: own only
router.get("/assignments", async (req: AuthRequest, res) => {
  try {
    const k = dbClient();
    const assignments = await k('training_assignments as ta')
      .select(
        'ta.*',
        'tc.title as courseTitle',
        's.firstName',
        's.lastName',
        's.email'
      )
      .leftJoin('training_courses as tc', 'ta.courseId', 'tc.id')
      .leftJoin('staff as s', 'ta.staffId', 's.id')
      .orderBy('ta.assignedAt', 'desc');
    
    res.json({ data: assignments });
  } catch (e: any) {
    console.error('[/training/assignments] Error:', e);
    res.status(500).json({ error: e.message || 'Failed to fetch assignments' });
  }
});

// Assign course to staff - Only Admin/Manager
router.post("/assignments", authorize('admin', 'manager'), async (req, res) => {
  try {
    const { courseId, staffId, assignedBy } = req.body || {};
    if (!courseId || !staffId) {
      return res.status(400).json({ error: 'courseId and staffId required' });
    }
    
    const k = dbClient();
    
    // Check if already assigned
    const existing = await k('training_assignments')
      .where({ courseId, staffId })
      .first();
    
    if (existing) {
      return res.status(400).json({ error: 'Already assigned to this staff' });
    }
    
    const id = uuid();
    await k('training_assignments').insert({
      id,
      courseId,
      staffId,
      assignedBy: assignedBy || null,
      status: 'pending',
    });
    
    const assignment = await k('training_assignments').where({ id }).first();
    res.status(201).json({ data: assignment });
  } catch (e: any) {
    console.error('[/training/assignments] Create error:', e);
    res.status(500).json({ error: e.message || 'Failed to create assignment' });
  }
});

// Update assignment - Admin/Manager: any, Staff: own only
router.patch("/assignments/:id", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const k = dbClient();
    
    // Check if assignment exists and verify permissions
    const assignment = await k('training_assignments').where({ id: req.params.id }).first();
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    // Staff can only update their own assignments
    if (user.role === 'staff') {
      const staff = await findStaffByEmail(user.email);
      if (!staff || assignment.staffId !== staff.id) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }
    
    const { status, score, notes } = req.body || {};
    
    const updates: any = {};
    if (status !== undefined) {
      updates.status = status;
      if (status === 'completed') {
        updates.completedAt = new Date().toISOString();
      }
    }
    if (score !== undefined) updates.score = score;
    if (notes !== undefined) updates.notes = notes;
    
    await k('training_assignments').where({ id: req.params.id }).update(updates);
    const updated = await k('training_assignments').where({ id: req.params.id }).first();
    
    res.json({ data: updated });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to update assignment' });
  }
});

// Delete assignment - Only Admin/Manager
router.delete("/assignments/:id", authorize('admin', 'manager'), async (req, res) => {
  try {
    const k = dbClient();
    await k('training_assignments').where({ id: req.params.id }).del();
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to delete assignment' });
  }
});

// Get training stats - Only Admin/Manager
router.get("/stats", authorize('admin', 'manager'), async (_req, res) => {
  try {
    const k = dbClient();
    
    const totalCourses = await k('training_courses').count('* as count').first();
    const totalAssignments = await k('training_assignments').count('* as count').first();
    const completedAssignments = await k('training_assignments')
      .where({ status: 'completed' })
      .count('* as count')
      .first();
    const pendingAssignments = await k('training_assignments')
      .where({ status: 'pending' })
      .count('* as count')
      .first();
    
    res.json({
      totalCourses: totalCourses?.count || 0,
      totalAssignments: totalAssignments?.count || 0,
      completed: completedAssignments?.count || 0,
      pending: pendingAssignments?.count || 0,
    });
  } catch (e: any) {
    console.error('[/training/stats] Error:', e);
    res.status(500).json({ error: e.message || 'Failed to fetch stats' });
  }
});

export default router;