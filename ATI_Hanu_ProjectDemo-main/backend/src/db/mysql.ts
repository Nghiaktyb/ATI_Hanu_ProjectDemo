import knexFn from 'knex';
import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';

let knex: Knex | null = null;

export function dbClient() {
  if (!knex) {
    const { DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT } = process.env;
    knex = knexFn({
      client: 'mysql2',
      connection: {
        host: DB_HOST || '127.0.0.1',
        user: DB_USER || 'root',
        password: DB_PASS || '',
        database: DB_NAME || 'staff_platform',
        port: DB_PORT ? Number(DB_PORT) : 3306,
        timezone: 'Z',
        dateStrings: true,
      },
      pool: { min: 0, max: 7 },
    });
  }
  return knex;
}

export async function initDb() {
  const k = dbClient();

  // users
  const hasUsers = await k.schema.hasTable('users');
  if (!hasUsers) {
    await k.schema.createTable('users', (t) => {
      t.string('id').primary();
      t.string('email').notNullable().unique();
      t.string('passwordHash').notNullable();
      t.string('role').notNullable();
      t.timestamp('createdAt').defaultTo(k.fn.now());
    });
  }

  // staff
  const hasStaff = await k.schema.hasTable('staff');
  if (!hasStaff) {
    await k.schema.createTable('staff', (t) => {
      t.string('id').primary();
      t.string('firstName').notNullable();
      t.string('lastName').notNullable();
      t.string('email').notNullable().unique();
      t.string('role').notNullable().defaultTo('staff');
      t.string('department').nullable();
      t.string('jobTitle').nullable();
      t.string('location').nullable();
      t.timestamp('createdAt').defaultTo(k.fn.now());
    });
  } else {
    const hasRoleColumn = await k.schema.hasColumn('staff', 'role');
    if (!hasRoleColumn) {
      await k.schema.alterTable('staff', (t) => {
        t.string('role').notNullable().defaultTo('staff');
      });
    }
    await k('staff').update({ role: 'staff' }).whereNull('role');
    const staffRoles = await k('staff as s')
      .leftJoin('users as u', 's.email', 'u.email')
      .select('s.id', 'u.role as userRole');
    for (const row of staffRoles) {
      if (row.userRole) {
        await k('staff').where({ id: row.id }).update({ role: row.userRole });
      }
    }
    const hasJobTitleColumn = await k.schema.hasColumn('staff', 'jobTitle');
    if (!hasJobTitleColumn) {
      await k.schema.alterTable('staff', (t) => {
        t.string('jobTitle').nullable();
      });
    }
  }

  // shifts
  const hasShifts = await k.schema.hasTable('shifts');
  if (!hasShifts) {
    await k.schema.createTable('shifts', (t) => {
      t.string('id').primary();
      t.string('title').notNullable();
      t.string('location').nullable();
      t.string('startAt').notNullable();
      t.string('endAt').notNullable();
      t.json('assignedStaffIds').nullable();
      t.timestamp('createdAt').defaultTo(k.fn.now());
    });
  }

  // timesheets
  const hasTimes = await k.schema.hasTable('timesheets');
  if (!hasTimes) {
    await k.schema.createTable('timesheets', (t) => {
      t.string('id').primary();
      t.string('staffId').notNullable();
      t.string('date').notNullable();
      t.string('inAt').nullable();
      t.string('outAt').nullable();
      t.integer('breakMins').nullable();
      t.timestamp('createdAt').defaultTo(k.fn.now());
    });
  }

  // pay_items
  const hasPay = await k.schema.hasTable('pay_items');
  if (!hasPay) {
    await k.schema.createTable('pay_items', (t) => {
      t.string('id').primary();
      t.string('staffId').notNullable();
      t.string('period').notNullable();
      t.string('component').notNullable();
      t.float('quantity').notNullable();
      t.float('amount').notNullable();
      t.timestamp('createdAt').defaultTo(k.fn.now());
    });
  }

  // password_reset_tokens
  const hasResetTokens = await k.schema.hasTable('password_reset_tokens');
  if (!hasResetTokens) {
    await k.schema.createTable('password_reset_tokens', (t) => {
      t.string('id').primary();
      t.string('email').notNullable();
      t.string('token').notNullable().unique();
      t.timestamp('expiresAt').notNullable();
      t.boolean('used').defaultTo(false);
      t.timestamp('createdAt').defaultTo(k.fn.now());
    });
  }
}

// Users
export async function findUserByEmail(email: string) {
  const k = dbClient();
  const r = await k('users').where({ email }).first();
  return r || null;
}

export type UserUpdate = {
  email?: string;
  passwordHash?: string;
  role?: string;
};

