import { useEffect, useRef, useState } from 'react'
import type { Game, WordSet } from './game'

/** Comodines are off unless VITE_COMODINES=true in .env (restart the server after changing it). */
export const COMODINES = import.meta.env.VITE_COMODINES === 'true'

/** The shared game, polled from the server so every open view stays in sync (see backend.ts). */
// ponytail: polling once a second, ~11k Redis requests/hour with 3 screens; free Upstash allows 500k/month.
export function useGame() {
  const [game, setGame] = useState<Game | null>(null)
  // Bumped when a save starts and ends, so a poll that overlapped it can't overwrite the newer local state.
  const writes = useRef(0)
  useEffect(() => {
    const poll = () => {
      const w = writes.current
      fetch('/api/state')
        .then(r => r.json())
        .then(g => w === writes.current && setGame(g?.owner ? g : null)) // a game saved by an older version has no `owner`: treat as none
        .catch(() => {})
    }
    poll()
    const id = setInterval(poll, 1000)
    return () => clearInterval(id)
  }, [])
  const save = (g: Game | null) => {
    writes.current++
    setGame(g)
    fetch('/api/state', { method: 'POST', body: JSON.stringify(g) }).finally(() => writes.current++)
  }
  return [game, save] as const
}

/** Word sets keyed by id (file name in ./sets, or Redis key on Vercel). */
export function useSets() {
  const [sets, setSets] = useState<Record<string, WordSet>>({})
  const reload = () =>
    fetch('/api/sets')
      .then(r => r.json())
      .then(setSets)
  useEffect(() => void reload(), [])
  return [sets, reload] as const
}

async function call(url: string, init: RequestInit) {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(await res.text())
}
export const saveSet = (id: string, set: WordSet) => call(`/api/sets/${id}`, { method: 'PUT', body: JSON.stringify(set) })
export const deleteSet = (id: string) => call(`/api/sets/${id}`, { method: 'DELETE' })

/** Re-renders a few times per second so clocks tick. */
export function useNow(ms = 200) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}

/** Window size, for layouts that depend on it. */
export function useViewport() {
  const [size, setSize] = useState({ w: innerWidth, h: innerHeight })
  useEffect(() => {
    const onResize = () => setSize({ w: innerWidth, h: innerHeight })
    addEventListener('resize', onResize)
    return () => removeEventListener('resize', onResize)
  }, [])
  return size
}

export const seconds = (ms: number) => Math.ceil(ms / 1000)
