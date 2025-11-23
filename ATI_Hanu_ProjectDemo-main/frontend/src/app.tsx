import React, { useEffect, useMemo, useState } from "react";
import {
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  SparklesIcon,
  MoonIcon,
  SunIcon,
  DocumentTextIcon,
  DocumentIcon,
  TableCellsIcon,
  PhotoIcon,
  PaperClipIcon,
  ShieldCheckIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import CreateStaff from './CreateStaff';
import Scheduling from './Scheduling';
import Timesheets from './Timesheets';
import Payroll from './Payroll';
import Training from './Training';

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  jobTitle?: string | null;
  location?: string;
  role?: string | null;
};

function useLocalStorage(key: string) {
  const [value, setValue] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  });
  
  // Update state when localStorage changes (from other components or tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        setValue(e.newValue);
      }
    };
    
    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check localStorage periodically in case it was changed directly (same tab)
    const interval = setInterval(() => {
      const currentValue = localStorage.getItem(key);
      if (currentValue !== value) {
        setValue(currentValue);
      }
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [key, value]);
  
  // Update localStorage when state changes
  useEffect(() => {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }, [key, value]);
  
  return { value, setValue } as const;
}

function ProfileButton({ role, email, staff, onSignOut }: { role: string | null; email: string | null; staff: Staff[]; onSignOut: () => void }) {
  const [showProfile, setShowProfile] = useState(false);
  // Match staff by email (case-insensitive) to handle email variations
  const userStaff = staff.find(s => {
    if (!s.email || !email) return false;
    return s.email.toLowerCase().trim() === email.toLowerCase().trim();
  }) || null;
  const userName = userStaff ? `${userStaff.firstName} ${userStaff.lastName}` : email || 'User';
  const displayRole = userStaff?.role || role || 'Unknown';
  const initials = userStaff 
    ? `${userStaff.firstName.charAt(0)}${userStaff.lastName.charAt(0)}`.toUpperCase()
    : email 
      ? email.substring(0, 2).toUpperCase()
      : 'U';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowProfile(!showProfile)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        aria-label="View profile"
      >
        {initials}
      </button>

      {showProfile && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfile(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <div className="p-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-lg font-semibold text-white">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {userName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {email || 'No email'}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Access level
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">
                    {displayRole}
                  </div>
                </div>

                {userStaff && (
                  <>
                    {userStaff.jobTitle && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Job title
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {userStaff.jobTitle}
                        </div>
                      </div>
                    )}

                    {userStaff.department && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Department
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {userStaff.department}
                        </div>
                      </div>
                    )}

                    {userStaff.location && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Location
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {userStaff.location}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm text-red-700 shadow-sm hover:bg-red-50 active:scale-95 dark:border-red-900/50 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NavBar({ onToggleSidebar, navigate, onSignOut, role, email, staff }: { onToggleSidebar: () => void; navigate: (p: string) => void; onSignOut: () => void; role: string | null; email: string | null; staff: Staff[] }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle sidebar"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSidebar();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleSidebar();
              }
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm.75 4.5a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">Staff Platform</span>
          <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-200">Demo</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/ai')}
            className="hidden rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 sm:inline-block"
          >
            Docs
          </button>
          <ThemeToggle />
          <ProfileButton role={role} email={email} staff={staff} onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    // Check localStorage first, then document class
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      // Check if dark class is already on document
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  // Sync with document on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark !== dark) {
      setDark(isDark);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update document and localStorage when dark state changes
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const handleToggle = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDark((prev) => {
      const newValue = !prev;
      // Immediately update DOM for instant feedback
      if (newValue) {
        document.documentElement.classList.add("dark");
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem('theme', 'light');
      }
      return newValue;
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle(e);
        }
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <>
          <MoonIcon className="h-4 w-4" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <SunIcon className="h-4 w-4" />
          <span>Light</span>
        </>
      )}
    </button>
  );
}

function Sidebar({ open, onClose, navigate, role }: { open: boolean; onClose: () => void; navigate: (p: string) => void; role: string | null }) {
  // Force re-render when localStorage changes
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    const checkRole = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    // Check on mount and when role prop changes
    checkRole();
    
    // Listen for storage events
    window.addEventListener('storage', checkRole);
    
    // Also check periodically (in case localStorage was changed directly in same tab)
    const interval = setInterval(checkRole, 200);
    
    return () => {
      window.removeEventListener('storage', checkRole);
      clearInterval(interval);
    };
  }, [role]);
  
  // ALWAYS read directly from localStorage on every render to get the latest value
  // This ensures we don't have stale prop values
  const roleFromStorage = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const roleToUse = roleFromStorage || role;
  const normalizedRole = roleToUse ? String(roleToUse).toLowerCase().trim() : null;
  
  // STRICT admin check - must be exactly 'admin' (case-insensitive)
  // Managers and staff are explicitly excluded
  const isAdminRole = normalizedRole === 'admin';
  
  // Debug logging (remove in production)
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    console.log('[Sidebar] Role check:', { 
      roleFromStorage, 
      roleProp: role, 
      roleToUse, 
      normalizedRole, 
      isAdminRole,
      refreshKey 
    });
  }
  
  // Build menu items - Payroll is ONLY for admins, NEVER for managers or staff
  // Read role directly from localStorage MULTIPLE times to ensure we have the latest value
  const roleCheck1 = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const roleCheck2 = role || roleCheck1;
  const roleCheck3 = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const finalRole = roleCheck3 || roleCheck2 || roleCheck1;
  const finalRoleNormalized = finalRole ? String(finalRole).toLowerCase().trim() : null;
  
  // ABSOLUTE check - ONLY 'admin' (lowercase) can see Payroll
  // Managers and staff are EXPLICITLY blocked - NO EXCEPTIONS
  const isAdminUser = finalRoleNormalized === 'admin';
  const isManagerUser = finalRoleNormalized === 'manager';
  const isStaffUser = finalRoleNormalized === 'staff';
  
  // Base menu items that everyone can see - Payroll is NOT included here
  const menuItems: Array<{ label: string; Icon: any; path: string; roles: string[] }> = [
    { label: "Dashboard", Icon: ChartBarIcon, path: "/", roles: ['admin', 'manager', 'staff'] },
    { label: "Staff", Icon: UsersIcon, path: "/staff", roles: ['admin', 'manager', 'staff'] },
    { label: "Scheduling", Icon: CalendarIcon, path: "/shifts", roles: ['admin', 'manager', 'staff'] },
    { label: "Timesheets", Icon: ClockIcon, path: "/timesheets", roles: ['admin', 'manager', 'staff'] },
  ];
  
  // ONLY add Payroll if user is EXACTLY 'admin' - managers and staff are EXPLICITLY excluded
  // Triple-check: must be admin AND not manager AND not staff
  if (isAdminUser && !isManagerUser && !isStaffUser && finalRoleNormalized === 'admin') {
    menuItems.push({ label: "Payroll", Icon: CurrencyDollarIcon, path: "/payroll", roles: ['admin'] });
  }
  
  // Add remaining items that everyone can see
  menuItems.push(
    { label: "Training", Icon: AcademicCapIcon, path: "/training", roles: ['admin', 'manager', 'staff'] },
    { label: "Docs & AI", Icon: SparklesIcon, path: "/ai", roles: ['admin', 'manager', 'staff'] }
  );
  
  return (
    <>
      {/* Backdrop overlay - only show on mobile when sidebar is open */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        className={`fixed inset-0 z-30 bg-black/30 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      {/* Sidebar - toggleable on all screen sizes */}
      <aside
        className={`fixed top-14 z-40 h-[calc(100dvh-56px)] w-72 overflow-y-auto border-r border-slate-200 bg-white p-4 transition-all duration-200 ease-out dark:border-slate-800 dark:bg-slate-900 lg:static lg:top-0 lg:translate-x-0 ${open ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 lg:opacity-0 lg:pointer-events-none"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <nav className="space-y-1">
          {menuItems
          .filter((it) => {
            // ABSOLUTE CHECK: Payroll is ONLY for admins - block managers and staff
            // This check happens BEFORE any other logic - NO EXCEPTIONS
            if (it.label === 'Payroll' || it.path === '/payroll' || it.Icon === CurrencyDollarIcon) {
              // Read role directly from localStorage - no fallbacks, no props
              const payrollRoleCheck = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
              if (!payrollRoleCheck) {
                return false; // No role = no Payroll
              }
              const payrollRoleNormalized = String(payrollRoleCheck).toLowerCase().trim();
              // ONLY allow if role is exactly 'admin' - block everything else including managers
              if (payrollRoleNormalized !== 'admin') {
                // Explicitly block Payroll for managers, staff, and any other role
                return false;
              }
              // Double-check: even if it passed, verify one more time
              const doubleCheck = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
              if (!doubleCheck || String(doubleCheck).toLowerCase().trim() !== 'admin') {
                return false;
              }
            }
            // If no role restrictions, show to everyone
            if (!it.roles || it.roles.length === 0) return true;
            // If no role is set, hide restricted items
            if (!normalizedRole) return false;
            // Normalize and compare roles
            return it.roles.some(r => r.toLowerCase() === normalizedRole);
          })
          .map((it) => (
            <button
              type="button"
              key={it.label}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(it.path);
                // Only close sidebar on mobile (screen width < 1024px)
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  onClose();
                }
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <it.Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{it.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="text-sm text-slate-500 dark:text-slate-400">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
  );
}

function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setSuccess(null);
    setResetToken(null);
    setLoading(true);
    try {
      const r = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed to request password reset");
      
      // For demo, show the token (in production, this would be sent via email)
      if (j.resetToken) {
        setResetToken(j.resetToken);
        setSuccess("Password reset token generated successfully!");
      } else {
        setSuccess(j.message || "Password reset request processed");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-xl font-semibold text-slate-800 dark:text-slate-100">Forgot Password</h2>
      
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {success && !resetToken && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-200">
          {success}
        </div>
      )}

      {resetToken && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/30">
          <h3 className="mb-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">Password Reset Token</h3>
          <p className="mb-3 text-xs text-emerald-700 dark:text-emerald-300">
            Use this token to reset your password. This token expires in 1 hour.
          </p>
          <div className="mb-3 rounded-lg border border-emerald-300 bg-white p-3 dark:border-emerald-700 dark:bg-slate-800">
            <div className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-300 break-all">
              {resetToken}
            </div>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Copy this token and use it on the reset password page.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            autoFocus
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={loading || !email}
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 active:scale-[.98] disabled:opacity-60 dark:bg-slate-700"
        >
          {loading ? "Processing..." : "Request Reset Token"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

function ResetPasswordForm({ onBack }: { onBack: () => void }) {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    setError(null);
    setSuccess(false);
    
    if (!token || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed to reset password");
      
      setSuccess(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900/50 dark:bg-emerald-900/30">
          <h3 className="mb-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">Password Reset Successful!</h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            Your password has been reset. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-xl font-semibold text-slate-800 dark:text-slate-100">Reset Password</h2>
      
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Reset Token
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter reset token"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Confirm new password"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={loading || !token || !newPassword || !confirmPassword}
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 active:scale-[.98] disabled:opacity-60 dark:bg-slate-700"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

function LoginForm({ onLoggedIn }: { onLoggedIn: (t: string, r: string | null) => void }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const submit = async () => {
    setError(null); setLoading(true);
    try {
      const r = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Login failed");
      // Store role and email along with token - normalize role to lowercase
      if (j.role) {
        const normalizedRole = String(j.role).toLowerCase().trim();
        localStorage.setItem('role', normalizedRole);
      }
      if (j.email) localStorage.setItem('email', j.email);
      onLoggedIn(j.token, j.role || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
  }

  if (showResetPassword) {
    return <ResetPasswordForm onBack={() => setShowResetPassword(false)} />;
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-2 text-center text-xl font-semibold text-slate-800 dark:text-slate-100">Welcome back</h2>
      <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">Sign in to manage your team</p>
          <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Email</label>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-xs text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Forgot Password?
          </button>
        </div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">{error}</div>}
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 active:scale-[.98] disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Demo: admin@example.com / admin123</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => setShowResetPassword(true)}
            className="hover:text-slate-700 dark:hover:text-slate-200"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}

function StaffTable({ data, role }: { data: Staff[]; role?: string | null }) {
  const isAdminOrManager = role === 'admin' || role === 'manager';
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return data;
    return data.filter((s) =>
      [s.firstName, s.lastName, s.email, s.department, s.jobTitle, s.location, s.role]
        .some((v) => (v || "").toLowerCase().includes(qq))
    );
  }, [q, data]);

  return (
    <Card
      title="Staff"
      right={
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search staff…"
          className="w-48 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      }
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/40">
            <tr>
              {(() => {
                const headers = ["Name", "Email", "Department", "Job Title", "Access", "Location"];
                if (isAdminOrManager) headers.push("");
                return headers;
              })().map((h, idx) => (
                <th key={idx} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">{s.firstName} {s.lastName}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{s.email}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{s.department || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{s.jobTitle || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 capitalize">{s.role || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{s.location || "—"}</td>
                {isAdminOrManager && (
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => (window as any).__navigate?.(`/staff/edit/${s.id}`)} className="rounded-xl border border-slate-200 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300">Edit</button>
                      <button type="button" onClick={async () => {
                        if (!confirm('Delete staff?')) return;
                        const token = localStorage.getItem('token');
                        const r = await fetch(`${API}/staff/${s.id}`, { method: 'DELETE', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
                        if (r.ok) {
                          (window as any).__reloadStaff?.();
                        } else {
                          const j = await r.json().catch(() => ({}));
                          alert(j?.error || 'Delete failed');
                        }
                      }} className="rounded-xl border border-red-200 px-2 py-1 text-sm text-red-700 hover:bg-red-50 dark:border-red-900/50">Delete</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AiPanel({ role, token }: { role?: string | null; token?: string | null }) {
  const isAdminOrManager = role === 'admin' || role === 'manager';
  const [adminMode, setAdminMode] = useState(false);
  const [message, setMessage] = useState("What is the overtime policy for night shift?");
  const [answer, setAnswer] = useState<string | null>(null);
  const [cites, setCites] = useState<{ doc: string; score: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState<{ storedName: string; name: string; size: number; uploadedAt?: string }[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [docsError, setDocsError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const authToken = token ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!authToken) return null;
    return { Authorization: `Bearer ${authToken}` };
  };

  const loadDocs = async () => {
    try {
      setDocsError(null);
      const headers = getAuthHeaders();
      if (!headers) {
        setDocs([]);
        setDocsError("Missing authentication. Please sign in again.");
        return;
      }
      const adminModeParam = isAdminOrManager && adminMode ? '&adminMode=true' : '';
      const r = await fetch(`${API}/ai/documents?t=${Date.now()}${adminModeParam}`, {
        headers
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(j?.error || 'Failed to load documents');
      }
      setDocs(j?.files || []);
    } catch (e: any) {
      console.error('[AiPanel] loadDocs error:', e);
      setDocsError(e?.message || 'Failed to load documents');
    }
  };

  useEffect(() => {
    loadDocs();
  }, [token, adminMode]);

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadSuccess(null);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error('Missing authentication token');
      const uploadedFiles: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        if (isAdminOrManager && adminMode) {
          fd.append('adminMode', 'true');
        }
        const r = await fetch(`${API}/ai/documents/upload`, {
          method: 'POST',
          headers,
          body: fd
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j?.error || `Upload failed: ${file.name}`);
        }
        uploadedFiles.push(file.name);
      }
      setUploadSuccess(`Successfully uploaded ${uploadedFiles.length} file(s): ${uploadedFiles.join(', ')}`);
      await loadDocs();
      setTimeout(() => setUploadSuccess(null), 5000);
    } catch (e: any) {
      alert(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = async (doc: { storedName: string; name: string }) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) return;
    setDeleting(doc.storedName);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error('Missing authentication token');
      const adminModeParam = isAdminOrManager && adminMode ? '?adminMode=true' : '';
      const r = await fetch(`${API}/ai/documents/${encodeURIComponent(doc.storedName)}${adminModeParam}`, {
        method: 'DELETE',
        headers
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || 'Delete failed');
      }
      await loadDocs();
    } catch (e: any) {
      alert(e?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) {
      return <DocumentTextIcon className="h-5 w-5 text-red-500" />;
    }
    if (['doc', 'docx'].includes(ext || '')) {
      return <DocumentIcon className="h-5 w-5 text-blue-500" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
      return <TableCellsIcon className="h-5 w-5 text-green-500" />;
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) {
      return <PhotoIcon className="h-5 w-5 text-purple-500" />;
    }
    if (['txt', 'md'].includes(ext || '')) {
      return <DocumentTextIcon className="h-5 w-5 text-slate-500" />;
    }
    return <PaperClipIcon className="h-5 w-5 text-slate-400" />;
  };

  const ask = async () => {
    if (!message.trim() || busy) return;
    setBusy(true);
    setAnswer(null);
    setCites([]);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error('Missing authentication token');
      const r = await fetch(`${API}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers
        },
        body: JSON.stringify({ 
          message,
          adminMode: isAdminOrManager && adminMode ? true : false
        })
      });
      
      if (!r.ok) {
        const errorData = await r.json().catch(() => ({ error: 'Failed to get AI response' }));
        const errorMsg = errorData.error || `Server error: ${r.status}`;
        setAnswer(`Error: ${errorMsg}`);
        setCites([]);
        return;
      }
      
      const j = await r.json();
      setAnswer(j.answer || "No answer.");
      setCites(j.citations || []);
    } catch (e: any) {
      console.error('[AiPanel] Chat error:', e);
      setAnswer(`Error: ${e.message || 'Failed to get AI response. Please check if GEMINI_API_KEY is configured.'}`);
      setCites([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title="Docs & AI Assistant"
      right={
        <div className="flex items-center gap-2">
            {isAdminOrManager && (
              <>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    accept=".txt,.md,.pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg"
                    onChange={(e) => onUpload(e.target.files)}
                  />
                  {uploading ? 'Uploading…' : 'Upload files'}
                </label>
                <button
                  type="button"
                  onClick={() => setAdminMode(!adminMode)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium shadow-sm transition-all active:scale-[.98] ${
                    adminMode
                      ? 'border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-200 dark:hover:bg-amber-900/60'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title={adminMode ? "Switch to public mode" : "Switch to administrative mode (confidential files)"}
                >
                  {adminMode ? (
                    <>
                      <ShieldCheckIcon className="h-4 w-4" />
                      Admin Mode
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="h-4 w-4" />
                      Public Mode
                    </>
                  )}
                </button>
              </>
            )}
          <button type="button" onClick={ask} disabled={busy} className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 active:scale-[.98] disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600">{busy ? "Thinking…" : "Ask"}</button>
        </div>
      }
    >
      {isAdminOrManager && adminMode && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/30 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4" />
            <span className="font-medium">Administrative Mode Active</span>
          </div>
          <p className="mt-1 text-xs">You are viewing and managing confidential documents. Questions and uploads are separate from public documents.</p>
        </div>
      )}
      {uploadSuccess && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-200">
          {uploadSuccess}
        </div>
      )}
      {docsError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
          {docsError}
        </div>
      )}

      <div className="space-y-6">
        {/* AI Chat Section */}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Your question</label>
            <textarea
              className="min-h-32 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-700"
              placeholder="e.g., What is the policy for annual leave?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          {answer && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">AI Answer</label>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <p className="whitespace-pre-wrap leading-relaxed">{answer}</p>
                {cites.length > 0 && (
                  <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    <p className="font-medium mb-2 text-slate-600 dark:text-slate-300">Citations:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {cites.map((c, i) => (
                        <li key={i} className="break-words">{c.doc} <span className="text-slate-400">(Score: {c.score.toFixed(4)})</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Documents Section - Separated */}
        <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <label className="text-base font-semibold text-slate-700 dark:text-slate-200">
              Uploaded Documents <span className="text-sm font-normal text-slate-400">({docs.length})</span>
            </label>
          </div>
          
          {docs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <p>No documents uploaded yet.</p>
              {isAdminOrManager && (
                <p className="mt-2 text-xs">Click "Upload files" to add documents for AI to use.</p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 w-1/2">Document</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 whitespace-nowrap">Size</th>
                      {isAdminOrManager && (
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 whitespace-nowrap">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                    {docs.map((doc, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex-shrink-0">{getFileIcon(doc.name)}</span>
                            <span className="break-words font-medium" title={doc.name}>{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono">
                          {formatFileSize(doc.size)}
                        </td>
                        {isAdminOrManager && (
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => deleteDoc(doc)}
                              disabled={deleting === doc.storedName}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/30"
                            >
                              {deleting === doc.storedName ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                {docs.map((doc, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="flex-shrink-0 mt-0.5">{getFileIcon(doc.name)}</span>
                          <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words" title={doc.name}>
                            {doc.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-mono">
                            {formatFileSize(doc.size)}
                          </p>
                        </div>
                      </div>
                      {isAdminOrManager && (
                        <button
                          type="button"
                          onClick={() => deleteDoc(doc)}
                          disabled={deleting === doc.storedName}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-all dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/30"
                        >
                          {deleting === doc.storedName ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function App() {
  const { value: token, setValue: setToken } = useLocalStorage("token");
  const { value: role, setValue: setRole } = useLocalStorage("role");
  const { value: email, setValue: setEmail } = useLocalStorage("email");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [staff, setStaff] = useState<Staff[]>([]);
  
  const normalizedRole = role ? role.toLowerCase().trim() : null;
  // Helper to check if user is admin or manager
  const isAdmin = normalizedRole === 'admin';
  const isAdminOrManager = normalizedRole === 'admin' || normalizedRole === 'manager';

  const [route, setRoute] = useState<string>(() => window.location.pathname || "/");
  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname || "/");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  function navigate(path: string) {
    if (window.location.pathname !== path) history.pushState(null, "", path);
    setRoute(path);
  }

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const r = await fetch(`${API}/staff`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        const j = await r.json();
        setStaff(j.data || []);
      } catch (e) {
        // ignore
      }
    };
    if (token) load();
  }, [token]);

  // Strict payroll access control - redirect non-admins immediately
  useEffect(() => {
    // Read role directly from localStorage for most up-to-date value
    const currentRoleFromStorage = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    const currentRole = currentRoleFromStorage || role;
    const normalizedCurrentRole = currentRole ? String(currentRole).toLowerCase().trim() : null;
    
    // Block access to /payroll for anyone who is not admin
    if (route === '/payroll' && normalizedCurrentRole !== 'admin') {
      // Force redirect to home - managers and staff cannot access payroll
      navigate('/');
      // Also update URL directly as backup
      if (typeof window !== 'undefined' && window.location.pathname === '/payroll') {
        window.history.replaceState(null, '', '/');
      }
    }
  }, [route, role, navigate]);

  useEffect(() => {
    (window as any).__reloadStaff = async () => {
      try {
        const token = localStorage.getItem('token');
        const r = await fetch(`${API}/staff`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        const j = await r.json();
        setStaff(j.data || []);
      } catch { }
    };
    (window as any).__navigate = (p: string) => navigate(p);
    return () => {
      delete (window as any).__reloadStaff;
      delete (window as any).__navigate;
    };
  }, [token]);


  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleSignOut = () => {
    setToken(null);
    setRole(null);
    setEmail(null);
    navigate('/');
  };

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
      {token && <NavBar onToggleSidebar={toggleSidebar} navigate={navigate} onSignOut={handleSignOut} role={role} email={email} staff={staff} />}

      <div className={`mx-auto grid max-w-7xl gap-4 px-3 pb-10 pt-4 sm:px-4 ${token ? (sidebarOpen ? 'grid-cols-1 lg:grid-cols-[18rem_1fr]' : 'grid-cols-1 lg:grid-cols-[0_1fr]') : 'grid-cols-1'}`}>
        {token && <Sidebar open={sidebarOpen} onClose={closeSidebar} navigate={navigate} role={role} />}

        <main className="space-y-4">
              {!token ? (
                <div className="mt-8">
                  <LoginForm onLoggedIn={(t, r) => { 
                    setToken(t); 
                    if (r) {
                      // Normalize role to lowercase before storing
                      const normalizedRole = String(r).toLowerCase().trim();
                      setRole(normalizedRole);
                      localStorage.setItem('role', normalizedRole);
                    }
                    navigate('/'); 
                  }} />
                </div>
              ) : (
            <>
              {route === '/' && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Staff" value={String(staff.length)} hint="Across all locations" />
                    <StatCard title="Shifts Today" value="6" hint="3 locations" />
                    <StatCard title="Timesheets Pending" value="4" hint="Need approval" />
                    <StatCard title="Training Due" value="3" hint="Expiring this week" />
                  </div>

                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Overview</h2>
                    {isAdminOrManager && (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => navigate('/staff')} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300">Staff</button>
                        <button type="button" onClick={() => navigate('/staff/create')} className="rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">Create staff</button>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <StaffTable data={staff} role={role} />
                    <AiPanel role={role} token={token} />
                  </div>
                </>
              )}

              {route === '/staff' && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Staff</h2>
                    {isAdminOrManager && (
                      <button
                        type="button"
                        onClick={() => navigate('/staff/create')}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 active:scale-[.98]"
                      >
                        Create Staff
                      </button>
                    )}
                  </div>
                  <StaffTable data={staff} role={role} />
                </div>
              )}

              {isAdminOrManager && route === '/staff/create' && (
                <div>
                  <CreateStaff onDone={() => { (window as any).__reloadStaff?.(); navigate('/staff'); }} onCancel={() => navigate('/staff')} />
                </div>
              )}

              {isAdminOrManager && route.startsWith('/staff/edit/') && (
                <div>
                  {(() => {
                    const parts = route.split('/');
                    const id = parts[3] || null;
                    if (!id) return <div className="text-sm text-red-600">Invalid staff id</div>;
                    return <CreateStaff staffId={id} onDone={() => { (window as any).__reloadStaff?.(); navigate('/staff'); }} onCancel={() => navigate('/staff')} />;
                  })()}
                </div>
              )}

              {route === '/ai' && (
                <div>
                  <h2 className="text-xl font-semibold">Docs & AI</h2>
                  <AiPanel role={role} token={token} />
                </div>
              )}

              {route === '/shifts' && <Scheduling role={role} />}
              {route === '/timesheets' && <Timesheets />}
              {route === '/payroll' && (() => {
                // Read role directly from localStorage to ensure latest value
                const payrollRouteRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
                const payrollRouteNormalized = payrollRouteRole ? String(payrollRouteRole).toLowerCase().trim() : null;
                const isPayrollAdmin = payrollRouteNormalized === 'admin';
                
                // Only admins can access Payroll - managers and staff are blocked
                if (isPayrollAdmin) {
                  return <Payroll />;
                }
                return (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900/40 dark:bg-amber-900/20">
                    <h2 className="mb-2 text-lg font-semibold text-amber-800 dark:text-amber-200">Access Denied</h2>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Payroll processing is restricted to administrators only.
                    </p>
                  </div>
                );
              })()}
              {route === '/training' && <Training role={role} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}