import { useQuery } from 'convex/react'
import type { CSSProperties } from 'react'
import { api } from '../convex/_generated/api'
import { TEAMS } from '../convex/teams'

/** Big read-only screen for the projector. Updates live from Convex. */
export function Board() {
  const scores = useQuery(api.scores.get)
  const best = scores && Math.max(...scores.totals)
  return (
    <div className="screen">
      <h1 className="title">Marcadores</h1>
      <div className="board">
        {(scores?.teams ?? TEAMS).map((t, i) => {
          const total = scores?.totals[i]
          return (
            <div key={i} className={`team ${scores?.count && total === best ? 'leader' : ''}`} style={{ '--team': t.color } as CSSProperties}>
              <h2>{t.name}</h2>
              <div className="score">{total ?? '…'}</div>
              <div className="unit">puntos</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
