import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ onToggleSidebar }) {
  const { theme, toggle } = useContext(ThemeContext)
  const [now, setNow] = useState(new Date())
  const navigate = useNavigate()
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    const read = () => {
      try { setSignedIn(!!localStorage.getItem('tt:auth')) } catch { setSignedIn(false) }
    }
    read()
    // update when other parts change auth state
    window.addEventListener('authChanged', read)
    window.addEventListener('storage', read)
    return () => {
      window.removeEventListener('authChanged', read)
      window.removeEventListener('storage', read)
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="navbar">
      <button className="hamburger" onClick={onToggleSidebar}>☰</button>
      <div className="navbar-left">
        <h1 className="brand">TimeTrackr</h1>
      </div>
      <div className="navbar-right">
        <div className="datetime">{now.toLocaleString()}</div>
        <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        {!signedIn ? (
          <button className="btn" onClick={() => navigate('/login')}>Sign In</button>
        ) : (
          <>
            <div className="avatar" onClick={() => navigate('/profile')} style={{cursor:'pointer'}}>JD</div>
            <button className="btn ghost" onClick={() => {
              try { localStorage.removeItem('tt:auth') } catch {}
              window.dispatchEvent(new Event('authChanged'))
              navigate('/login')
            }} style={{marginLeft:8}}>Logout</button>
          </>
        )}
      </div>
    </header>
  )
}
