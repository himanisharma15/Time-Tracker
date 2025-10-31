import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const nav = useNavigate()
  return (
    <div className="notfound">
      <div className="notfound-card">
        <h1>404</h1>
        <p>Page not found.</p>
        <div>
          <button className="btn" onClick={() => nav('/')}>Go Home</button>
        </div>
      </div>
    </div>
  )
}
