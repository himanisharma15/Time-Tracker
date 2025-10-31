import React from 'react'

export default function SummaryCard({ title, value, icon }) {
  return (
    <div className="summary-card">
      <div className="card-icon">{icon}</div>
      <div className="card-body">
        <div className="card-title">{title}</div>
        <div className="card-value">{value}</div>
      </div>
    </div>
  )
}
