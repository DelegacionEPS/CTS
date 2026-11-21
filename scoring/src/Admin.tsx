import { useConvex, useMutation, useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react'
import { api } from '../convex/_generated/api'
import { TEAMS } from '../convex/teams'

const KEY = 'scoring-password'
const stored = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}
const remember = (p: string | null) => {
  try {
    p ? localStorage.setItem(KEY, p) : localStorage.removeItem(KEY)
  } catch {}
}
const message = (e: unknown) => (e instanceof ConvexError ? String(e.data) : 'Error de conexión')

/** Control panel: +n / −n per team and undo. The password is checked by Convex on every change. */
export function Admin() {
  const convex = useConvex()
  const [password, setPassword] = useState(stored)
  const [error, setError] = useState('')

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const p = new FormData(e.currentTarget).get('password') as string
    try {
      await convex.query(api.scores.login, { password: p })
      remember(p)
      setPassword(p)
      setError('')
    } catch (err) {
      setError(message(err))
    }
  }

  if (!password)
    return (
      <div className="screen center">
        <form className="card login" onSubmit={login}>
          <h1>Admin</h1>
          <input name="password" type="password" placeholder="Contraseña" autoFocus required aria-label="Contraseña" />
          <button className="btn">Entrar</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    )
  return (
    <Panel
      password={password}
      logout={() => {
        remember(null)
        setPassword(null)
      }}
    />
  )
}

function Panel({ password, logout }: { password: string; logout: () => void }) {
  const scores = useQuery(api.scores.get)
  const add = useMutation(api.scores.add)
  const undo = useMutation(api.scores.undo)
  const setTeam = useMutation(api.scores.setTeam)
  const [n, setN] = useState(1)
  const [error, setError] = useState('')

  const run = async (action: () => Promise<unknown>) => {
    try {
      await action()
      setError('')
    } catch (e) {
      setError(message(e))
      if (message(e) === 'Contraseña incorrecta') logout()
    }
  }
  const last = scores?.last
  const teams = scores?.teams ?? TEAMS

  return (
    <div className="screen">
      <header className="admin-header">
        <h1>Admin</h1>
        <a className="btn ghost" href="#/" target="_blank">
          Abrir marcador ↗
        </a>
        <button className="btn ghost" onClick={logout}>
          Salir
        </button>
      </header>

      <label className="amount">
        Puntos por pulsación
        <input type="number" min={1} value={n} onChange={e => setN(Math.max(1, Math.floor(+e.target.value) || 1))} />
      </label>

      <div className="admin-teams">
        {teams.map((t, i) => (
          <div key={i} className="team" style={{ '--team': t.color } as CSSProperties}>
            <TeamEditor key={`${t.name}${t.color}`} team={t} save={(name, color) => run(() => setTeam({ password, team: i, name, color }))} />
            <div className="score">{scores?.totals[i] ?? '…'}</div>
            <div className="buttons">
              <button className="btn minus" onClick={() => run(() => add({ password, team: i, delta: -n }))}>
                −{n}
              </button>
              <button className="btn plus" onClick={() => run(() => add({ password, team: i, delta: n }))}>
                +{n}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn undo" disabled={!last} onClick={() => run(() => undo({ password }))}>
        ↶ Deshacer{last && ` (${last.delta > 0 ? '+' : ''}${last.delta} a ${teams[last.team].name})`}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

/** Name + colour of a team. The hex field lets you paste a colour from the rosco; saved on blur / Enter. */
function TeamEditor({ team, save }: { team: { name: string; color: string }; save: (name: string, color: string) => void }) {
  const [name, setName] = useState(team.name)
  const [hex, setHex] = useState(team.color)
  const valid = /^#[0-9a-f]{6}$/i.test(hex)
  const commit = (n = name, c = hex) => {
    if (n.trim() && /^#[0-9a-f]{6}$/i.test(c) && (n !== team.name || c !== team.color)) save(n, c)
  }
  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && e.currentTarget.blur()
  return (
    <div className="team-editor">
      <input className="name" value={name} onChange={e => setName(e.target.value)} onBlur={() => commit()} onKeyDown={onEnter} aria-label="Nombre del equipo" />
      <div className="color-row">
        <input type="color" value={valid ? hex : team.color} onChange={e => setHex(e.target.value)} onBlur={() => commit()} aria-label="Color" />
        <input
          className={`hex ${valid ? '' : 'invalid'}`}
          value={hex}
          onChange={e => setHex(e.target.value.trim())}
          onBlur={() => commit()}
          onKeyDown={onEnter}
          placeholder="#rrggbb"
          aria-label="Color en hexadecimal"
        />
      </div>
    </div>
  )
}
