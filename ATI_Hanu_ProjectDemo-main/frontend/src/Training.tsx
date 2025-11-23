import React, { useEffect, useState } from 'react';
import { AcademicCapIcon, ClockIcon, CheckCircleIcon, DocumentArrowDownIcon, PlayIcon, PencilIcon } from '@heroicons/react/24/outline';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

type CourseMaterial = {
  id: string;
  courseId: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  uploadedAt?: string;
};

type Course = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  durationMins?: number;
  createdAt?: string;
  materials?: CourseMaterial[];
};

type Assignment = {
  id: string;
  courseId: string;
  staffId: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedAt: string;
  completedAt?: string;
  score?: number;
  notes?: string;
  progressPercent?: number;
  timeSpentMins?: number;
  lastAccessedAt?: string;
  courseTitle?: string;
  courseDescription?: string;
  courseCategory?: string;
  courseDurationMins?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string | null;
  jobTitle?: string | null;
  role?: string | null;
};

export default function Training({ role }: { role?: string | null }) {
  const isAdminOrManager = role === 'admin' || role === 'manager';
  const isStaff = role === 'staff';
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For staff: show "My Courses" by default, for admin/manager: show "All Courses"
  const [activeTab, setActiveTab] = useState<'courses' | 'assignments' | 'myCourses'>(isStaff ? 'myCourses' : 'courses');
  
  // View course details
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Create course form
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  
  // Assign form
  const [showAssign, setShowAssign] = useState(false);
  const [assignCourseId, setAssignCourseId] = useState('');
  const [assignStaffIds, setAssignStaffIds] = useState<string[]>([]);
  
  // Upload course material
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [uploadingCourseId, setUploadingCourseId] = useState<string | null>(null);
  
  // Progress tracking
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressAssignmentId, setProgressAssignmentId] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [timeSpentMins, setTimeSpentMins] = useState(0);
  const [progressNotes, setProgressNotes] = useState('');
  
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
        isAdminOrManager ? fetch(`${API}/staff`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        }) : Promise.resolve({ json: async () => ({ data: [] }) })
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
    if (!assignCourseId || assignStaffIds.length === 0) {
      setError('Please select both course and at least one staff member');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Assign to multiple staff members
      const assignments = await Promise.all(
        assignStaffIds.map(async (staffId) => {
      const res = await fetch(`${API}/training/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          courseId: assignCourseId,
              staffId: staffId
        })
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
            throw new Error(j?.error || `Failed to assign to staff ${staffId}`);
      }
          
          return res.json();
        })
      );
      
      await loadData();
      setShowAssign(false);
      setAssignCourseId('');
      setAssignStaffIds([]);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const uploadCourseMaterial = async (courseId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploadingMaterial(true);
    setUploadingCourseId(courseId);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Append all files
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      
      const res = await fetch(`${API}/training/courses/${courseId}/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Upload failed');
      }
      
      const result = await res.json();
      await loadData();
      // Reload selected course if it's the one being updated
      if (selectedCourse?.id === courseId) {
        await viewCourse(courseId);
      }
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setUploadingMaterial(false);
      setUploadingCourseId(null);
    }
  };

  const deleteCourseMaterial = async (courseId: string, materialId: string) => {
    if (!confirm('Delete this material?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/training/courses/${courseId}/materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Delete failed');
      }
      
      await loadData();
      // Reload selected course if it's the one being updated
      if (selectedCourse?.id === courseId) {
        await viewCourse(courseId);
      }
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    }
  };

  const downloadCourseMaterial = async (courseId: string, materialId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/training/courses/${courseId}/materials/${materialId}/download`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Download failed');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      alert(e.message || 'Download failed');
    }
  };

  const updateProgress = async () => {
    setError(null);
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/training/assignments/${progressAssignmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          progressPercent,
          timeSpentMins,
          notes: progressNotes || null
        })
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed to update progress');
      }
      
      await loadData();
      setShowProgressModal(false);
      setProgressAssignmentId('');
      setProgressPercent(0);
      setTimeSpentMins(0);
      setProgressNotes('');
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const openProgressModal = (assignment: Assignment) => {
    setProgressAssignmentId(assignment.id);
    setProgressPercent(assignment.progressPercent || 0);
    setTimeSpentMins(assignment.timeSpentMins || 0);
    setProgressNotes(assignment.notes || '');
    setShowProgressModal(true);
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
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
      }
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    }
  };

  const viewCourse = async (courseId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/training/courses/${courseId}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      
      if (!res.ok) throw new Error('Failed to load course');
      const data = await res.json();
      setSelectedCourse(data.data);
    } catch (e: any) {
      alert(e.message || 'Failed to load course');
    }
  };

  const myAssignments = assignments.filter(a => a.status !== 'completed');
  const completedAssignments = assignments.filter(a => a.status === 'completed');

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
        {isStaff && (
          <button
            type="button"
            onClick={() => setActiveTab('myCourses')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'myCourses'
                ? 'border-b-2 border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            My Courses ({myAssignments.length})
          </button>
        )}
        {isAdminOrManager && (
          <>
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
          </>
        )}
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
            
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Staff * (Select multiple)</label>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
                {staff.length === 0 ? (
                  <p className="p-2 text-sm text-slate-500 dark:text-slate-400">No staff available</p>
                ) : (
                  staff.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-2 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <input
                        type="checkbox"
                        checked={assignStaffIds.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignStaffIds([...assignStaffIds, s.id]);
                          } else {
                            setAssignStaffIds(assignStaffIds.filter(id => id !== s.id));
                          }
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {s.firstName} {s.lastName} {s.email && `(${s.email})`}
                      </span>
                    </label>
                  ))
                )}
              </div>
              {assignStaffIds.length > 0 && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {assignStaffIds.length} staff member{assignStaffIds.length > 1 ? 's' : ''} selected
                </p>
              )}
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

      {/* Progress Update Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Update Progress</h3>
            
            {error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
                  Progress: {progressPercent}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Time Spent (minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={timeSpentMins}
                  onChange={(e) => setTimeSpentMins(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Notes</label>
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about your progress..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowProgressModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateProgress}
                disabled={submitting}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 active:scale-[.98] disabled:opacity-60 dark:bg-slate-700"
              >
                {submitting ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* My Courses Tab (Staff) */}
      {activeTab === 'myCourses' && (
        <div className="space-y-4">
          {myAssignments.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No courses assigned yet</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">{assignment.courseTitle}</h4>
                      {assignment.courseDescription && (
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {assignment.courseDescription}
                        </p>
                      )}
                    </div>
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      assignment.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : assignment.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {assignment.status}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Progress</span>
                      <span>{assignment.progressPercent || 0}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${assignment.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {assignment.courseDurationMins && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{assignment.courseDurationMins} mins</span>
                      </div>
                    )}
                    {assignment.timeSpentMins && assignment.timeSpentMins > 0 && (
                      <div className="flex items-center gap-1">
                        <span>Spent: {assignment.timeSpentMins} mins</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await viewCourse(assignment.courseId);
                        // Switch to courses tab and expand the course
                        setActiveTab('courses');
                        // The course will be expanded automatically when selectedCourse is set
                      }}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <PlayIcon className="h-4 w-4" />
                        View Course
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => openProgressModal(assignment)}
                      className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-200"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <PencilIcon className="h-4 w-4" />
                        Update Progress
                      </div>
                    </button>
                  </div>
                  
                  {(assignment.courseId && selectedCourse?.id === assignment.courseId && selectedCourse.materials && selectedCourse.materials.length > 0) && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Materials:</p>
                      {selectedCourse?.id === assignment.courseId && selectedCourse.materials && selectedCourse.materials.length > 0 ? (
                        <div className="space-y-1">
                          {selectedCourse.materials.map((material) => (
                            <button
                              key={material.id}
                              type="button"
                              onClick={() => downloadCourseMaterial(assignment.courseId, material.id, material.fileName)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                              <div className="flex items-center justify-center gap-1">
                                <DocumentArrowDownIcon className="h-3 w-3" />
                                {material.fileName}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            await viewCourse(assignment.courseId);
                            setActiveTab('courses');
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <DocumentArrowDownIcon className="h-3 w-3" />
                            View & Download Materials
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {completedAssignments.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Completed Courses</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {completedAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100">{assignment.courseTitle}</h4>
                        </div>
                        {assignment.completedAt && (
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                            Completed: {new Date(assignment.completedAt).toLocaleDateString()}
                          </p>
                        )}
                        {assignment.score && (
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Score: {assignment.score}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Courses Tab (Admin/Manager) */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">No courses created yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={`rounded-2xl border p-4 shadow-sm transition-all ${
                    selectedCourse?.id === course.id
                      ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        if (selectedCourse?.id === course.id) {
                          setSelectedCourse(null);
                        } else {
                          viewCourse(course.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100">{course.title}</h4>
                        {selectedCourse?.id === course.id && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">(Expanded)</span>
                        )}
                      </div>
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
                        {((course.materials && course.materials.length > 0) || course.fileName) && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            {course.materials ? `${course.materials.length} Material${course.materials.length > 1 ? 's' : ''}` : 'Material Available'}
                          </span>
                        )}
                      </div>
                    </div>
                    {isAdminOrManager && (
                      <div className="flex gap-2">
                      <button
                        type="button"
                          onClick={() => {
                            setAssignCourseId(course.id);
                            setAssignStaffIds([]);
                            setShowAssign(true);
                            setActiveTab('assignments');
                          }}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-200"
                        >
                          Assign
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCourse(course.id);
                          }}
                          className="rounded-xl border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300"
                      >
                        Delete
                      </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Expanded Course Details */}
                  {selectedCourse?.id === course.id && (
                    <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                      <div className="space-y-3">
                        {selectedCourse.description && (
                          <div>
                            <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description</h5>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selectedCourse.description}</p>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm">
                          {selectedCourse.category && (
                            <div>
                              <span className="text-xs text-slate-600 dark:text-slate-400">Category: </span>
                              <span className="font-medium text-slate-800 dark:text-slate-100">{selectedCourse.category}</span>
                            </div>
                          )}
                          {selectedCourse.durationMins && (
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-800 dark:text-slate-100">{selectedCourse.durationMins} minutes</span>
                            </div>
                          )}
                        </div>
                        {/* Course Materials Section */}
                        <div>
                          <h5 className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Course Materials</h5>
                          {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
                            <div className="space-y-2">
                              {selectedCourse.materials.map((material) => (
                                <div
                                  key={material.id}
                                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <DocumentArrowDownIcon className="h-4 w-4 text-slate-500 flex-shrink-0" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate" title={material.fileName}>
                                      {material.fileName}
                                    </span>
                                    {material.fileSize && (
                                      <span className="text-xs text-slate-500 dark:text-slate-400">
                                        ({(material.fileSize / 1024).toFixed(1)} KB)
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => downloadCourseMaterial(selectedCourse.id, material.id, material.fileName)}
                                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-200"
                                    >
                                      Download
                                    </button>
                                    {isAdminOrManager && (
                                      <button
                                        type="button"
                                        onClick={() => deleteCourseMaterial(selectedCourse.id, material.id)}
                                        className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:text-red-300"
                                      >
                                        Delete
                                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
                          ) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400">No course materials uploaded yet</p>
                          )}
                          
                          {isAdminOrManager && (
                            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-200">
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.pptx,.ppt"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    uploadCourseMaterial(selectedCourse.id, e.target.files);
                                  }
                                }}
                                disabled={uploadingMaterial && uploadingCourseId === selectedCourse.id}
                              />
                              {uploadingMaterial && uploadingCourseId === selectedCourse.id ? (
                                'Uploading...'
                              ) : (
                                <>
                                  <DocumentArrowDownIcon className="h-4 w-4" />
                                  Upload Materials (Multiple)
                                </>
                              )}
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assignments Tab (Admin/Manager) */}
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
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Progress</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Time Spent</th>
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
                        <div className="flex items-center gap-2">
                          <div className="w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className="h-2 bg-emerald-500"
                              style={{ width: `${a.progressPercent || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">{a.progressPercent || 0}%</span>
                        </div>
                      </td>
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
                        {a.timeSpentMins ? `${a.timeSpentMins} mins` : '-'}
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
