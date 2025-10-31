import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ForgotPasswordModal from '../components/ForgotPasswordModal'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const STORAGE_KEY = 'tt:user'
  const PWD_KEY = 'tt:password'
  // Allow overriding the API base (useful when serving the frontend without Vite
  // dev proxy). Set VITE_API_BASE to e.g. http://localhost:4000 to point at the
  // backend when needed. Defaults to '/api' which works with the Vite proxy or
  // when the frontend is served from the same origin as the backend.
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
    ? import.meta.env.VITE_API_BASE
    : '/api'

  const submit = e => {
    e.preventDefault()
    const next = {}
    if (!email.trim()) next.email = 'Email is required'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = 'Enter a valid email'
    if (!password) next.password = 'Password is required'

    setErrors(next)
    if (Object.keys(next).length === 0) {
      // Try backend login first
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      }).then(async res => {
        if (res.ok) {
          try { localStorage.setItem('tt:auth', '1') } catch {}
          window.dispatchEvent(new Event('authChanged'))
          navigate('/')
        } else {
          const body = await res.json().catch(()=>({ error: 'Login failed' }))
          console.warn('Login failed response', body)
          setErrors({ general: body.error || 'Login failed' })
        }
      }).catch(err => {
        console.warn('Login request error', err)
        // fallback to localStorage-based demo auth if backend unreachable
        let storedUser = null
        try { storedUser = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { storedUser = null }
        const storedPwd = (() => { try { return localStorage.getItem(PWD_KEY) || '' } catch { return '' } })()
        if (!storedUser) {
          setErrors({ general: 'No account found. Please sign up first.' })
          return
        }
        if ((storedUser.email || '').toLowerCase() !== (email || '').toLowerCase()) {
          setErrors({ email: 'Email does not match any account' })
          return
        }
        if (password !== storedPwd) {
          setErrors({ password: 'Incorrect password' })
          return
        }
        try { localStorage.setItem('tt:auth', '1') } catch {}
        window.dispatchEvent(new Event('authChanged'))
        navigate('/')
      })
    }
  }

  const [forgotOpen, setForgotOpen] = React.useState(false)

  return (
    <div className="auth-page">
      <div className="auth-card" role="main" aria-labelledby="login-title">
        <div className="auth-header">
          <div className="auth-emoji">✨</div>
          <h2 id="login-title">Welcome back</h2>
          <p className="muted small">Sign in to start tracking</p>

          <div className="auth-tabs" role="tablist" aria-label="Authentication">
            <button className="tab active" aria-selected="true">Login</button>
            <button className="tab" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>

        <form onSubmit={submit} noValidate>
          {errors.general && <div className="error-text" style={{marginBottom:8}}>{errors.general}</div>}
          <label>
            Email
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e=>{ setEmail(e.target.value); setErrors(err=>({ ...err, email: '' })) }}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </label>

          <label>
            Password
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e=>{ setPassword(e.target.value); setErrors(err=>({ ...err, password: '' })) }}
                className={errors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <div className="error-text">{errors.password}</div>}
          </label>

          <label className="row" style={{marginTop:6}}>
            <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
            <span className="muted">Remember me</span>
          </label>

          <div className="auth-actions" style={{marginTop:8}}>
            <button className="btn primary large" type="submit">Login</button>
            <button type="button" className="link" style={{alignSelf:'center',background:'transparent',border:'none',padding:0,cursor:'pointer'}} onClick={() => setForgotOpen(true)}>Forgot password?</button>
          </div>
        </form>

        <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />

        <p className="muted" style={{marginTop:14}}>🔒 Your data is secure and encrypted</p>
      </div>
    </div>
  )
}
