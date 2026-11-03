import { useState, type CSSProperties } from 'react'
import { MAX_COMODINES, count, mark, newGame, pause, remaining, start, validate, type Game, type Player, type Team, type WordSet } from './game'
import { Comodines } from './Player'
import { Rosco } from './Rosco'
import { SetEditor, blankSet } from './SetEditor'
import { COMODINES, deleteSet, saveSet, seconds, useGame, useNow, useSets } from './store'

const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'rosco'

const COLORS = ['#ef3b4a', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899']
const DEFAULT_TEAMS: Player[] = COLORS.slice(0, 4).map((color, i) => ({ name: `Equipo ${i + 1}`, color }))

/** Edits the word sets, sets up the game and fixes mistakes while it runs. */
export function Admin() {
  const [game, save] = useGame()
  const [sets, reloadSets] = useSets()
  const now = useNow()
  const [picked, setPicked] = useState<string | null>(null)
  const [secs, setSecs] = useState(150)
  const [players, setPlayers] = useState<Player[]>(DEFAULT_TEAMS)
  const [editing, setEditing] = useState<{ id: string | null; set: WordSet } | null>(null)

  const editPlayer = (i: number, patch: Partial<Player>) => setPlayers(ps => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)))
  const moveTeam = (i: number, by: number) =>
    setPlayers(ps => {
      const j = i + by
      if (j < 0 || j >= ps.length) return ps
      const out = [...ps]
      ;[out[i], out[j]] = [out[j], out[i]]
      return out
    })
  const create = () => {
    if (game?.phase === 'playing' && !confirm('Hay una partida en curso. ¿Empezar otra?')) return
    save(newGame(sets[picked!], players.map(p => ({ ...p, comodines: COMODINES ? p.comodines : 0 })), secs))
  }
  const editTeam = (g: Game, i: number, edit: (t: Team) => Partial<Team>) =>
    save({ ...g, teams: g.teams.map((t, j) => (j === i ? { ...t, ...edit(t) } : t)) })

  const storeSet = async (set: WordSet) => {
    let id = editing!.id
    if (!id) {
      id = slug(set.name)
      for (let k = 2; sets[id]; k++) id = `${slug(set.name)}-${k}`
    }
    try {
      await saveSet(id, set)
      setEditing(null)
      reloadSets()
    } catch (e) {
      alert(`No se pudo guardar: ${e}`)
    }
  }
  const removeSet = async (id: string) => {
    if (!confirm(`¿Borrar el rosco «${sets[id].name}»? Se elimina ${id}.json.`)) return
    await deleteSet(id).catch(e => alert(`No se pudo borrar: ${e}`))
    if (picked === id) setPicked(null)
    reloadSets()
  }

  return (
    <div className="screen admin">
      <header className="admin-header">
        <h1 className="logo small">Admin</h1>
        <nav>
          <a className="btn ghost" href="#/jugador" target="_blank">Abrir pantalla de jugadores ↗</a>
          <a className="btn ghost" href="#/presentador" target="_blank">Abrir presentador ↗</a>
        </nav>
      </header>

      {editing ? (
        <SetEditor initial={editing.set} onSave={storeSet} onCancel={() => setEditing(null)} />
      ) : (
        <section className="card">
          <div className="row">
            <h2>Roscos</h2>
            <button className="btn ghost" onClick={() => setEditing({ id: null, set: blankSet() })}>+ Nuevo rosco</button>
          </div>
          <p className="muted">
            Elige el rosco que jugarán todos los equipos. Cada rosco se guarda en <code>Ruleta/sets/</code>.
          </p>
          <div className="sets">
            {Object.entries(sets).map(([id, set]) => {
              const problems = validate(set)
              return (
                <div key={id} className={`set ${picked === id ? 'picked' : ''}`} style={{ '--team': set.color } as CSSProperties}>
                  <label className="set-main">
                    <input type="radio" name="rosco" checked={picked === id} onChange={() => setPicked(id)} disabled={problems.length > 0} />
                    <span className="dot" />
                    <span>
                      <b>{set.name}</b>
                      <span className="muted"> · {set.words.length} palabras</span>
                      {problems.length > 0 && <span className="warning">⚠ {problems.length} problema(s): edítalo para verlos</span>}
                    </span>
                  </label>
                  <div className="set-actions">
                    <button className="btn ghost small" onClick={() => setEditing({ id, set })}>Editar</button>
                    <button className="btn ghost small" onClick={() => setEditing({ id: null, set: { ...set, name: `${set.name} (copia)` } })}>Duplicar</button>
                    <button className="btn ghost small" onClick={() => removeSet(id)}>Borrar</button>
                  </div>
                </div>
              )
            })}
          </div>
          <h2>Equipos</h2>
          <p className="muted">
            El orden de la lista es el orden de turno: usa ↑ ↓ para cambiarlo.
            {COMODINES && ` Apunta cuántos comodines ganó cada uno (máx. ${MAX_COMODINES}); empieza el que tenga más.`}
          </p>
          <div className="sets">
            {players.map((p, i) => (
              <div key={i} className="set" style={{ '--team': p.color } as CSSProperties}>
                <div className="row">
                  <input type="color" value={p.color} onChange={e => editPlayer(i, { color: e.target.value })} aria-label="Color" />
                  <input className="name-input" value={p.name} onChange={e => editPlayer(i, { name: e.target.value })} placeholder="Nombre del equipo" />
                  <button className="icon" onClick={() => moveTeam(i, -1)} title="Subir">↑</button>
                  <button className="icon" onClick={() => moveTeam(i, 1)} title="Bajar">↓</button>
                  <button className="icon" disabled={players.length < 2} onClick={() => setPlayers(ps => ps.filter((_, j) => j !== i))} title="Quitar">✕</button>
                </div>
                {COMODINES && (
                  <label className="comodin-input">
                    🃏 Comodines ganados en los minijuegos{' '}
                    <input
                      type="number"
                      min={0}
                      max={MAX_COMODINES}
                      value={p.comodines ?? 0}
                      onChange={e => editPlayer(i, { comodines: Math.min(MAX_COMODINES, Math.max(0, +e.target.value)) })}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
          <div className="row">
            <button className="btn ghost" onClick={() => setPlayers(ps => [...ps, { name: `Equipo ${ps.length + 1}`, color: COLORS[ps.length % COLORS.length] }])}>
              + Añadir equipo
            </button>
            <label>
              Segundos por equipo{' '}
              <input type="number" min={10} step={10} value={secs} onChange={e => setSecs(+e.target.value)} />
            </label>
            <button className="btn correct" onClick={create} disabled={!picked || !players.length}>
              Empezar partida{picked && ` (${players.length} equipos)`}
            </button>
          </div>
        </section>
      )}

      {game && (
        <section className="card">
          <div className="row">
            <h2>Partida {game.phase === 'finished' ? 'terminada' : 'en curso'}</h2>
            <button className="btn wrong" onClick={() => confirm('¿Borrar la partida?') && save(null)}>
              Borrar partida
            </button>
          </div>
          <p className="muted">Pulsa una letra para corregirla: pendiente ↔ color del equipo que tiene el turno.</p>
          <div className="admin-rosco">
            <Rosco
              game={game}
              active={game.phase === 'playing'}
              onLetterClick={j => save(mark(game, j, game.owner[j] === null ? game.turn : null))} // team on turn's colour <-> not answered
            />
          </div>
          <div className="admin-teams">
            {game.teams.map((t, i) => {
              const active = game.phase === 'playing' && i === game.turn
              return (
                <div key={i} className="admin-team" style={{ '--team': t.color } as CSSProperties}>
                  <h3 className="team-name">{active && '▶ '}{t.name}</h3>
                  <div className="clock">{seconds(remaining(game, i, now))}</div>
                  <div className="muted">{count(game, i)} aciertos</div>
                  <Comodines n={t.comodines} />
                  <div className="row">
                    <button className="btn ghost" onClick={() => editTeam(game, i, t => ({ timeLeft: Math.max(0, t.timeLeft - 10_000) }))}>−10 s</button>
                    <button className="btn ghost" onClick={() => editTeam(game, i, t => ({ timeLeft: t.timeLeft + 10_000 }))}>+10 s</button>
                    {COMODINES && (
                      <>
                        <button className="btn ghost" onClick={() => editTeam(game, i, t => ({ comodines: Math.max(0, t.comodines - 1) }))}>−🃏</button>
                        <button className="btn ghost" onClick={() => editTeam(game, i, t => ({ comodines: t.comodines + 1 }))}>+🃏</button>
                      </>
                    )}
                    {active && game.runningSince !== null ? (
                      <button className="btn pass" onClick={() => save(pause(game))}>⏸ Parar</button>
                    ) : (
                      <button className="btn correct" onClick={() => save(start({ ...pause(game), turn: i, phase: 'playing' }))}>▶ Iniciar</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
