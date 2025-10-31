import React, { useEffect, useState } from 'react'

const PWD_KEY = 'tt:password'

export default function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [msg, setMsg] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!open) setForm({ current: '', next: '', confirm: '' })
    setMsg('')
  }, [open])

  if (!open) return null

  const change = e => setForm({ ...form, [e.target.name]: e.target.value })

  const save = () => {
    // load stored password (plain text demo) and validate
    try {
      const stored = localStorage.getItem(PWD_KEY) || ''
      if (stored && form.current !== stored) return setMsg('Current password is incorrect')
    } catch {}
    if (!form.next || form.next.length < 6) return setMsg('New password must be at least 6 characters')
    if (form.next !== form.confirm) return setMsg('Passwords do not match')

    try { localStorage.setItem(PWD_KEY, form.next) } catch {}
    setMsg('Password updated')
    setTimeout(() => { setMsg(''); onClose() }, 900)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Change Password</h3>
        {msg && <div style={{color:'var(--muted)',marginBottom:8}}>{msg}</div>}
        
        <label>
          Current Password
          <div className="password-wrapper">
            <input name="current" type={showCurrent ? 'text' : 'password'} value={form.current} onChange={change} />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowCurrent(!showCurrent)}
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </label>
        
        <label>
          New Password
          <div className="password-wrapper">
            <input name="next" type={showNext ? 'text' : 'password'} value={form.next} onChange={change} />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowNext(!showNext)}
              aria-label={showNext ? 'Hide password' : 'Show password'}
            >
              {showNext ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </label>
        
        <label>
          Confirm Password
          <div className="password-wrapper">
            <input name="confirm" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={change} />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </label>
        
        <div className="modal-actions">
          <button className="btn primary" onClick={save}>Save</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
