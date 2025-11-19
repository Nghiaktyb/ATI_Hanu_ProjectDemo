import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ROLE_OPTIONS = [
  { value: 'staff', label: 'Staff' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

const DEPARTMENT_OPTIONS = [
  'Manager',
  'IT',
  'HR',
  'Finance',
  'Operations',
  'Sales',
  'Marketing',
  'Support',
  'Logistics',
  'Other',
];

type Props = {
  staffId?: string | null;
  onDone: () => void;
  onCancel?: () => void;
};

export default function CreateStaff({ staffId, onDone, onCancel }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [roleValue, setRoleValue] = useState<'staff' | 'manager' | 'admin'>('staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  useEffect(() => {
    if (!staffId) return;
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const r = await fetch(`${API}/staff/${staffId}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (!r.ok) throw new Error('Failed to load');
        const j = await r.json();
        if (cancelled) return;
        const s = j.data;
        setFirstName(s.firstName || '');
        setLastName(s.lastName || '');
        setEmail(s.email || '');
        setDepartment(s.department || '');
        setLocation(s.location || '');
        setRoleValue((s.role as 'staff' | 'manager' | 'admin') || 'staff');
      } catch (e: any) {
        setError(e.message || String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [staffId]);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const body = { firstName, lastName, email, department, location, role: roleValue };
      let r;
      if (staffId) {
        r = await fetch(`${API}/staff/${staffId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(body),
        });
      } else {
        r = await fetch(`${API}/staff`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(body),
        });
      }
      const j = await r.json().catch(() => ({}));
      
      if (!r.ok) {
        throw new Error(j?.error || 'Save failed');
      }
      
      // If creating new staff, check for temporary password
      if (!staffId && j.tempPassword) {
        setTempPassword(j.tempPassword);
        // Don't call onDone yet - wait for user to acknowledge the password
        return;
      }
      
      onDone();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!staffId) return;
    if (!confirm('Delete this staff member?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const r = await fetch(`${API}/staff/${staffId}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!r.ok) throw new Error('Delete failed');
      onDone();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{staffId ? 'Edit staff' : 'Create staff'}</h2>
        <div className="flex items-center gap-2">
          {staffId && (
            <button type="button" onClick={remove} disabled={loading} className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">Delete</button>
          )}
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300">Cancel</button>
          <button type="button" onClick={submit} disabled={loading} className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 active:scale-[.98] disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600">{loading ? 'Saving…' : 'Save'}</button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">{error}</div>}

      {tempPassword && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/30">
          <h3 className="mb-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">Staff Account Created Successfully!</h3>
          <p className="mb-3 text-sm text-emerald-700 dark:text-emerald-300">
            A login account has been created for this staff member. Please share these credentials with them:
          </p>
          <div className="mb-3 rounded-lg border border-emerald-300 bg-white p-3 dark:border-emerald-700 dark:bg-slate-800">
            <div className="mb-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Email:</span>
              <div className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{email}</div>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Temporary Password:</span>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{tempPassword}</div>
            </div>
          </div>
          <p className="mb-3 text-xs text-emerald-600 dark:text-emerald-400">
            Warning: This password will only be shown once. Make sure to save it or share it with the staff member now.
          </p>
          <button
            type="button"
            onClick={() => {
              setTempPassword(null);
              onDone();
            }}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 active:scale-[.98]"
          >
            I've Saved the Password
          </button>
        </div>
      )}

      {!tempPassword && (
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">First name</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Last name</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Role</label>
          <select
            value={roleValue}
            onChange={(e) => setRoleValue(e.target.value as 'staff' | 'manager' | 'admin')}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Department</label>
          <select
            value={DEPARTMENT_OPTIONS.includes(department) ? department : department ? 'custom' : ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'custom') {
                setDepartment('');
              } else {
                setDepartment(value);
              }
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Select department</option>
            {DEPARTMENT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            <option value="custom">Other...</option>
          </select>
          {(!department || !DEPARTMENT_OPTIONS.includes(department)) && (
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Enter department"
              className="mt-2 w-full rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        </div>
      </div>
      )}
    </div>
  );
}
