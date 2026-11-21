import type { CSSProperties, ReactNode } from 'react'
import type { Game } from './game'

type Props = {
  game: Game
  /** Highlights the current letter and glows in the colour of the team on turn. */
  active: boolean
  onLetterClick?: (i: number) => void
  children?: ReactNode
}

/** The shared rosco: each letter takes the colour of the team that got it right. */
export function Rosco({ game, active, onLetterClick, children }: Props) {
  const { words } = game.set
  const n = words.length
  return (
    <div className={`rosco ${active ? 'active' : ''}`} style={{ '--team': game.teams[game.turn].color, '--n': n } as CSSProperties}>
      {words.map((w, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2
        const owner = game.owner[i]
        return (
          <div
            key={i}
            className={`letter ${owner !== null ? 'owned' : ''} ${active && i === game.index ? 'current' : ''}`}
            style={{ left: `${50 + 44 * Math.cos(angle)}%`, top: `${50 + 44 * Math.sin(angle)}%`, ...(owner !== null && { '--owner': game.teams[owner].color }) } as CSSProperties}
            onClick={onLetterClick && (() => onLetterClick(i))}
            role={onLetterClick && 'button'}
          >
            {w.letter}
          </div>
        )
      })}
      <div className="rosco-center">{children}</div>
    </div>
  )
}
