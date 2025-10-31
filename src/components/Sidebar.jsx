import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

export default function Sidebar({ open = true }) {
  const navigate = useNavigate()

  const handleLogout = e => {
    e.preventDefault()
    // Clear placeholder auth state if any (localStorage key examples)
    try { localStorage.removeItem('tt:auth') } catch {}
    // Navigate to login page
    navigate('/login')
  }

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
      <nav>
        <ul>
          <li><NavLink to="/" end>🏠 Dashboard</NavLink></li>
          <li><NavLink to="/tasks">🗒️ Tasks</NavLink></li>
          <li><NavLink to="/reports">📊 Reports</NavLink></li>
          <li><NavLink to="/profile">👤 Profile</NavLink></li>
          {/* Logout removed from sidebar per request */}
        </ul>
      </nav>
    </aside>
  )
}
