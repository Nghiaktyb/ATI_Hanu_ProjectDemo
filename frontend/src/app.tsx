import React, { useEffect, useMemo, useState } from "react";
import CreateStaff from './CreateStaff';

/**
 * Redesigned responsive UI (single-file) using Tailwind CSS
 * --------------------------------------------------------
 * - Mobile-first, responsive layout with top nav + collapsible sidebar
 * - Dashboard cards, Staff table with search, AI panel with sticky action bar
 * - Elegant forms and states; dark-mode ready via class
 *
 * ⚠️ Requires Tailwind setup (see chat for exact commands)
 *   - index.css must include tailwind directives
 *   - VITE_API_URL should point to your backend
 */

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  location?: string;
};

function useLocalStorage(key: string) {
  const [value, setValue] = useState<string | null>(() => localStorage.getItem(key));
  useEffect(() => {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }, [key, value]);
  return { value, setValue } as const;
}

function NavBar({ onToggleSidebar, navigate }: { onToggleSidebar: () => void; navigate: (p: string) => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2">
            <button
            aria-label="Toggle sidebar"
              type="button"
            onClick={onToggleSidebar}
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
        </div>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
    >
      {dark ? (
        <>
          <span className="i">🌙</span>
          Dark
        </>
      ) : (
        <>
          <span className="i">☀️</span>
          Light
        </>
      )}
    </button>
  );
}

