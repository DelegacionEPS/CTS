import type { CSSProperties, ReactNode } from 'react'
import type { Team } from './game'

type Props = {
  team: Team
  active: boolean
  onLetterClick?: (i: number) => void
  children?: ReactNode
}

export function Rosco({ team, active, onLetterClick, children }: Props) {
  const n = team.words.length
  return (
    <div className={`rosco ${active ? 'active' : ''}`} style={{ '--team': team.color, '--n': n } as CSSProperties}>
      {team.words.map((w, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2
        return (
          <div
            key={i}
            className={`letter ${team.status[i]} ${active && i === team.index ? 'current' : ''}`}
            style={{ left: `${50 + 44 * Math.cos(angle)}%`, top: `${50 + 44 * Math.sin(angle)}%` }}
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
