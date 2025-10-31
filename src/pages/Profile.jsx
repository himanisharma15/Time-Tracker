import React, { useEffect, useState } from 'react'
import ProfileModal from '../components/ProfileModal'
import ChangePasswordModal from '../components/ChangePasswordModal'

const STORAGE_KEY = 'tt:user'

export default function Profile() {
  const [user, setUser] = useState({ name: 'Jane Doe', email: 'jane@example.com', account: 'Personal' })
  const [modalOpen, setModalOpen] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  const save = updated => {
    setUser(updated)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch {}
  }

  const initials = (user.name || 'Jane Doe').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() || 'JD'

  return (
    <div className="page profile">
      {/* Profile Header Card */}
      <div className="panel profile-header-card">
        <div className="profile-cover">
          <div className="cover-gradient"></div>
        </div>
        <div className="profile-main">
          <div className="profile-avatar-section">
            <div className="avatar-large profile-avatar">{initials}</div>
            <div className="profile-status">
              <span className="status-dot active"></span>
              <span className="status-text">Active</span>
            </div>
          </div>
          <div className="profile-info-section">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-badges">
              <span className="badge account-badge">{user.account} Account</span>
              <span className="badge verified-badge">✓ Verified</span>
            </div>
          </div>
          <div className="profile-actions-section">
            <button className="btn primary" onClick={() => setModalOpen(true)}>
              <span>✏️</span> Edit Profile
            </button>
            <button className="btn ghost" onClick={() => setPwdOpen(true)}>
              <span>🔒</span> Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-3">
        <div className="panel profile-stat-card">
          <div className="stat-icon-wrapper">
            <span className="stat-icon-large">📊</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">248</div>
            <div className="stat-label">Total Tasks</div>
            <div className="stat-sublabel">All time</div>
          </div>
        </div>
        
        <div className="panel profile-stat-card">
          <div className="stat-icon-wrapper">
            <span className="stat-icon-large">⏱️</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">1,240h</div>
            <div className="stat-label">Time Tracked</div>
            <div className="stat-sublabel">All time</div>
          </div>
        </div>
        
        <div className="panel profile-stat-card">
          <div className="stat-icon-wrapper">
            <span className="stat-icon-large">🏆</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">24</div>
            <div className="stat-label">Achievements</div>
            <div className="stat-sublabel">Earned</div>
          </div>
        </div>
      </div>

      {/* Account Details & Settings */}
      <div className="grid grid-2">
        <div className="panel profile-details-card">
          <h3 className="section-title">
            <span className="title-icon">👤</span>
            Account Details
          </h3>
          <div className="details-list">
            <div className="detail-item">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{user.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Account Type</span>
              <span className="detail-value">{user.account}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">January 2024</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last Active</span>
              <span className="detail-value">Just now</span>
            </div>
          </div>
        </div>

        <div className="panel profile-settings-card">
          <h3 className="section-title">
            <span className="title-icon">⚙️</span>
            Quick Settings
          </h3>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Email Notifications</div>
                <div className="setting-description">Receive updates about your activity</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Weekly Reports</div>
                <div className="setting-description">Get weekly productivity summaries</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Task Reminders</div>
                <div className="setting-description">Remind me about pending tasks</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <ProfileModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={save} initial={user} />
      <ChangePasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} />
    </div>
  )
}

