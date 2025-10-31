import React, { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

type Staff = { id: string; firstName: string; lastName: string; email: string; department?: string; location?: string }

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [staff, setStaff] = useState<Staff[]>([])
  const [message, setMessage] = useState('What is the overtime policy for night shift?')
  const [ai, setAi] = useState<any>(null)

  const login = async () => {
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const j = await r.json()
    if (j.token) setToken(j.token)
  }

  useEffect(() => {
    if (!token) return
    fetch(`${API}/staff`).then(r => r.json()).then(j => setStaff(j.data || []))
  }, [token])

  const ask = async () => {
    const r = await fetch(`${API}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    const j = await r.json()
    setAi(j)
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <h1>Staff Platform (Starter)</h1>

      {!token ? (
        <div style={{ marginBottom: 24 }}>
          <h2>Login</h2>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder='email' />
          <input type='password' value={password} onChange={e => setPassword(e.target.value)} placeholder='password' />
          <button onClick={login}>Login</button>
          <p style={{ color: '#666' }}>Seed user: admin@example.com / admin123</p>
        </div>
      ) : (
        <div>
          <h2>Staff</h2>
          <ul>
            {staff.map(s => (
              <li key={s.id}>{s.firstName} {s.lastName} — {s.email} ({s.department || 'N/A'})</li>
            ))}
          </ul>

          <h2 style={{ marginTop: 24 }}>AI over Policies</h2>
          <textarea value={message} onChange={e => setMessage(e.target.value)} style={{ width: '100%', height: 100 }} />
          <div>
            <button onClick={ask}>Ask</button>
          </div>
          {ai && (
            <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #ddd', padding: 12, marginTop: 12 }}>
              <strong>Answer</strong>
              <div>{ai.answer}</div>
              <div><strong>Citations:</strong> {ai.citations?.map((c:any) => `${c.doc} (${c.score})`).join(', ')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}