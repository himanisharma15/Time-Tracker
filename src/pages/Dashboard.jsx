import React, { useState, useEffect } from 'react'
import SummaryCard from '../components/SummaryCard'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalTasks: 0,
    timeTrackedToday: '0m',
    productivity: '0%',
    activeSessions: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [insights, setInsights] = useState({
    completedThisWeek: 0,
    avgDailyTime: '0h',
    productivityChange: 0
  })
  const [loading, setLoading] = useState(true)

  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
    ? import.meta.env.VITE_API_BASE
    : '/api'

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  // Helper function to format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    const days = Math.floor(hours / 24)
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }

  const fetchDashboardStats = () => {
    try {
      // Get tasks from localStorage
      const storedTasks = localStorage.getItem('tt:tasks')
      const tasks = storedTasks ? JSON.parse(storedTasks) : []
        
        // Calculate stats
        const totalTasks = tasks.length
        const activeSessions = tasks.filter(t => t.running).length
        
        // Calculate time tracked today (sum all task seconds)
        const totalSecondsToday = tasks.reduce((sum, task) => {
          // For demo, we'll sum all task times. In production, filter by today's date
          return sum + (task.seconds || 0)
        }, 0)
        
        const hours = Math.floor(totalSecondsToday / 3600)
        const mins = Math.floor((totalSecondsToday % 3600) / 60)
        const timeTrackedToday = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
        
        // Calculate productivity (completed tasks / total tasks)
        const completedTasks = tasks.filter(t => 
          t.status === 'Completed' || t.status === 'Done' || t.status === 'completed'
        ).length
        const productivity = totalTasks > 0 
          ? `${Math.round((completedTasks / totalTasks) * 100)}%` 
          : '0%'
        
        setStats({
          totalTasks,
          timeTrackedToday,
          productivity,
          activeSessions
        })

        // Build recent activity from tasks (last 3 tasks with updates)
        const activity = []
        
        // Add completed tasks
        const completed = tasks.filter(t => 
          t.status === 'Completed' || t.status === 'Done' || t.status === 'completed'
        ).slice(0, 1)
        completed.forEach(t => {
          activity.push({
            type: 'completed',
            icon: '✓',
            title: `Completed "${t.name}"`,
            time: timeAgo(t.updatedAt || t.createdAt)
          })
        })
        
        // Add running tasks
        const running = tasks.filter(t => t.running).slice(0, 1)
        running.forEach(t => {
          activity.push({
            type: 'running',
            icon: '▶',
            title: `Working on "${t.name}"`,
            time: 'Currently active'
          })
        })
        
        // Add paused tasks (not running but not completed)
        const paused = tasks.filter(t => 
          !t.running && 
          t.status !== 'Completed' && 
          t.status !== 'Done' && 
          t.status !== 'completed' &&
          (t.seconds || 0) > 0
        ).slice(0, 1)
        paused.forEach(t => {
          activity.push({
            type: 'paused',
            icon: '⏸',
            title: `Paused "${t.name}"`,
            time: timeAgo(t.updatedAt || t.createdAt)
          })
        })

        // If no activity, add a placeholder
        if (activity.length === 0) {
          activity.push({
            type: 'info',
            icon: '📝',
            title: 'No recent activity',
            time: 'Start tracking to see activity'
          })
        }

        setRecentActivity(activity)

        // Calculate insights
        const completedThisWeek = completedTasks // Simplified - count all completed
        const avgDailyHours = totalSecondsToday > 0 
          ? Math.round((totalSecondsToday / 3600) * 10) / 10 
          : 0
        const avgDailyTime = avgDailyHours > 0 ? `${avgDailyHours}h` : '0h'
        
        // Calculate productivity change (simplified)
        const productivityChange = completedTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        setInsights({
          completedThisWeek,
          avgDailyTime,
          productivityChange
        })
        
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page dashboard">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome back! 👋</h1>
          <p className="welcome-subtitle">Here's what's happening with your time tracking today</p>
        </div>
        <button
          className="btn primary quick-start-btn"
          onClick={() => navigate('/tasks', { state: { quickStart: true } })}
        >
          <span className="btn-icon">⚡</span>
          Start Quick Session
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4 stats-grid">
        <SummaryCard title="Total Tasks" value={loading ? '...' : stats.totalTasks} icon="🗂️" />
        <SummaryCard title="Time Tracked Today" value={loading ? '...' : stats.timeTrackedToday} icon="⏱️" />
        <SummaryCard title="Productivity" value={loading ? '...' : stats.productivity} icon="📈" />
        <SummaryCard title="Active Sessions" value={loading ? '...' : stats.activeSessions} icon="⚡" />
      </div>

      {/* Recent Activity & Quick Insights */}
      <div className="grid grid-2">
        <section className="panel activity-panel">
          <div className="panel-header">
            <h3>📊 Recent Activity</h3>
            <span className="badge">Live</span>
          </div>
          <div className="activity-list">
            {loading ? (
              <div className="activity-item">
                <div className="activity-details">
                  <p className="activity-title">Loading...</p>
                </div>
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>{activity.icon}</div>
                  <div className="activity-details">
                    <p className="activity-title">{activity.title}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="activity-item">
                <div className="activity-icon info">📝</div>
                <div className="activity-details">
                  <p className="activity-title">No recent activity</p>
                  <span className="activity-time">Start tracking to see activity</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="panel insights-panel">
          <div className="panel-header">
            <h3>💡 Quick Insights</h3>
          </div>
          <div className="insights-list">
            <div className="insight-item">
              <div className="insight-stat">
                {loading ? '...' : `${insights.productivityChange > 0 ? '+' : ''}${insights.productivityChange}%`}
              </div>
              <p className="insight-text">Productivity rate</p>
            </div>
            <div className="insight-item">
              <div className="insight-stat">{loading ? '...' : insights.avgDailyTime}</div>
              <p className="insight-text">Average daily tracking time</p>
            </div>
            <div className="insight-item">
              <div className="insight-stat">{loading ? '...' : insights.completedThisWeek}</div>
              <p className="insight-text">Tasks completed</p>
            </div>
          </div>
          <button className="btn ghost view-reports-btn" onClick={() => navigate('/reports')}>
            View Full Reports →
          </button>
        </section>
      </div>
    </div>
  )
}

