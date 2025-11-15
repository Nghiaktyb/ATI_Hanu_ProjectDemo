import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

type Shift = {
  id: string;
  title: string;
  location?: string;
  startAt: string;
  endAt: string;
  assignedStaffIds: string[];
};

type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  location?: string;
};

export default function Scheduling({ role }: { role?: string | null }) {
  const isAdminOrManager = role === 'admin' || role === 'manager';
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [shiftsRes, staffRes] = await Promise.all([
        fetch(`${API}/shifts`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        }),
        fetch(`${API}/staff`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        })
      ]);
      
      const shiftsData = await shiftsRes.json();
      const staffData = await staffRes.json();
      
      const shifts = shiftsData.data || [];
      const staffList = staffData.data || [];
      
      // Debug: Log the data to see what we're getting
      console.log('[Scheduling] Loaded shifts:', shifts.length);
      console.log('[Scheduling] Loaded staff:', staffList.length, 'staff members:', staffList.map((s: Staff) => `${s.firstName} ${s.lastName} (${s.id})`));
      shifts.forEach((shift: Shift) => {
        const assignedIds = Array.isArray(shift.assignedStaffIds) ? shift.assignedStaffIds : [];
        console.log(`[Scheduling] Shift ${shift.id} (${shift.title}) has ${assignedIds.length} assigned staff:`, assignedIds);
        
        // Check which assigned staff are in the staff list
        const foundStaff = assignedIds.map((id: string) => {
          const found = staffList.find((s: Staff) => s.id === id);
          return found ? `${found.firstName} ${found.lastName}` : `MISSING: ${id}`;
        });
        console.log(`[Scheduling] Shift ${shift.id} staff lookup:`, foundStaff);
      });
      
      setShifts(shifts);
      setStaff(staffList);
      
      // If we have a selected shift, update it with fresh data
      if (selectedShift) {
        const freshShift = shifts.find((s: Shift) => s.id === selectedShift.id);
        if (freshShift) {
          console.log(`[Scheduling] Updating selected shift with fresh data:`, freshShift.assignedStaffIds);
          setSelectedShift(freshShift);
        }
      }
    } catch (e: any) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const createShift = async () => {
    if (!title || !startAt || !endAt) {
      setError('Title, start time, and end time are required');
      return;
    }
    
    setError(null);
    setCreating(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/shifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ title, location, startAt, endAt })
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed to create shift');
      }
      
      await loadData();
      setTitle('');
      setLocation('');
      setStartAt('');
      setEndAt('');
      setShowCreateForm(false);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setCreating(false);
    }
  };

  const assignStaff = async (shiftId: string, staffId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/shifts/${shiftId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ staffId })
      });
      
      if (!res.ok) throw new Error('Failed to assign staff');
      
      await loadData();
      // Refresh selected shift if it's the one we just updated
      if (selectedShift && selectedShift.id === shiftId) {
        const updatedShift = shifts.find(s => s.id === shiftId);
        if (updatedShift) setSelectedShift(updatedShift);
      }
    } catch (e: any) {
      alert(e.message || 'Assignment failed');
    }
  };

  const assignMultipleStaff = async (shiftId: string, staffIds: string[]) => {
    try {
      const token = localStorage.getItem('token');
      console.log(`[assignMultipleStaff] Bulk assigning ${staffIds.length} staff to shift ${shiftId}:`, staffIds);
      
      // Use bulk assignment endpoint
      const res = await fetch(`${API}/shifts/${shiftId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ staffIds })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Failed to assign staff: ${errorData.error || res.statusText}`);
      }
      
      const result = await res.json();
      console.log(`[assignMultipleStaff] Bulk assignment complete. Shift now has ${result.data?.assignedStaffIds?.length || 0} staff:`, result.data?.assignedStaffIds);
      
      // Reload data to get fresh shift information
      await loadData();
      
      // Wait a bit for state to update, then refresh selected shift
      setTimeout(async () => {
        // Reload shifts to get the latest data
        const token = localStorage.getItem('token');
        const shiftsRes = await fetch(`${API}/shifts`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        const shiftsData = await shiftsRes.json();
        const freshShifts = shiftsData.data || [];
        const updatedShift = freshShifts.find((s: Shift) => s.id === shiftId);
        if (updatedShift) {
          console.log(`[assignMultipleStaff] Updated selected shift with ${updatedShift.assignedStaffIds.length} staff:`, updatedShift.assignedStaffIds);
          setSelectedShift(updatedShift);
          // Also update the shifts state
          setShifts(freshShifts);
        }
      }, 300);
    } catch (e: any) {
      console.error('[assignMultipleStaff] Error:', e);
      alert(e.message || 'Failed to assign staff');
    }
  };

  const unassignStaff = async (shiftId: string, staffId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/shifts/${shiftId}/unassign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ staffId })
      });
      
      if (!res.ok) throw new Error('Failed to unassign staff');
      
      await loadData();
      // Refresh selected shift
      if (selectedShift && selectedShift.id === shiftId) {
        const updatedShift = shifts.find(s => s.id === shiftId);
        if (updatedShift) setSelectedShift(updatedShift);
      }
    } catch (e: any) {
      console.error('Unassign error:', e);
      alert(e.message || 'Failed to remove staff');
    }
  };

  const getStaffName = (staffId: string) => {
    const s = staff.find(x => x.id === staffId);
    return s ? `${s.firstName} ${s.lastName}` : 'Unknown';
  };

  const getAssignedStaff = (shift: Shift): Staff[] => {
    const assignedIds = Array.isArray(shift.assignedStaffIds) ? shift.assignedStaffIds : [];
    if (assignedIds.length === 0) {
      return [];
    }
    
    // Find all staff that match the assigned IDs
    const assigned = staff.filter(s => {
      const isAssigned = assignedIds.includes(s.id);
      if (isAssigned) {
        console.log(`[getAssignedStaff] Found match: ${s.id} (${s.firstName} ${s.lastName})`);
      }
      return isAssigned;
    });
    
    // Log any missing staff
    const missingIds = assignedIds.filter(id => !staff.some(s => s.id === id));
    if (missingIds.length > 0) {
      console.warn(`[getAssignedStaff] Missing staff IDs for shift ${shift.id}:`, missingIds);
    }
    
    console.log(`[getAssignedStaff] Shift ${shift.id} (${shift.title}): assignedIds=`, assignedIds, 'found staff=', assigned.length, 'of', assignedIds.length);
    return assigned;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-600 dark:text-slate-400">Loading shifts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Scheduling</h2>
        {isAdminOrManager && (
          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 active:scale-[.98]"
          >
            {showCreateForm ? 'Cancel' : 'Create Shift'}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">New Shift</h3>
          
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Morning Shift"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Hanoi Store"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Start Time *</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">End Time *</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createShift}
              disabled={creating}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 active:scale-[.98] disabled:opacity-60 dark:bg-slate-700"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Shifts List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">
          Shifts ({shifts.length})
        </h3>
        
        {shifts.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {isAdminOrManager 
              ? 'No shifts created yet. Click "Create Shift" to get started.'
              : 'No shifts assigned to you yet.'}
          </div>
        ) : (
          <div className="space-y-3">
            {shifts.map((shift) => {
              const assignedIds = Array.isArray(shift.assignedStaffIds) ? shift.assignedStaffIds : [];
              const assignedStaffList = getAssignedStaff(shift);
              const isSelected = selectedShift?.id === shift.id;
              
              // Debug: Log what we're rendering
              console.log(`[Render Shift] ${shift.id} (${shift.title}):`, {
                assignedIds,
                assignedIdsLength: assignedIds.length,
                staffArrayLength: staff.length,
                assignedStaffListLength: assignedStaffList.length,
                assignedStaffList: assignedStaffList.map(s => `${s.firstName} ${s.lastName}`)
              });
              
              return (
                <div
                  key={shift.id}
                  className={`rounded-xl border p-3 transition-all ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20' 
                      : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                  }`}
                >
                  <div 
                    className="flex items-start justify-between gap-3 cursor-pointer"
                    onClick={() => {
                      const newSelected = isSelected ? null : shift;
                      setSelectedShift(newSelected);
                      if (newSelected) {
                        setSelectedStaffIds([]);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-800 dark:text-slate-100">{shift.title}</h4>
                        {assignedIds.length > 0 && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            {assignedIds.length} {assignedIds.length === 1 ? 'staff' : 'staff'}
                          </span>
                        )}
                      </div>
                      {shift.location && (
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Location: {shift.location}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Time: {new Date(shift.startAt).toLocaleString()} → {new Date(shift.endAt).toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Assign Staff - Only for Admin/Manager */}
                    {isAdminOrManager && !isSelected && (
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedShift(shift)}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                          Manage Staff
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Detail View */}
                  {isSelected && (
                    <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {isAdminOrManager ? 'Assigned Staff' : 'Working with'}
                        </h5>
                        {isAdminOrManager && (
                          <div className="flex flex-col gap-3">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                              <div className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                                Select staff to assign:
                              </div>
                              <div className="max-h-40 space-y-2 overflow-y-auto">
                                {staff
                                  .filter(s => !assignedIds.includes(s.id))
                                  .map((s) => (
                                    <label
                                      key={s.id}
                                      className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 p-1 rounded"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedShift?.id === shift.id && selectedStaffIds.includes(s.id)}
                                        onChange={(e) => {
                                          if (selectedShift?.id !== shift.id) {
                                            setSelectedShift(shift);
                                            setSelectedStaffIds([]);
                                          }
                                          if (e.target.checked) {
                                            setSelectedStaffIds([...selectedStaffIds, s.id]);
                                          } else {
                                            setSelectedStaffIds(selectedStaffIds.filter(id => id !== s.id));
                                          }
                                        }}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600"
                                      />
                                      <span className="text-sm text-slate-700 dark:text-slate-200">
                                        {s.firstName} {s.lastName}
                                      </span>
                                    </label>
                                  ))}
                                {staff.filter(s => !assignedIds.includes(s.id)).length === 0 && (
                                  <div className="text-xs text-slate-400 dark:text-slate-500 py-2">
                                    All staff are already assigned
                                  </div>
                                )}
                              </div>
                              {selectedShift?.id === shift.id && selectedStaffIds.length > 0 && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const idsToAssign = [...selectedStaffIds];
                                    console.log(`[Button] Assigning ${idsToAssign.length} staff to shift ${shift.id}:`, idsToAssign);
                                    setSelectedStaffIds([]);
                                    await assignMultipleStaff(shift.id, idsToAssign);
                                  }}
                                  className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 active:scale-[.98]"
                                >
                                  Assign {selectedStaffIds.length} {selectedStaffIds.length === 1 ? 'Staff Member' : 'Staff Members'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {assignedIds.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                          {assignedStaffList.length > 0 ? (
                            <>
                              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-800/40">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Department</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Location</th>
                                    {isAdminOrManager && (
                                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Actions</th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                                  {assignedStaffList.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                      <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                                        {s.firstName} {s.lastName}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{s.email}</td>
                                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{s.department || '—'}</td>
                                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{s.location || '—'}</td>
                                      {isAdminOrManager && (
                                        <td className="px-4 py-3 text-sm">
                                          <button
                                            type="button"
                                            onClick={async () => {
                                              if (confirm(`Remove ${s.firstName} ${s.lastName} from this shift?`)) {
                                                await unassignStaff(shift.id, s.id);
                                                await loadData();
                                              }
                                            }}
                                            className="rounded-xl border border-red-200 px-3 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/30"
                                          >
                                            Remove
                                          </button>
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {assignedIds.length > assignedStaffList.length && (
                                <div className="border-t border-slate-200 bg-yellow-50 px-4 py-2 text-xs text-yellow-700 dark:border-slate-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                                  Warning: {assignedIds.length - assignedStaffList.length} assigned staff member(s) not found in staff list
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                              {assignedIds.length} staff assigned but details not available
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                          No staff assigned yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
