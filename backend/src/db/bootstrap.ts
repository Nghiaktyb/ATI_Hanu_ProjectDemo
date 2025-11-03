import bcrypt from 'bcryptjs';
import { initDb, findUserByEmail, createUser, getAllStaff, getStaffById } from './mysql';

export async function ensureSeed() {
  await initDb();

  // Seed admin user once
  const existing = await findUserByEmail('admin@example.com');
  if (!existing) {
    const adminPass = await bcrypt.hash('admin123', 10);
    await createUser({ email: 'admin@example.com', passwordHash: adminPass, role: 'admin' });
  }

  // Seed a couple of staff if none
  const staff = await getAllStaff();
  if (!staff || staff.length === 0) {
    await createUser({ email: 'seed@example.com', passwordHash: await bcrypt.hash('seed', 8), role: 'manager' }).catch(() => {});
    await (async () => {
      // create two staff entries directly via SQL helper
      const s1 = { firstName: 'Linh', lastName: 'Nguyen', email: 'linh@example.com', department: 'Kitchen', location: 'Hanoi' };
      const s2 = { firstName: 'An', lastName: 'Tran', email: 'an@example.com', department: 'Store', location: 'Hanoi' };
      // createStaff is provided by mysql module but to avoid circular import we'll insert via query using initDb's client
      const k = (await import('./mysql')).dbClient();
      const { v4: uuidv4 } = await import('uuid');
      await k('staff').insert([{ id: uuidv4(), ...s1 }, { id: uuidv4(), ...s2 }]);
    })();
  }
}
