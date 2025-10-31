import React, { useEffect, useState } from 'react'

export default function ProfileModal({ open, onClose, onSave, initial = {} }) {
  const [form, setForm] = useState({ name: '', email: '', account: 'Personal' })
  const [error, setError] = useState('')

  useEffect(() => {
    setForm({ name: initial.name || '', email: initial.email || '', account: initial.account || 'Personal' })
    setError('')
  }, [initial, open])

  if (!open) return null

  const change = e => setForm({ ...form, [e.target.name]: e.target.value })

  const save = () => {
    // simple validation
    if (!form.name.trim()) return setError('Name is required')
    if (!form.email.includes('@')) return setError('Enter a valid email')
    setError('')
    // pass updated profile up
    onSave(form)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Update Profile</h3>
        {error && <div style={{color:'var(--teal-500)',marginBottom:8}}>{error}</div>}
        <label>Name<input name="name" value={form.name} onChange={change} /></label>
        <label>Email<input name="email" value={form.email} onChange={change} /></label>
        <label>Account Type
          <select name="account" value={form.account} onChange={change}>
            <option>Personal</option>
            <option>Team</option>
          </select>
        </label>
        <div className="modal-actions">
          <button className="btn primary" onClick={save}>Save</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
