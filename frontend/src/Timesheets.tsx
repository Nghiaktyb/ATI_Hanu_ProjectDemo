import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

type Timesheet = {
  id: string;
  staffId: string;
  date: string;
  inAt?: string;
  outAt?: string;
  breakMins?: number;
};

type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function Timesheets() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Clock in form
  const [showClockIn, setShowClockIn] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [clockInDate, setClockInDate] = useState('');
  const [clockInTime, setClockInTime] = useState('');
  
  // Clock out form
  const [showClockOut, setShowClockOut] = useState(false);
  const [clockOutStaffId, setClockOutStaffId] = useState('');
  const [clockOutDate, setClockOutDate] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [breakMins, setBreakMins] = useState('0');
  
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [timesheetsRes, staffRes] = await Promise.all([
        fetch(`${API}/shifts/timesheets`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        }),
        fetch(`${API}/staff`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        })
      ]);
      
      const timesheetsData = await timesheetsRes.json();
      const staffData = await staffRes.json();
      
      setTimesheets(timesheetsData.data || []);
      setStaff(staffData.data || []);
    } catch (e: any) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const clockIn = async () => {
    if (!selectedStaffId || !clockInDate || !clockInTime) {
      setError('Please select staff, date, and time');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const inAt = `${clockInDate}T${clockInTime}:00`;
      
      const res = await fetch(`${API}/shifts/timesheets/clockin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          staffId: selectedStaffId,
          date: clockInDate,
          inAt
        })
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Clock in failed');
      }
      
      await loadData();
      setShowClockIn(false);
      setSelectedStaffId('');
      setClockInDate('');
      setClockInTime('');
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const clockOut = async () => {
    if (!clockOutStaffId || !clockOutDate || !clockOutTime) {
      setError('Please fill all fields');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const outAt = `${clockOutDate}T${clockOutTime}:00`;
      
      const res = await fetch(`${API}/shifts/timesheets/clockout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          staffId: clockOutStaffId,
          date: clockOutDate,
          outAt,
          breakMins: parseInt(breakMins) || 0
        })
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Clock out failed');
      }
      
      await loadData();
      setShowClockOut(false);
      setClockOutStaffId('');
      setClockOutDate('');
      setClockOutTime('');
      setBreakMins('0');
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const getStaffName = (staffId: string) => {
    const s = staff.find(x => x.id === staffId);
    return s ? `${s.firstName} ${s.lastName}` : 'Unknown';
  };

  const calculateHours = (ts: Timesheet) => {
    if (!ts.inAt || !ts.outAt) return '—';
    const start = new Date(ts.inAt).getTime();
    const end = new Date(ts.outAt).getTime();
    const mins = (end - start) / 60000 - (ts.breakMins || 0);
    const hours = mins / 60;
    return hours > 0 ? `${hours.toFixed(2)}h` : '—';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-600 dark:text-slate-400">Loading timesheets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Timesheets</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowClockIn(!showClockIn)}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 active:scale-[.98] dark:border-emerald-900/50 dark:bg-emerald-900/30"
          >
            Clock In
          </button>
          <button
            type="button"
            onClick={() => setShowClockOut(!showClockOut)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 active:scale-[.98] dark:bg-slate-700"
          >
            Clock Out
          </button>
        </div>
      </div>

      {/* Clock In Form */}
      {showClockIn && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">Clock In</h3>
          
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}
          
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Staff *</label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Select staff...</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Date *</label>
              <input
                type="date"
                value={clockInDate}
                onChange={(e) => setClockInDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Time *</label>
              <input
                type="time"
                value={clockInTime}
                onChange={(e) => setClockInTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowClockIn(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={clockIn}
              disabled={submitting}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 active:scale-[.98] disabled:opacity-60"
            >
              {submitting ? 'Clocking In...' : 'Clock In'}
            </button>
          </div>
        </div>
      )}

      {/* Clock Out Form */}
      {showClockOut && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">Clock Out</h3>
          
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}
          
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Staff *</label>
              <select
                value={clockOutStaffId}
                onChange={(e) => setClockOutStaffId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Select staff...</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Date *</label>
              <input
                type="date"
                value={clockOutDate}
                onChange={(e) => setClockOutDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Time *</label>
              <input
                type="time"
                value={clockOutTime}
                onChange={(e) => setClockOutTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Break (mins)</label>
              <input
                type="number"
                value={breakMins}
                onChange={(e) => setBreakMins(e.target.value)}
                min="0"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowClockOut(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={clockOut}
              disabled={submitting}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 active:scale-[.98] disabled:opacity-60 dark:bg-slate-700"
            >
              {submitting ? 'Clocking Out...' : 'Clock Out'}
            </button>
          </div>
        </div>
      )}

      {/* Timesheets List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Staff</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Clock In</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Clock Out</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Break</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {timesheets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No timesheets recorded yet
                  </td>
                </tr>
              ) : (
                timesheets.map((ts) => (
                  <tr key={ts.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">{getStaffName(ts.staffId)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{ts.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {ts.inAt ? new Date(ts.inAt).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {ts.outAt ? new Date(ts.outAt).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {ts.breakMins ? `${ts.breakMins}m` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                      {calculateHours(ts)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}