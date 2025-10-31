import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TaskModal from '../components/TaskModal'

function formatSecs(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h ? h + 'h ' : ''}${m ? m + 'm ' : ''}${sec}s`.trim()
}

export default function Tasks() {
  const location = useLocation()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  const [loading, setLoading] = useState(true)

  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
    ? import.meta.env.VITE_API_BASE
    : '/api'

  // Load tasks from localStorage on mount
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = () => {
    try {
      const storedTasks = localStorage.getItem('tt:tasks')
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks)
        setTasks(parsedTasks)
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      // Keep empty array on error
    } finally {
      setLoading(false)
    }
  }

  const saveTasks = (tasksToSave) => {
    try {
      localStorage.setItem('tt:tasks', JSON.stringify(tasksToSave))
    } catch (err) {
      console.error('Failed to save tasks:', err)
    }
  }

  // Keep a ref of tasks we've already notified for in this session to avoid repeats
  const notifiedRef = React.useRef(new Set())

  useEffect(() => {
    // Parse estimate field (allow values like '25' or '25m' or '0.5h') into minutes
    const parseEstimateMinutes = (val) => {
      if (!val && val !== 0) return 0
      if (typeof val === 'number') return val
      const s = String(val).trim()
      if (!s) return 0
      // support formats: '25' => 25 minutes, '25m' => 25, '1h' => 60, '1.5h' => 90
      const mMatch = s.match(/^([0-9]+(?:\.[0-9]+)?)\s*m(?:in(?:utes?)?)?$/i)
      if (mMatch) return Math.round(parseFloat(mMatch[1]))
      const hMatch = s.match(/^([0-9]+(?:\.[0-9]+)?)\s*h(?:ours?)?$/i)
      if (hMatch) return Math.round(parseFloat(hMatch[1]) * 60)
      const num = parseFloat(s)
      return Number.isFinite(num) ? Math.round(num) : 0
    }

    // Play a short beep using WebAudio
    const playBeep = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        const ctx = new AudioCtx()
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sine'
        o.frequency.value = 880
        g.gain.value = 0.05
        o.connect(g)
        g.connect(ctx.destination)
        o.start()
        setTimeout(() => { o.stop(); try { ctx.close() } catch (e) {} }, 900)
      } catch (e) {
        // fallback to simple log if audio fails
        console.log('Beep failed', e)
      }
    }

    // Show a browser notification (asks permission when needed)
    const notifyTask = async (task) => {
      const title = `Task finished: ${task.name || 'Task'}`
      const body = `Estimated time reached for ${task.name || 'task'}`
      // Try web notification
      if ('Notification' in window) {
        try {
          if (Notification.permission === 'default') {
            await Notification.requestPermission()
          }
          if (Notification.permission === 'granted') {
            const n = new Notification(title, { body })
            n.onclick = () => window.focus()
          } else {
            // fallback
            alert(`${title}\n${body}`)
          }
        } catch (e) {
          console.error('Notification error', e)
        }
      } else {
        alert(`${title}\n${body}`)
      }

      // Play beep
      playBeep()
    }

    const interval = setInterval(() => {
      setTasks(prev => {
        const updated = prev.map(t => (t.running ? { ...t, seconds: t.seconds + 1 } : t))

        // Save to localStorage every 10 seconds for running tasks
        const hasRunningTasks = updated.some(t => t.running)
        if (hasRunningTasks) {
          saveTasks(updated)
        }

        // If task has an estimate (in minutes), notify when elapsed >= estimate
        updated.forEach(t => {
          try {
            const est = parseEstimateMinutes(t.estimate)
            if (est > 0 && t.seconds >= est * 60 && !notifiedRef.current.has(t._id || t.id)) {
              notifyTask(t)
              notifiedRef.current.add(t._id || t.id)
            }
          } catch (e) {
            // ignore parse errors
          }
        })

        return updated
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [API_BASE])

  // If we arrived with a quickStart flag, create and start a Quick Session
  useEffect(() => {
    if (location && location.state && location.state.quickStart) {
      setTasks(prev => {
        const id = Math.max(0, ...prev.map(t => t.id || 0)) + 1
        const quickTask = { 
          id, 
          name: 'Quick Session', 
          project: 'Quick', 
          status: 'In Progress', 
          seconds: 0, 
          running: true,
          createdAt: new Date().toISOString()
        }
        const updated = [...prev, quickTask]
        saveTasks(updated)
        return updated
      })
      // clear navigation state so repeated mounts don't duplicate
      try {
        navigate(location.pathname, { replace: true, state: null })
      } catch {
        // ignore if navigate not available
      }
    }
  }, [location, navigate])

  const toggleTimer = id => {
    const task = tasks.find(t => t._id === id || t.id === id)
    if (!task) return
    
    const newRunning = !task.running
    setTasks(prev => {
      const updated = prev.map(t => (t._id === id || t.id === id) ? { ...t, running: newRunning } : t)
      saveTasks(updated)
      return updated
    })
  }

  const stopTimer = id => {
    const task = tasks.find(t => t._id === id || t.id === id)
    if (!task) return
    
    setTasks(prev => {
      const updated = prev.map(t => (t._id === id || t.id === id) ? { ...t, running: false } : t)
      saveTasks(updated)
      return updated
    })
  }

  const addOrSave = data => {
    try {
      if (data._id || data.id) {
        // Update existing task
        const taskId = data._id || data.id
        setTasks(prev => {
          const updated = prev.map(t => (t._id === taskId || t.id === taskId) ? { ...t, ...data } : t)
          saveTasks(updated)
          return updated
        })
      } else {
        // Create new task
        const newTask = { 
          ...data, 
          id: Date.now(), // Simple ID generation
          seconds: 0, 
          running: false, 
          status: data.status || 'Pending',
          createdAt: new Date().toISOString()
        }
        setTasks(prev => {
          const updated = [...prev, newTask]
          saveTasks(updated)
          return updated
        })
      }
    } catch (err) {
      console.error('Failed to save task:', err)
    }
  }

  return (
    <div className="page tasks">
      <div className="panel head">
        <h2>Tasks</h2>
        <div>
          <button className="btn primary" onClick={() => { setEdit(null); setModalOpen(true) }}>Add Task</button>
        </div>
      </div>

      {loading ? (
        <div style={{padding: '20px', textAlign: 'center'}}>Loading tasks...</div>
      ) : (
        <div className="task-list">
          <table>
            <thead>
              <tr><th>Task</th><th>Project</th><th>Status</th><th>Time</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No tasks yet. Click "Add Task" to create one.</td></tr>
              ) : (
                tasks.map(t => {
                  const taskId = t._id || t.id
                  return (
                    <tr key={taskId} className={t.running ? 'running' : ''}>
                      <td>{t.name}</td>
                      <td>{t.project}</td>
                      <td>{t.status}</td>
                      <td>{formatSecs(t.seconds)}</td>
                      <td>
                        <button className="btn" onClick={() => toggleTimer(taskId)}>{t.running ? 'Pause' : 'Start'}</button>
                        <button className="btn ghost" onClick={() => stopTimer(taskId)}>Stop</button>
                        <button className="btn" onClick={() => { setEdit(t); setModalOpen(true) }}>Edit</button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={addOrSave} initial={edit || {}} />
    </div>
  )
}
