import React, { useMemo, useState } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend } from 'chart.js'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

export default function Reports() {
  const [range, setRange] = useState('week')

  const labels = useMemo(() => {
    if (range === 'day') return ['6am','9am','12pm','3pm','6pm','9pm']
    if (range === 'month') return Array.from({length:30}, (_,i)=>`Day ${i+1}`)
    return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  }, [range])

  const lineData = useMemo(()=>({
    labels,
    datasets:[{
      label:'Tracked Time (minutes)',
      data:labels.map(()=>Math.floor(Math.random()*180 + 60)),
      backgroundColor:'rgba(99, 102, 241, 0.1)',
      borderColor:'rgba(99, 102, 241, 1)',
      borderWidth: 3,
      tension:0.4,
      fill: true,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }]
  }),[labels])

  const barData = useMemo(()=>({
    labels: ['Frontend', 'Backend', 'Design', 'Meetings', 'Documentation'],
    datasets:[{
      label:'Hours Tracked',
      data:[12, 19, 8, 15, 6],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderRadius: 8,
      borderWidth: 0
    }]
  }),[])

  // Export data as CSV
  const handleExport = () => {
    // Prepare data for export
    const projectData = [
      { project: 'Frontend', hours: 12, percentage: 60 },
      { project: 'Backend', hours: 19, percentage: 48 },
      { project: 'Design', hours: 8, percentage: 32 },
      { project: 'Meetings', hours: 15, percentage: 25 },
      { project: 'Documentation', hours: 6, percentage: 12 }
    ]

    // Create CSV content
    const csvHeader = 'Project,Hours,Percentage\n'
    const csvRows = projectData.map(item => 
      `${item.project},${item.hours},${item.percentage}%`
    ).join('\n')
    const csvContent = csvHeader + csvRows

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `time-tracker-report-${range}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="page reports">
      <div className="panel reports-header">
        <div>
          <h2>📈 Analytics & Reports</h2>
          <p className="reports-subtitle">Track your productivity and time allocation</p>
        </div>
        <div className="filters">
          <select value={range} onChange={e=>setRange(e.target.value)} className="filter-select">
            <option value="day">📅 Daily</option>
            <option value="week">📊 Weekly</option>
            <option value="month">📆 Monthly</option>
          </select>
          <button className="btn ghost export-btn" onClick={handleExport}>
            <span>📥</span> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-3 report-stats">
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <div className="stat-value">42.5h</div>
            <div className="stat-label">Total This Week</div>
            <div className="stat-change positive">+12% from last week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-value">8/10</div>
            <div className="stat-label">Goals Achieved</div>
            <div className="stat-change positive">+2 from last week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <div className="stat-value">6.8h</div>
            <div className="stat-label">Daily Average</div>
            <div className="stat-change neutral">Same as last week</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-2 charts-grid">
        <div className="panel chart-panel">
          <div className="chart-header">
            <h3>📉 Time Tracking Trend</h3>
            <span className="chart-badge">{range === 'day' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}</span>
          </div>
          <div className="chart-wrapper">
            <Line data={lineData} options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { display: false },
                tooltip: { 
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  padding: 12,
                  borderRadius: 8
                }
              },
              scales: {
                y: { 
                  beginAtZero: true,
                  grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                  grid: { display: false }
                }
              }
            }} />
          </div>
        </div>
        
        <div className="panel chart-panel">
          <div className="chart-header">
            <h3>📊 Top Projects</h3>
            <span className="chart-badge">By Hours</span>
          </div>
          <div className="chart-wrapper">
            <Bar data={barData} options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { display: false },
                tooltip: { 
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  padding: 12,
                  borderRadius: 8
                }
              },
              scales: {
                y: { 
                  beginAtZero: true,
                  grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                  grid: { display: false }
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Project Breakdown */}
      <div className="panel project-breakdown">
        <h3>🗂️ Project Time Breakdown</h3>
        <div className="breakdown-list">
          <div className="breakdown-item">
            <div className="breakdown-bar" style={{width: '60%', background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.8), rgba(99, 102, 241, 0.4))'}}></div>
            <span className="breakdown-label">Frontend Development</span>
            <span className="breakdown-hours">12.0h (60%)</span>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-bar" style={{width: '48%', background: 'linear-gradient(90deg, rgba(20, 184, 166, 0.8), rgba(20, 184, 166, 0.4))'}}></div>
            <span className="breakdown-label">Backend API</span>
            <span className="breakdown-hours">9.5h (48%)</span>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-bar" style={{width: '32%', background: 'linear-gradient(90deg, rgba(251, 146, 60, 0.8), rgba(251, 146, 60, 0.4))'}}></div>
            <span className="breakdown-label">Design & UX</span>
            <span className="breakdown-hours">6.5h (32%)</span>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-bar" style={{width: '25%', background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.8), rgba(236, 72, 153, 0.4))'}}></div>
            <span className="breakdown-label">Meetings</span>
            <span className="breakdown-hours">5.0h (25%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

