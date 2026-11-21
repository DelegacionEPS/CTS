import type { CSSProperties } from 'react'
import { count, ranking, remaining, type Game } from './game'
import { Rosco } from './Rosco'
import { COMODINES, seconds, useGame, useNow } from './store'

/** Big screen for the contestants and the audience. Read-only. */
export function Player() {
  const [game] = useGame()
  const now = useNow()
  if (!game)
    return (
      <div className="screen center-screen">
        <h1 className="logo">Pasapalabra</h1>
        <p className="muted">Esperando a que empiece la partida…</p>
      </div>
    )

  const word = game.set.words[game.index]
  const playing = game.phase === 'playing'
  return (
    <div className="screen player">
      <h1 className="logo small">Pasapalabra</h1>
      <div className="player-main">
        <div className="player-rosco">
          <Rosco game={game} active={playing}>
            {playing && <div className="hint">{word.contains ? 'Contiene la' : 'Empieza por'} <b>{word.letter}</b></div>}
          </Rosco>
        </div>
        <div className="player-teams">
          {game.teams.map((t, i) => {
            const left = remaining(game, i, now)
            return (
              <div key={i} className={`player-team ${playing && i === game.turn ? 'active' : ''}`} style={{ '--team': t.color } as CSSProperties}>
                <span className="dot" />
                <h2 className="team-name">
                  {t.name} <Comodines n={t.comodines} />
                </h2>
                <div className="hits">{count(game, i)}</div>
                <div className={`clock ${left <= 10_000 && left > 0 ? 'hurry' : ''}`}>{seconds(left)}</div>
              </div>
            )
          })}
        </div>
      </div>
      {playing || <Winner game={game} />}
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
