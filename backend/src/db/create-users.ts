import bcrypt from 'bcryptjs';
import { initDb, findUserByEmail, createUser, findStaffByEmail } from './mysql';

async function createMissingUsers() {
  await initDb();
  const k = (await import('./mysql')).dbClient();
  const { v4: uuidv4 } = await import('uuid');

  console.log('Creating missing users...');

  // Create admin user if it doesn't exist
  let existing = await findUserByEmail('admin@example.com');
  if (!existing) {
    const adminPass = await bcrypt.hash('admin123', 10);
    await createUser({ email: 'admin@example.com', passwordHash: adminPass, role: 'admin' });
    console.log('✓ Created admin user: admin@example.com / admin123');
  } else {
    console.log('✓ Admin user already exists');
  }

  // Create manager user if it doesn't exist
  existing = await findUserByEmail('manager@example.com');
  if (!existing) {
    const managerPass = await bcrypt.hash('manager123', 10);
    await createUser({ email: 'manager@example.com', passwordHash: managerPass, role: 'manager' });
    console.log('✓ Created manager user: manager@example.com / manager123');
  } else {
    console.log('✓ Manager user already exists');
  }

  // Create staff user 1 (Linh)
  const s1 = { firstName: 'Linh', lastName: 'Nguyen', email: 'linh@example.com', department: 'Kitchen', location: 'Hanoi' };
  existing = await findUserByEmail(s1.email);
  if (!existing) {
    const staffPass = await bcrypt.hash('staff123', 10);
    await createUser({ email: s1.email, passwordHash: staffPass, role: 'staff' });
    console.log(`✓ Created staff user: ${s1.email} / staff123`);
  } else {
    console.log(`✓ Staff user ${s1.email} already exists`);
  }

  // Create staff record 1 if it doesn't exist
  let staffRecord = await findStaffByEmail(s1.email);
  if (!staffRecord) {
    await k('staff').insert({ id: uuidv4(), ...s1 });
    console.log(`✓ Created staff record: ${s1.email}`);
  } else {
    console.log(`✓ Staff record ${s1.email} already exists`);
  }

  // Create staff user 2 (An)
  const s2 = { firstName: 'An', lastName: 'Tran', email: 'an@example.com', department: 'Store', location: 'Hanoi' };
  existing = await findUserByEmail(s2.email);
  if (!existing) {
    const staffPass = await bcrypt.hash('staff123', 10);
    await createUser({ email: s2.email, passwordHash: staffPass, role: 'staff' });
    console.log(`✓ Created staff user: ${s2.email} / staff123`);
  } else {
    console.log(`✓ Staff user ${s2.email} already exists`);
  }

  // Create staff record 2 if it doesn't exist
  staffRecord = await findStaffByEmail(s2.email);
  if (!staffRecord) {
    await k('staff').insert({ id: uuidv4(), ...s2 });
    console.log(`✓ Created staff record: ${s2.email}`);
  } else {
    console.log(`✓ Staff record ${s2.email} already exists`);
  }

  console.log('\nAll users created!');
  console.log('\nTest accounts:');
  console.log('  Admin:   admin@example.com / admin123');
  console.log('  Manager: manager@example.com / manager123');
  console.log('  Staff 1: linh@example.com / staff123');
  console.log('  Staff 2: an@example.com / staff123');
}

createMissingUsers().catch(console.error);