export async function createUser({ email, passwordHash, role }: { email: string; passwordHash: string; role: string }) {
  const k = dbClient();
  const id = uuid();
  await k('users').insert({ id, email, passwordHash, role });
  return { id, email, role };
}

export async function updateUserByEmail(email: string, payload: UserUpdate) {
  const k = dbClient();
  if (!email) {
    throw new Error('Email is required to update user');
  }
  const updates: UserUpdate = {};
  if (payload.email) {
    updates.email = payload.email;
  }
  if (payload.passwordHash) {
    updates.passwordHash = payload.passwordHash;
  }
  if (payload.role) {
    updates.role = payload.role;
  }
  if (Object.keys(updates).length === 0) {
    return await findUserByEmail(email);
  }
  await k('users').where({ email }).update(updates);
  const newEmail = updates.email || email;
  return await findUserByEmail(newEmail);
}

// Staff
export type StaffRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string | null;
  jobTitle?: string | null;
  location?: string | null;
};

export type Staff = StaffRecord;

export async function getAllStaff() {
  const k = dbClient();
  return await k<Staff>('staff').select('*').orderBy('createdAt', 'desc');
}

export async function getCoWorkers(staffId: string) {
  const k = dbClient();
  console.log(`[getCoWorkers] Finding co-workers for staff ${staffId}`);
  
  // Get all shifts assigned to this staff member
  const allShifts = await k('shifts').select('*');
  const myShiftIds: string[] = [];
  
  for (const shift of allShifts) {
    let assignedIds: string[] = [];
    try {
      if (shift.assignedStaffIds) {
        assignedIds = JSON.parse(shift.assignedStaffIds);
      }
    } catch {
      assignedIds = [];
    }
    if (Array.isArray(assignedIds) && assignedIds.includes(staffId)) {
      myShiftIds.push(shift.id);
      console.log(`[getCoWorkers] Staff ${staffId} is assigned to shift ${shift.id} (${shift.title})`);
    }
  }
  
  console.log(`[getCoWorkers] Staff ${staffId} is assigned to ${myShiftIds.length} shifts`);
  
  // Get all staff IDs assigned to the same shifts
  const coWorkerIds = new Set<string>();
  for (const shift of allShifts) {
    if (myShiftIds.includes(shift.id)) {
      let assignedIds: string[] = [];
      try {
        if (shift.assignedStaffIds) {
          assignedIds = JSON.parse(shift.assignedStaffIds);
        }
      } catch {
        assignedIds = [];
      }
      if (Array.isArray(assignedIds)) {
        assignedIds.forEach(id => {
          if (id !== staffId) {
            coWorkerIds.add(id);
          }
        });
      }
    }
  }
  
  console.log(`[getCoWorkers] Found ${coWorkerIds.size} co-worker IDs:`, Array.from(coWorkerIds));
  
  // Get staff records for co-workers
  if (coWorkerIds.size === 0) {
    console.log(`[getCoWorkers] No co-workers found for staff ${staffId}`);
    return [];
  }
  
  const coWorkers = await k('staff')
    .whereIn('id', Array.from(coWorkerIds))
    .select('*')
    .orderBy('firstName', 'asc');
  
  console.log(`[getCoWorkers] Retrieved ${coWorkers.length} co-worker records:`, coWorkers.map((s: any) => `${s.firstName} ${s.lastName} (${s.id})`));
  
  return coWorkers;
}
export async function getStaffById(id: string) {
  const k = dbClient();
  return await k<Staff>('staff').where({ id }).first();
}
export async function findStaffByEmail(email: string) {
  const k = dbClient();
  return (await k<Staff>('staff').where({ email }).first()) || null;
}

type StaffInsert = Omit<StaffRecord, 'id'>;

export async function createStaff(payload: StaffInsert) {
  const k = dbClient();
  const id = uuid();
  await k('staff').insert({ id, ...payload });
  return await getStaffById(id);
}
export async function updateStaff(id: string, payload: Partial<StaffRecord>) {
  const k = dbClient();
  await k('staff').where({ id }).update(payload);
  return await getStaffById(id);
}
export async function deleteStaff(id: string) {
  const k = dbClient();
  await k('staff').where({ id }).del();
}

