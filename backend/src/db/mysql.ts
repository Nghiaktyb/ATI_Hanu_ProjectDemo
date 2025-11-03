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
      t.string('department').nullable();
      t.string('location').nullable();
      t.timestamp('createdAt').defaultTo(k.fn.now());
    });
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
}

// Users
export async function findUserByEmail(email: string) {
  const k = dbClient();
  const r = await k('users').where({ email }).first();
  return r || null;
}

export async function createUser({ email, passwordHash, role }: { email: string; passwordHash: string; role: string }) {
  const k = dbClient();
  const id = uuid();
  await k('users').insert({ id, email, passwordHash, role });
  return { id, email, role };
}

// Staff
export type Staff = { id: string; firstName: string; lastName: string; email: string; department?: string; location?: string };
export async function getAllStaff() {
  const k = dbClient();
  return await k('staff').select('*').orderBy('createdAt', 'desc');
}
export async function getStaffById(id: string) {
  const k = dbClient();
  return await k('staff').where({ id }).first();
}
export async function createStaff(payload: Omit<Staff, 'id'>) {
  const k = dbClient();
  const id = uuid();
  await k('staff').insert({ id, ...payload });
  return await getStaffById(id);
}
export async function updateStaff(id: string, payload: Partial<Staff>) {
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
  return rows.map((r: any) => ({ ...r, assignedStaffIds: r.assignedStaffIds ? JSON.parse(r.assignedStaffIds) : [] }));
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
  const arr = s.assignedStaffIds ? JSON.parse(s.assignedStaffIds) : [];
  if (!arr.includes(staffId)) arr.push(staffId);
  await k('shifts').where({ id: shiftId }).update({ assignedStaffIds: JSON.stringify(arr) });
  return await k('shifts').where({ id: shiftId }).first();
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
