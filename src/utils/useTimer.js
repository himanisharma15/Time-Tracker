import { useEffect, useRef, useState } from 'react'

export default function useTimer(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000)
    }
    return () => clearInterval(ref.current)
  }, [running])

  return { seconds, running, start: () => setRunning(true), pause: () => setRunning(false), reset: () => setSeconds(0) }
}
