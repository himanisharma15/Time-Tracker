import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import { useState } from 'react'

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  return (
    <div className="app-root">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(s => !s)} />
      <div className="main-area">
        <Navbar onToggleSidebar={() => setSidebarOpen(s => !s)} />
        <div className="content">{children}</div>
      </div>
    </div>
  )
}

export default function App() {
  const RequireAuth = ({ children }) => {
    const authed = !!(typeof window !== 'undefined' && window.localStorage && localStorage.getItem('tt:auth'))
    return authed ? children : <Navigate to="/login" replace />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/" element={<RequireAuth><Layout><Dashboard /></Layout></RequireAuth>} />
      <Route path="/tasks" element={<RequireAuth><Layout><Tasks /></Layout></RequireAuth>} />
      <Route path="/reports" element={<RequireAuth><Layout><Reports /></Layout></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Layout><Profile /></Layout></RequireAuth>} />

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
