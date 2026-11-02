import { useState, type CSSProperties } from 'react'
import { MAX_COMODINES, count, newGame, pause, remaining, validate, type Game, type Team, type WordSet } from './game'
import { Comodines } from './Player'
import { Rosco } from './Rosco'
import { SetEditor, blankSet } from './SetEditor'
import { COMODINES, deleteSet, saveSet, seconds, useGame, useNow, useSets } from './store'

const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'rosco'

/** Edits the word sets, sets up the game and fixes mistakes while it runs. */
export function Admin() {
  const [game, save] = useGame()
  const [sets, reloadSets] = useSets()
  const now = useNow()
  const [picked, setPicked] = useState<string[]>([])
  const [secs, setSecs] = useState(150)
  const [comodines, setComodines] = useState<Record<string, number>>({})
  const [editing, setEditing] = useState<{ id: string | null; set: WordSet } | null>(null)

  const togglePick = (id: string) => setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]))
  const create = () => {
    if (game?.phase === 'playing' && !confirm('Hay una partida en curso. ¿Empezar otra?')) return
    save(newGame(picked.map(id => sets[id]), secs, COMODINES ? picked.map(id => comodines[id] ?? 0) : []))
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
    setPicked(p => p.filter(x => x !== id))
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
            Marca los equipos que juegan, en orden de turno.
            {COMODINES && ` Apunta cuántos comodines ganó cada uno (máx. ${MAX_COMODINES}); empieza el que tenga más.`}
            Cada rosco se guarda en <code>Ruleta/sets/</code>.
          </p>
          <div className="sets">
            {Object.entries(sets).map(([id, set]) => {
              const problems = validate(set)
              const order = picked.indexOf(id)
              return (
                <div key={id} className={`set ${order >= 0 ? 'picked' : ''}`} style={{ '--team': set.color } as CSSProperties}>
                  <label className="set-main">
                    <input type="checkbox" checked={order >= 0} onChange={() => togglePick(id)} disabled={problems.length > 0 && order < 0} />
                    <span className="dot" />
                    <span>
                      <b>{set.name}</b>
                      <span className="muted"> · {set.words.length} palabras</span>
                      {problems.length > 0 && <span className="warning">⚠ {problems.length} problema(s): edítalo para verlos</span>}
                    </span>
                    {order >= 0 && <span className="order">{order + 1}</span>}
                  </label>
                  {COMODINES && order >= 0 && (
                    <label className="comodin-input">
                      🃏 Comodines ganados en los minijuegos{' '}
                      <input
                        type="number"
                        min={0}
                        max={MAX_COMODINES}
                        value={comodines[id] ?? 0}
                        onChange={e => setComodines({ ...comodines, [id]: Math.min(MAX_COMODINES, Math.max(0, +e.target.value)) })}
                      />
                    </label>
                  )}
                  <div className="set-actions">
                    <button className="btn ghost small" onClick={() => setEditing({ id, set })}>Editar</button>
                    <button className="btn ghost small" onClick={() => setEditing({ id: null, set: { ...set, name: `${set.name} (copia)` } })}>Duplicar</button>
                    <button className="btn ghost small" onClick={() => removeSet(id)}>Borrar</button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="row">
            <label>
              Segundos por equipo{' '}
              <input type="number" min={10} step={10} value={secs} onChange={e => setSecs(+e.target.value)} />
            </label>
            <button className="btn correct" onClick={create} disabled={!picked.length}>
              Empezar partida{picked.length > 0 && ` (${picked.length} equipos)`}
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
          <p className="muted">Pulsa una letra para corregirla: pendiente ↔ acierto.</p>
          <div className="admin-teams">
            {game.teams.map((t, i) => {
              const active = game.phase === 'playing' && i === game.turn
              return (
                <div key={i} className="admin-team" style={{ '--team': t.color } as CSSProperties}>
                  <h3 className="team-name">{t.name}</h3>
                  <Rosco
                    team={t}
                    active={active}
                    onLetterClick={j => editTeam(game, i, t => ({ status: t.status.map((s, k) => (k === j ? (s === 'pending' ? 'correct' : 'pending') : s)) }))}
                  >
                    <div className="clock">{seconds(remaining(game, i, now))}</div>
                    <div className="muted">
                      {count(t, 'correct')} aciertos
                    </div>
                    <Comodines n={t.comodines} />
                  </Rosco>
                  <div className="row">
                    <button className="btn ghost" onClick={() => editTeam(game, i, t => ({ timeLeft: Math.max(0, t.timeLeft - 10_000) }))}>−10 s</button>
                    <button className="btn ghost" onClick={() => editTeam(game, i, t => ({ timeLeft: t.timeLeft + 10_000 }))}>+10 s</button>
                    {COMODINES && (
                      <>
                        <button className="btn ghost" onClick={() => editTeam(game, i, t => ({ comodines: Math.max(0, t.comodines - 1) }))}>−🃏</button>
                        <button className="btn ghost" onClick={() => editTeam(game, i, t => ({ comodines: t.comodines + 1 }))}>+🃏</button>
                      </>
                    )}
                    <button className="btn pass" disabled={active} onClick={() => save({ ...pause(game), turn: i, phase: 'playing' })}>
                      Dar turno
                    </button>
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
