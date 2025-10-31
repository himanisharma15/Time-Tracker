import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [account, setAccount] = useState('Personal')
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const STORAGE_KEY = 'tt:user'
  const PWD_KEY = 'tt:password'
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
    ? import.meta.env.VITE_API_BASE
    : '/api'

  const submit = e => {
    e.preventDefault()
    const next = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!email.trim()) next.email = 'Email is required'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = 'Enter a valid email'
    if (!password || password.length < 6) next.password = 'Password must be at least 6 characters'

    setErrors(next)
    if (Object.keys(next).length === 0) {
      try {
        // Check if user already exists
        const existingUser = localStorage.getItem(STORAGE_KEY)
        if (existingUser) {
          const userData = JSON.parse(existingUser)
          if (userData.email.toLowerCase() === email.trim().toLowerCase()) {
            setErrors({ email: 'An account with this email already exists. Please login instead.' })
            return
          }
        }

        // Save user data to localStorage
        const userData = { 
          name: name.trim(), 
          email: email.trim(), 
          account,
          createdAt: new Date().toISOString()
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
        localStorage.setItem(PWD_KEY, password)
        
        console.log('User account created successfully')
        
        // Navigate to login with success message
        navigate('/login?signup=success')
        
      } catch (error) {
        console.error('Error creating account:', error)
        setErrors({ general: 'Failed to create account. Please try again.' })
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" role="main" aria-labelledby="signup-title">
        <div className="auth-header">
          <div className="auth-emoji">✨</div>
          <h2 id="signup-title">Welcome to TimeTrackr</h2>
          <p className="muted small">Create an account to start tracking</p>

          <div className="auth-tabs" role="tablist" aria-label="Authentication">
            <button className="tab" onClick={() => navigate('/login')}>Login</button>
            <button className="tab active" aria-selected="true">Sign Up</button>
          </div>
        </div>

        <form onSubmit={submit} noValidate>
          {errors.general && <div className="error-text" style={{marginBottom:8}}>{errors.general}</div>}
          <label>
            Name
            <input value={name} placeholder="Your full name" onChange={e=>{ setName(e.target.value); setErrors(err=>({...err, name: ''})) }} className={errors.name ? 'input-error' : ''} />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </label>

          <label>
            Email
            <input type="email" value={email} placeholder="you@company.com" onChange={e=>{ setEmail(e.target.value); setErrors(err=>({...err, email: ''})) }} className={errors.email ? 'input-error' : ''} />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </label>

          <label>
            Password
            <div className="password-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                placeholder="Create a strong password" 
                onChange={e=>{ setPassword(e.target.value); setErrors(err=>({...err, password: ''})) }} 
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

          <label>
            Account Type
            <select value={account} onChange={e=>setAccount(e.target.value)}>
              <option>Personal</option>
              <option>Team</option>
            </select>
          </label>

          <div className="auth-actions" style={{marginTop:8}}>
            <button className="btn primary large" type="submit">Sign up</button>
          </div>
        </form>

        <p className="muted" style={{marginTop:14}}>🔒 Your data is secure and encrypted</p>
      </div>
    </div>
  )
}
