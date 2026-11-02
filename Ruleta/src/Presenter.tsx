import { useEffect, useRef, type CSSProperties } from 'react'
import { answer, count, isDone, pause, remaining, start, tick, type Game } from './game'
import { Comodines, Winner } from './Player'
import { Rosco } from './Rosco'
import { COMODINES, seconds, useGame, useNow } from './store'

/** For the host: reads the definition, sees the answer and runs the turn. */
export function Presenter() {
  const [game, save] = useGame()
  const now = useNow()
  const history = useRef<Game[]>([])

  // The presenter's screen is the one that ends a turn when the clock hits zero.
  useEffect(() => {
    if (game && tick(game, now) !== game) save(tick(game, now))
  }, [game, now])

  const commit = (next: Game) => {
    history.current.push(pause(game!))
    save(next)
  }
  const undo = () => {
    const prev = history.current.pop()
    if (prev) save(prev)
  }
  const toggle = () => game && commit(game.runningSince === null ? start(game) : pause(game))
  const respond = (r: 'correct' | 'pass' | 'comodin') => game && game.phase === 'playing' && commit(answer(game, r))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') return undo()
      const action = { ' ': toggle, Enter: () => respond('correct'), p: () => respond('pass'), c: () => COMODINES && respond('comodin') }[e.key]
      if (!action) return
      e.preventDefault()
      action()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  if (!game)
    return (
      <div className="screen center-screen">
        <h1 className="logo">Presentador</h1>
        <p className="muted">
          No hay partida en curso. Créala desde <a href="#/admin">Admin</a>.
        </p>
      </div>
    )

  const team = game.teams[game.turn]
  const word = team.words[team.index]
  const running = game.runningSince !== null

  return (
    <div className="screen presenter" style={{ '--team': team.color } as CSSProperties}>
      <header className="scoreboard">
        {game.teams.map((t, i) => {
          return (
            <div key={i} className={`chip ${i === game.turn ? 'active' : ''}`} style={{ '--team': t.color } as CSSProperties}>
              <span className="dot" />
              <b>{t.name}</b>
              <span className="chip-time">{seconds(remaining(game, i, now))}s</span>
              <span className="good">{count(t, 'correct')}✓</span>
              <Comodines n={t.comodines} />
            </div>
          )
        })}
      </header>

      <main className="presenter-main">
        <div className="presenter-rosco">
          <Rosco team={team} active={game.phase === 'playing'}>
            <div className={`clock ${running ? '' : 'paused'}`}>{seconds(remaining(game, game.turn, now))}</div>
            <div className="muted">{running ? 'en marcha' : 'pausado'}</div>
          </Rosco>
        </div>

        <section className="card question">
          <p className="team-name">Turno de {team.name}</p>
          <p className="kind">
            {word.contains ? 'Contiene la' : 'Empieza por'} <span className="big-letter">{word.letter}</span>
          </p>
          <p className="definition">{word.question}</p>
          <p className="answer">
            <span className="muted">Respuesta:</span> {word.answer}
          </p>
        </section>
      </main>

      <footer className="controls">
        <button className="btn ghost" onClick={toggle} disabled={game.phase === 'finished' || isDone(team)}>
          {running ? '⏸ Pausar' : '▶ Empezar'} <kbd>Espacio</kbd>
        </button>
        <button className="btn correct" onClick={() => respond('correct')}>
          ✓ Acierto <kbd>Enter</kbd>
        </button>
        <button className="btn pass" onClick={() => respond('pass')}>
          Fallo / Pasapalabra <kbd>P</kbd>
        </button>
        {COMODINES && (
          <button className="btn comodin" onClick={() => respond('comodin')} disabled={team.comodines < 1} title="Pasapalabra sin perder el turno; el comodín pasa al siguiente equipo">
            🃏 Usar comodín ({team.comodines}) <kbd>C</kbd>
          </button>
        )}
        <button className="btn ghost" onClick={undo}>
          ↶ Deshacer <kbd>Ctrl Z</kbd>
        </button>
      </footer>

      {game.phase === 'finished' && <Winner game={game} />}
    </div>
  )
}
