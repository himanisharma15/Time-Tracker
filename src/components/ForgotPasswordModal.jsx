import React, { useEffect, useState } from 'react'

const STORAGE_KEY = 'tt:user'
const PWD_KEY = 'tt:password'

export default function ForgotPasswordModal({ open, onClose }) {
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!open) setForm({ email: '', password: '', confirm: '' })
    setMsg('')
  }, [open])

  if (!open) return null

  const change = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = () => {
    const next = {}
    if (!form.email.trim()) return setMsg('Email is required')
    if (!form.password || form.password.length < 6) return setMsg('Password must be at least 6 characters')
    if (form.password !== form.confirm) return setMsg('Passwords do not match')

    // validate stored user exists and email matches
    let stored = null
    try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { stored = null }
    if (!stored) return setMsg('No account found locally. Please sign up first.')
    if ((stored.email || '').toLowerCase() !== (form.email || '').toLowerCase()) return setMsg('Email does not match any account')

    try { localStorage.setItem(PWD_KEY, form.password) } catch {}
    setMsg('Password updated')
    setTimeout(() => { setMsg(''); onClose() }, 900)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Reset Password</h3>
        {msg && <div style={{color:'var(--muted)',marginBottom:8}}>{msg}</div>}
        <label>Email<input name="email" type="email" value={form.email} onChange={change} /></label>
        <label>New Password<input name="password" type="password" value={form.password} onChange={change} /></label>
        <label>Confirm Password<input name="confirm" type="password" value={form.confirm} onChange={change} /></label>
        <div className="modal-actions">
          <button className="btn primary" onClick={submit}>Reset</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
