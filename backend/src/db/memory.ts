export type User = { id: string; email: string; passwordHash: string; role: 'admin' | 'manager' | 'employee'; };
export type Staff = { id: string; firstName: string; lastName: string; email: string; department?: string; location?: string; };
export type Shift = { id: string; title: string; location?: string; startAt: string; endAt: string; assignedStaffIds: string[]; };
export type Timesheet = { id: string; staffId: string; date: string; inAt?: string; outAt?: string; breakMins?: number; };
export type PayItem = { id: string; staffId: string; period: string; component: string; quantity: number; amount: number; };

export const db = {
  users: [] as User[],
  staff: [] as Staff[],
  shifts: [] as Shift[],
  timesheets: [] as Timesheet[],
  payItems: [] as PayItem[]
};