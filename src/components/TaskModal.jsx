import React, { useEffect, useState } from 'react'

export default function TaskModal({ open, onClose, onSave, initial = {} }) {
  const [form, setForm] = useState({
    name: '',
    project: '',
    description: '',
    estimate: '',
    priority: 'Normal',
    ...initial,
  })

  useEffect(() => setForm(f => ({ ...f, ...initial })), [initial])

  if (!open) return null

  const change = e => setForm({ ...form, [e.target.name]: e.target.value })

  const save = () => {
    onSave(form)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{initial.id ? 'Edit Task' : 'Add Task'}</h3>
        <label>Task Name<input name="name" value={form.name} onChange={change} /></label>
        <label>Project<input name="project" value={form.project} onChange={change} /></label>
        <label>Description<textarea name="description" value={form.description} onChange={change} /></label>
        <label>Estimate<input name="estimate" value={form.estimate} onChange={change} /></label>
        <label>Priority
          <select name="priority" value={form.priority} onChange={change}>
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
          </select>
        </label>
        <div className="modal-actions">
          <button className="btn" onClick={save}>Save</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
