import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

type PayItem = {
  id: string;
  staffId: string;
  period: string;
  component: string;
  quantity: number;
  amount: number;
};

type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function Payroll() {
  const [payItems, setPayItems] = useState<PayItem[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Run payroll form
  const [showRunPayroll, setShowRunPayroll] = useState(false);
  const [period, setPeriod] = useState('');
  const [hourlyRate, setHourlyRate] = useState('5');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [payrollRes, staffRes] = await Promise.all([
        fetch(`${API}/payroll/items`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        }),
        fetch(`${API}/staff`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        })
      ]);
      
      const payrollData = await payrollRes.json();
      const staffData = await staffRes.json();
      
      setPayItems(payrollData.data || []);
      setStaff(staffData.data || []);
    } catch (e: any) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const runPayroll = async () => {
    if (!period) {
      setError('Period is required (e.g., 2025-10)');
      return;
    }
    
    setError(null);
    setRunning(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/payroll/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          period,
          hourlyRate: parseFloat(hourlyRate) || 5
        })
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed to run payroll');
      }
      
      await loadData();
      setShowRunPayroll(false);
      setPeriod('');
      setHourlyRate('5');
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setRunning(false);
    }
  };

  const getStaffName = (staffId: string) => {
    const s = staff.find(x => x.id === staffId);
    return s ? `${s.firstName} ${s.lastName}` : 'Unknown';
  };

  // Group pay items by period and staff
  const groupedByPeriod = payItems.reduce((acc, item) => {
    if (!acc[item.period]) acc[item.period] = [];
    acc[item.period].push(item);
    return acc;
  }, {} as Record<string, PayItem[]>);

  const periods = Object.keys(groupedByPeriod).sort().reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-600 dark:text-slate-400">Loading payroll data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Payroll</h2>
        <button
          type="button"
          onClick={() => setShowRunPayroll(!showRunPayroll)}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 active:scale-[.98]"
        >
          {showRunPayroll ? 'Cancel' : 'Run Payroll'}
        </button>
      </div>

      {/* Run Payroll Form */}
      {showRunPayroll && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">Run Payroll</h3>
          
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Period * (YYYY-MM)</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="2025-10"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Hourly Rate (USD)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                min="0"
                step="0.5"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            This will calculate payroll for all staff based on their timesheets in the selected period.
          </div>
          
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowRunPayroll(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={runPayroll}
              disabled={running}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 active:scale-[.98] disabled:opacity-60 dark:bg-slate-700"
            >
              {running ? 'Processing...' : 'Run Payroll'}
            </button>
          </div>
        </div>
      )}

      {/* Payroll Summary Stats */}
      {payItems.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Periods</div>
            <div className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">{periods.length}</div>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Pay Items</div>
            <div className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">{payItems.length}</div>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Amount</div>
            <div className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">
              ${payItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Payroll Items by Period */}
      {periods.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            No payroll data yet. Click "Run Payroll" to generate pay items based on timesheets.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {periods.map((p) => {
            const items = groupedByPeriod[p];
            const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
            
            return (
              <div
                key={p}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      Period: {p}
                    </h3>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      Total: <span className="font-semibold text-slate-800 dark:text-slate-100">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/40">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Staff</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Component</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                            {getStaffName(item.staffId)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                            {item.component}
                          </td>
                          <td className="px-4 py-3 text-right text-sm tabular-nums text-slate-600 dark:text-slate-300">
                            {item.quantity.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium tabular-nums text-slate-800 dark:text-slate-100">
                            ${item.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}