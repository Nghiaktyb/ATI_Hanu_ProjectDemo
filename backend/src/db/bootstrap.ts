import bcrypt from 'bcryptjs';
import { initDb, findUserByEmail, createUser, getAllStaff, getStaffById } from './mysql';

export async function ensureSeed() {
  await initDb();

  // Seed admin user if it doesn't exist
  const existingAdmin = await findUserByEmail('admin@example.com');
  if (!existingAdmin) {
    const adminPass = await bcrypt.hash('admin123', 10);
    await createUser({ email: 'admin@example.com', passwordHash: adminPass, role: 'admin' });
    console.log('[Seed] Created admin user: admin@example.com');
  }

  // Seed manager user if it doesn't exist
  const existingManager = await findUserByEmail('manager@example.com');
  if (!existingManager) {
    try {
      const managerPass = await bcrypt.hash('manager123', 10);
      await createUser({ email: 'manager@example.com', passwordHash: managerPass, role: 'manager' });
      console.log('[Seed] Created manager user: manager@example.com');
    } catch (e) {
      console.warn('[Seed] Failed to create manager user (may already exist):', e);
    }
  }

  // Seed staff users and records
  const s1 = { firstName: 'Linh', lastName: 'Nguyen', email: 'linh@example.com', department: 'Kitchen', location: 'Hanoi' };
  const s2 = { firstName: 'An', lastName: 'Tran', email: 'an@example.com', department: 'Store', location: 'Hanoi' };
  
  const k = (await import('./mysql')).dbClient();
  const { v4: uuidv4 } = await import('uuid');
  const { findStaffByEmail } = await import('./mysql');

  // Create staff user 1 if it doesn't exist
  const existingStaff1 = await findUserByEmail(s1.email);
  if (!existingStaff1) {
    try {
      const staffPass = await bcrypt.hash('staff123', 10);
      await createUser({ email: s1.email, passwordHash: staffPass, role: 'staff' });
      console.log(`[Seed] Created staff user: ${s1.email}`);
    } catch (e) {
      console.warn(`[Seed] Failed to create staff user ${s1.email}:`, e);
    }
  }

  // Create staff record 1 if it doesn't exist
  const existingStaffRecord1 = await findStaffByEmail(s1.email);
  if (!existingStaffRecord1) {
    try {
      await k('staff').insert({ id: uuidv4(), ...s1 });
      console.log(`[Seed] Created staff record: ${s1.email}`);
    } catch (e) {
      console.warn(`[Seed] Failed to create staff record ${s1.email}:`, e);
    }
  }

  // Create staff user 2 if it doesn't exist
  const existingStaff2 = await findUserByEmail(s2.email);
  if (!existingStaff2) {
    try {
      const staffPass = await bcrypt.hash('staff123', 10);
      await createUser({ email: s2.email, passwordHash: staffPass, role: 'staff' });
      console.log(`[Seed] Created staff user: ${s2.email}`);
    } catch (e) {
      console.warn(`[Seed] Failed to create staff user ${s2.email}:`, e);
    }
  }

  // Create staff record 2 if it doesn't exist
  const existingStaffRecord2 = await findStaffByEmail(s2.email);
  if (!existingStaffRecord2) {
    try {
      await k('staff').insert({ id: uuidv4(), ...s2 });
      console.log(`[Seed] Created staff record: ${s2.email}`);
    } catch (e) {
      console.warn(`[Seed] Failed to create staff record ${s2.email}:`, e);
    }
  }
}