// Shifts & Timesheets
export type Shift = { id: string; title: string; location?: string; startAt: string; endAt: string; assignedStaffIds: string[] };
export async function getAllShifts() {
  const k = dbClient();
  const rows = await k('shifts').select('*').orderBy('createdAt', 'desc');
  return rows.map((r: any) => {
    let assignedIds: string[] = [];
    try {
      if (r.assignedStaffIds) {
        // Handle both string and already parsed JSON
        if (typeof r.assignedStaffIds === 'string') {
          const parsed = JSON.parse(r.assignedStaffIds);
          assignedIds = Array.isArray(parsed) ? parsed : [];
        } else if (Array.isArray(r.assignedStaffIds)) {
          assignedIds = r.assignedStaffIds;
        }
      }
    } catch (e) {
      console.error(`[getAllShifts] Error parsing assignedStaffIds for shift ${r.id}:`, e);
      assignedIds = [];
    }
    console.log(`[getAllShifts] Shift ${r.id} (${r.title}): assignedStaffIds =`, assignedIds);
    return { ...r, assignedStaffIds: assignedIds };
  });
}
export async function createShift(payload: Omit<Shift, 'id'>) {
  const k = dbClient();
  const id = uuid();
  await k('shifts').insert({ id, ...payload, assignedStaffIds: JSON.stringify(payload.assignedStaffIds || []) });
  return await getAllShifts();
}
export async function assignShift(shiftId: string, staffId: string) {
  const k = dbClient();
  const s = await k('shifts').where({ id: shiftId }).first();
  if (!s) return null;
  let arr: string[] = [];
  try {
    arr = s.assignedStaffIds ? JSON.parse(s.assignedStaffIds) : [];
  } catch {
    arr = [];
  }
  if (!arr.includes(staffId)) arr.push(staffId);
  await k('shifts').where({ id: shiftId }).update({ assignedStaffIds: JSON.stringify(arr) });
  const updated = await k('shifts').where({ id: shiftId }).first();
  if (!updated) return null;
  try {
    return { ...updated, assignedStaffIds: updated.assignedStaffIds ? JSON.parse(updated.assignedStaffIds) : [] };
  } catch {
    return { ...updated, assignedStaffIds: [] };
  }
}

export async function assignMultipleStaff(shiftId: string, staffIds: string[]) {
  const k = dbClient();
  const s = await k('shifts').where({ id: shiftId }).first();
  if (!s) return null;
  let arr: string[] = [];
  try {
    arr = s.assignedStaffIds ? JSON.parse(s.assignedStaffIds) : [];
  } catch {
    arr = [];
  }
  // Add all staff IDs that aren't already in the array
  for (const staffId of staffIds) {
    if (!arr.includes(staffId)) {
      arr.push(staffId);
    }
  }
  await k('shifts').where({ id: shiftId }).update({ assignedStaffIds: JSON.stringify(arr) });
  const updated = await k('shifts').where({ id: shiftId }).first();
  if (!updated) return null;
  try {
    return { ...updated, assignedStaffIds: updated.assignedStaffIds ? JSON.parse(updated.assignedStaffIds) : [] };
  } catch {
    return { ...updated, assignedStaffIds: [] };
  }
}

export async function unassignShift(shiftId: string, staffId: string) {
  const k = dbClient();
  const s = await k('shifts').where({ id: shiftId }).first();
  if (!s) return null;
  let arr: string[] = [];
  try {
    arr = s.assignedStaffIds ? JSON.parse(s.assignedStaffIds) : [];
  } catch {
    arr = [];
  }
  arr = arr.filter(id => id !== staffId);
  await k('shifts').where({ id: shiftId }).update({ assignedStaffIds: JSON.stringify(arr) });
  const updated = await k('shifts').where({ id: shiftId }).first();
  if (!updated) return null;
  try {
    return { ...updated, assignedStaffIds: updated.assignedStaffIds ? JSON.parse(updated.assignedStaffIds) : [] };
  } catch {
    return { ...updated, assignedStaffIds: [] };
  }
}

export type Timesheet = { id: string; staffId: string; date: string; inAt?: string; outAt?: string; breakMins?: number };
export async function getAllTimesheets() {
  const k = dbClient();
  return await k('timesheets').select('*').orderBy('createdAt', 'desc');
}
export async function createTimesheet(payload: Omit<Timesheet, 'id'>) {
  const k = dbClient();
  const id = uuid();
  await k('timesheets').insert({ id, ...payload });
  return await k('timesheets').where({ id }).first();
}
export async function updateTimesheetByStaffDate(staffId: string, date: string, payload: Partial<Timesheet>) {
  const k = dbClient();
  await k('timesheets').where({ staffId, date }).update(payload);
  return await k('timesheets').where({ staffId, date }).first();
}

// Pay items
export type PayItem = { id: string; staffId: string; period: string; component: string; quantity: number; amount: number };
export async function createPayItems(items: Omit<PayItem, 'id'>[]) {
  const k = dbClient();
  const rows = items.map((it) => ({ id: uuid(), ...it }));
  await k('pay_items').insert(rows);
  return rows;
}
export async function getPayItems() {
  const k = dbClient();
  return await k('pay_items').select('*').orderBy('createdAt', 'desc');
}
