import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

type Course = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  filePath?: string;
  fileName?: string;
  durationMins?: number;
};

type Assignment = {
  id: string;
  courseId: string;
  staffId: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedAt: string;
  completedAt?: string;
  score?: number;
  courseTitle?: string;
  firstName?: string;
  lastName?: string;
};

type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function Training({ role }: { role?: string | null }) {
  const isAdminOrManager = role === 'admin' || role === 'manager';
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'courses' | 'assignments'>('courses');
  
  // Create course form
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  
  // Assign form
  const [showAssign, setShowAssign] = useState(false);
  const [assignCourseId, setAssignCourseId] = useState('');
  const [assignStaffId, setAssignStaffId] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [coursesRes, assignmentsRes, staffRes] = await Promise.all([
        fetch(`${API}/training/courses`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        }),
        fetch(`${API}/training/assignments`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        }),
        fetch(`${API}/staff`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        })
      ]);
      
      const coursesData = await coursesRes.json();
      const assignmentsData = await assignmentsRes.json();
      const staffData = await staffRes.json();
      
      setCourses(coursesData.data || []);
      setAssignments(assignmentsData.data || []);
      setStaff(staffData.data || []);
    } catch (e: any) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async () => {
    if (!courseTitle) {
      setError('Course title is required');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/training/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: courseTitle,
          description: courseDescription || null,
          category: courseCategory || null,
          durationMins: courseDuration ? parseInt(courseDuration) : null
        })
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed to create course');
      }
      
      await loadData();
      setShowCreateCourse(false);
      setCourseTitle('');
      setCourseDescription('');
      setCourseCategory('');
      setCourseDuration('');
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const assignCourse = async () => {
    if (!assignCourseId || !assignStaffId) {
      setError('Please select both course and staff');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/training/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          courseId: assignCourseId,
          staffId: assignStaffId
        })
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed to assign course');
      }
      
      await loadData();
      setShowAssign(false);
      setAssignCourseId('');
      setAssignStaffId('');
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/training/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Update failed');
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Delete this course? This will also remove all assignments.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/training/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (!res.ok) throw new Error('Delete failed');
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-600 dark:text-slate-400">Loading training data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Training</h2>
        {isAdminOrManager && (
          <div className="flex gap-2">
            {activeTab === 'courses' && (
              <button
                type="button"
                onClick={() => setShowCreateCourse(!showCreateCourse)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 active:scale-[.98]"
              >
                {showCreateCourse ? 'Cancel' : 'Create Course'}
              </button>
            )}
            {activeTab === 'assignments' && (
              <button
                type="button"
                onClick={() => setShowAssign(!showAssign)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 active:scale-[.98]"
              >
                {showAssign ? 'Cancel' : 'Assign Course'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'courses'
              ? 'border-b-2 border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Courses ({courses.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'assignments'
              ? 'border-b-2 border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Assignments ({assignments.length})
        </button>
      </div>

      {/* Create Course Form */}
      {showCreateCourse && activeTab === 'courses' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">New Course</h3>
          
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Title *</label>
              <input
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Workplace Safety Training"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Category</label>
              <input
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
                placeholder="Safety, HR, Operations..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Description</label>
              <textarea
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                rows={3}
                placeholder="Course description..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Duration (minutes)</label>
              <input
                type="number"
                value={courseDuration}
                onChange={(e) => setCourseDuration(e.target.value)}
                min="0"
                placeholder="60"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateCourse(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createCourse}
              disabled={submitting}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 active:scale-[.98] disabled:opacity-60 dark:bg-slate-700"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Assign Course Form */}
      {showAssign && activeTab === 'assignments' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">Assign Course to Staff</h3>
          
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Course *</label>
              <select
                value={assignCourseId}
                onChange={(e) => setAssignCourseId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Select course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Staff *</label>
              <select
                value={assignStaffId}
                onChange={(e) => setAssignStaffId(e.target.value)}
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
          </div>
          
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAssign(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={assignCourse}
              disabled={submitting}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 active:scale-[.98] disabled:opacity-60 dark:bg-slate-700"
            >
              {submitting ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {courses.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No courses created yet
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {courses.map((course) => (
                <div key={course.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800 dark:text-slate-100">{course.title}</h4>
                      {course.description && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{course.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {course.category && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                            {course.category}
                          </span>
                        )}
                        {course.durationMins && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                            {course.durationMins} mins
                          </span>
                        )}
                      </div>
                    </div>
                    {isAdminOrManager && (
                      <button
                        type="button"
                        onClick={() => deleteCourse(course.id)}
                        className="ml-4 rounded-xl border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {assignments.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No assignments yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-800/40">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Staff</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Assigned</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                        {a.firstName} {a.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{a.courseTitle}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          a.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : a.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(a.assignedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {a.status !== 'completed' && (
                          <select
                            value={a.status}
                            onChange={(e) => updateAssignmentStatus(a.id, e.target.value)}
                            className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}