function Sidebar({ open, onClose, navigate }: { open: boolean; onClose: () => void; navigate: (p: string) => void }) {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/30 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
        <aside
        className={`fixed z-40 h-[calc(100dvh-56px)] w-72 translate-x-0 overflow-y-auto border-r border-slate-200 bg-white p-4 transition-transform duration-200 ease-out dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <nav className="space-y-1">
          {[
            { label: "Dashboard", icon: "📊", path: "/" },
            { label: "Staff", icon: "👥", path: "/staff" },
            { label: "Scheduling", icon: "📅", path: "/shifts" },
            { label: "Timesheets", icon: "⏱️", path: "/timesheets" },
            { label: "Payroll", icon: "💵", path: "/payroll" },
            { label: "Training", icon: "🎓", path: "/training" },
            { label: "Docs & AI", icon: "🧠", path: "/ai" },
          ].map((it) => (
              <button
                type="button"
              key={it.label}
              onClick={() => {
                navigate(it.path);
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span>{it.icon}</span>
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

function LoginForm({ onLoggedIn }: { onLoggedIn: (t: string) => void }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      onLoggedIn(j.token);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

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
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
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
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">Demo: admin@example.com / admin123</p>
      </div>
    </div>
  );
}

function StaffTable({ data }: { data: Staff[] }) {
  // props updated via patch below
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return data;
    return data.filter((s) =>
      [s.firstName, s.lastName, s.email, s.department, s.location].some((v) => (v || "").toLowerCase().includes(qq))
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
              {[
                  "Name",
                  "Email",
                  "Department",
                  "Location",
                  "",
                ].map((h, idx) => (
                  <th key={`${h}-${idx}`} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
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
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{s.location || "—"}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => (window as any).__navigate?.(`/staff/edit/${s.id}`)} className="rounded-xl border border-slate-200 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300">Edit</button>
                    <button type="button" onClick={async () => {
                      if (!confirm('Delete staff?')) return;
                      const token = localStorage.getItem('token');
                      const r = await fetch(`${API}/staff/${s.id}`, { method: 'DELETE', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
                      if (r.ok) {
                        // trigger a global reload helper that App sets
                        (window as any).__reloadStaff?.();
                      } else {
                        const j = await r.json().catch(() => ({}));
                        alert(j?.error || 'Delete failed');
                      }
                    }} className="rounded-xl border border-red-200 px-2 py-1 text-sm text-red-700 hover:bg-red-50 dark:border-red-900/50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AiPanel() {
  const [message, setMessage] = useState("What is the overtime policy for night shift?");
  const [answer, setAnswer] = useState<string | null>(null);
  const [cites, setCites] = useState<{ doc: string; score: number }[]>([]);
  const [busy, setBusy] = useState(false);

  const ask = async () => {
    setBusy(true); setAnswer(null);
    try {
      const r = await fetch(`${API}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const j = await r.json();
      setAnswer(j.answer || "No answer.");
      setCites(j.citations || []);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title="Docs & AI Assistant"
      right={<button type="button" onClick={ask} disabled={busy} className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 active:scale-[.98] disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600">{busy ? "Thinking…" : "Ask"}</button>}
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-600 dark:text-slate-300">Your question</label>
          <textarea
            className="min-h-[120px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">AI answers are grounded in your uploaded policies (.txt/.md).</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-600 dark:text-slate-300">Answer</label>
          <div className="min-h-[120px] whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
            {answer ?? "Ask a question to see results here."}
          </div>
          {cites.length > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">Citations:</span> {cites.map((c) => `${c.doc} (${c.score})`).join(", ")}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function App() {
  const { value: token, setValue: setToken } = useLocalStorage("token");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);

  // client-side router using History API (keeps things dependency-free)
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
        const r = await fetch(`${API}/staff`);
        const j = await r.json();
        setStaff(j.data || []);
      } catch (e) {
        // ignore
      }
    };
    if (token) load();
  }, [token]);

  // expose a small global helper so child components (table rows) can trigger reloads without prop drilling
  useEffect(() => {
    (window as any).__reloadStaff = async () => {
      try {
        const r = await fetch(`${API}/staff`);
        const j = await r.json();
        setStaff(j.data || []);
      } catch { }
    };
    // navigate helper used by StaffTable edit buttons
    (window as any).__navigate = (p: string) => navigate(p);
    return () => {
      delete (window as any).__reloadStaff;
      delete (window as any).__navigate;
    };
  }, [token]);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
      <NavBar onToggleSidebar={() => setSidebarOpen((v) => !v)} navigate={navigate} />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-3 pb-10 pt-4 sm:px-4 lg:grid-cols-[18rem_1fr]">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} navigate={navigate} />

        {/* Main */}
        <main className="space-y-4">
          {!token ? (
            <div className="mt-8">
              <LoginForm onLoggedIn={(t) => { setToken(t); navigate('/'); }} />
            </div>
          ) : (
            <>
              {route === '/' && (
                <>
                  {/* Stat Cards */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Staff" value={String(staff.length)} hint="Across all locations" />
                    <StatCard title="Shifts Today" value="6" hint="3 locations" />
                    <StatCard title="Timesheets Pending" value="4" hint="Need approval" />
                    <StatCard title="Training Due" value="3" hint="Expiring this week" />
                  </div>

                  {/* Staff & AI Panels */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Overview</h2>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => navigate('/staff')} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300">Staff</button>
                      <button type="button" onClick={() => navigate('/staff/create')} className="rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">Create staff</button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <StaffTable data={staff} />
                    <AiPanel />
                  </div>
                </>
              )}

              {route === '/staff' && (
                <div>
                  <h2 className="text-xl font-semibold">Staff</h2>
                  <StaffTable data={staff} />
                </div>
              )}

              {route === '/staff/create' && (
                <div>
                  <CreateStaff onDone={() => { (window as any).__reloadStaff?.(); navigate('/staff'); }} onCancel={() => navigate('/staff')} />
                </div>
              )}

              {route.startsWith('/staff/edit/') && (
                <div>
                  {/* route format: /staff/edit/:id */}
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
                  <AiPanel />
                </div>
              )}

              {route === '/shifts' && (
                <div>
                  <h2 className="text-xl font-semibold">Shifts / Scheduling</h2>
                  <Card title="Shifts"> <div className="text-sm text-slate-600">Shifts UI coming soon — API: /shifts</div> </Card>
                </div>
              )}

              {route === '/payroll' && (
                <div>
                  <h2 className="text-xl font-semibold">Payroll</h2>
                  <Card title="Payroll"> <div className="text-sm text-slate-600">Payroll UI coming soon — API: /payroll</div> </Card>
                </div>
              )}

              {route === '/timesheets' && (
                <div>
                  <h2 className="text-xl font-semibold">Timesheets</h2>
                  <Card title="Timesheets"> <div className="text-sm text-slate-600">Timesheets UI coming soon — API: /shifts/timesheets</div> </Card>
                </div>
              )}

              {route === '/training' && (
                <div>
                  <h2 className="text-xl font-semibold">Training</h2>
                  <Card title="Training"> <div className="text-sm text-slate-600">Training page placeholder</div> </Card>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
