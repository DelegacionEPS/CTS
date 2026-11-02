import type { CSSProperties } from 'react'
import { count, ranking, remaining, type Game } from './game'
import { Rosco } from './Rosco'
import { COMODINES, seconds, useGame, useNow, useViewport } from './store'

/** Column count and rosco size (px) that make n roscos as big as possible on screen. */
export function bestGrid(n: number, w: number, h: number) {
  let best = { cols: 1, size: 0 }
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols)
    // Each cell also holds the team name above and the hint below (~30% of the rosco).
    const size = Math.min(w / cols, h / rows / 1.3) * 0.9
    if (size > best.size) best = { cols, size }
  }
  return best
}

/** Big screen for the contestants and the audience. Read-only. */
export function Player() {
  const [game] = useGame()
  const now = useNow()
  const { w, h } = useViewport()
  if (!game)
    return (
      <div className="screen center-screen">
        <h1 className="logo">Pasapalabra</h1>
        <p className="muted">Esperando a que empiece la partida…</p>
      </div>
    )

  const { cols, size } = bestGrid(game.teams.length, w - 32, h - 80)
  return (
    <div className="screen player">
      <h1 className="logo small">Pasapalabra</h1>
      <div className="player-teams" style={{ gridTemplateColumns: `repeat(${cols}, ${size}px)` }}>
        {game.teams.map((t, i) => {
          const active = game.phase === 'playing' && i === game.turn
          const w = t.words[t.index]
          const left = remaining(game, i, now)
          return (
            <div key={i} className={`player-team ${active ? 'active' : ''}`} style={{ '--team': t.color, '--size': `${size}px` } as CSSProperties}>
              <h2 className="team-name">{t.name}</h2>
              <Rosco team={t} active={active}>
                <div className={`clock ${left <= 10_000 && left > 0 ? 'hurry' : ''}`}>{seconds(left)}</div>
                <div className="hits">{count(t, 'correct')}</div>
                <div className="muted">aciertos</div>
                <Comodines n={t.comodines} />
              </Rosco>
              <p className="hint">{active ? `${w.contains ? 'Contiene la' : 'Empieza por'} ${w.letter}` : ' '}</p>
            </div>
          )
        })}
      </div>
      {game.phase === 'finished' && <Winner game={game} />}
    </div>
  )
}

/** One card per comodín the team holds. */
export const Comodines = ({ n }: { n: number }) =>
  COMODINES && (
  <span className="comodines" title={`${n} ${n === 1 ? 'comodín' : 'comodines'}`}>
    {'🃏'.repeat(n) || '\u00a0'}
  </span>
  )

export function Winner({ game }: { game: Game }) {
  const [first, second] = ranking(game)
  const tie = second && second.correct === first.correct && seconds(second.timeLeft) === seconds(first.timeLeft)
  const team = game.teams[first.i]
  return (
    <div className="winner" style={{ '--team': team.color } as CSSProperties}>
      <div className="winner-card">
        <p className="muted">{tie ? '¡Empate!' : '¡Gana el rosco!'}</p>
        <h2>{tie ? 'Nadie se rinde' : team.name}</h2>
        <p>
          {first.correct} aciertos{first.timeLeft > 0 && ` · ${seconds(first.timeLeft)} s de sobra`}
        </p>
      </div>
    </div>
  )
}
