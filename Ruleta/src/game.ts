// Pure game logic. No React, no imports: runnable with `node` for the tests.

export type Word = { letter: string; question: string; answer: string; contains?: boolean }
export type WordSet = { name: string; color: string; words: Word[] }
/** Who plays. `comodines` is what they won in the minigames. */
export type Player = { name: string; color: string; comodines?: number }
export type Team = { name: string; color: string; timeLeft: number; comodines: number }
/** One shared rosco: `owner[i]` is the team that got letter i right, null while it is pending. */
export type Game = {
  phase: 'playing' | 'finished'
  /** Snapshot of the rosco, so editing sets mid-game can't break the game. */
  set: WordSet
  owner: (number | null)[]
  /** Letter currently being asked. */
  index: number
  teams: Team[]
  turn: number
  /** Timestamp when the clock of `teams[turn]` started running, null when paused. */
  runningSince: number | null
}

/** Max comodines a team can win before the rosco: one per minigame. */
export const MAX_COMODINES = 3

/** Teams take turns in the given order on one rosco; the one with the most comodines starts (first one on a tie). */
export function newGame(set: WordSet, players: Player[], seconds: number): Game {
  const teams = players.map(p => ({ name: p.name, color: p.color, timeLeft: seconds * 1000, comodines: p.comodines ?? 0 }))
  const turn = teams.reduce((best, t, i) => (t.comodines > teams[best].comodines ? i : best), 0)
  return { phase: 'playing', set, owner: set.words.map(() => null), index: 0, teams, turn, runningSince: null }
}

export const remaining = (g: Game, i: number, now = Date.now()) =>
  Math.max(0, g.teams[i].timeLeft - (i === g.turn && g.runningSince !== null ? now - g.runningSince : 0))

/** Letters team i got right. */
export const count = (g: Game, i: number) => g.owner.filter(o => o === i).length

const pendingLeft = (g: Game) => g.owner.includes(null)

/** A team is done when it has no time left or there is nothing left to answer. */
export const isDone = (g: Game, i: number) => g.teams[i].timeLeft <= 0 || !pendingLeft(g)

/** Next pending letter after the current one (wrapping, may be itself), -1 if none. */
function nextPending(g: Game) {
  const n = g.owner.length
  for (let k = 1; k <= n; k++) {
    const j = (g.index + k) % n
    if (g.owner[j] === null) return j
  }
  return -1
}

export function pause(g: Game, now = Date.now()): Game {
  if (g.runningSince === null) return g
  const teams = g.teams.map((t, i) => (i === g.turn ? { ...t, timeLeft: remaining(g, i, now) } : t))
  return { ...g, teams, runningSince: null }
}

export function start(g: Game, now = Date.now()): Game {
  if (g.phase === 'finished' || g.runningSince !== null || isDone(g, g.turn)) return g
  return { ...g, runningSince: now }
}

/** Hands the turn to the next team that can still play, or finishes the game. */
export function passTurn(g: Game, now = Date.now()): Game {
  g = pause(g, now)
  const n = g.teams.length
  for (let k = 1; k <= n; k++) {
    const j = (g.turn + k) % n
    if (!isDone(g, j)) return { ...g, turn: j }
  }
  return { ...g, phase: 'finished' }
}

/**
 * - correct: the letter takes the team's colour; the team keeps the turn and the clock.
 * - pass: a wrong answer is also a pasapalabra; the letter stays pending and the turn moves to the next team.
 * - comodin: "usar comodín" skips the letter without losing the turn; the comodín goes to the next team.
 */
export function answer(g: Game, result: 'correct' | 'pass' | 'comodin', now = Date.now()): Game {
  if (result === 'comodin' && g.teams[g.turn].comodines < 1) return g
  const running = g.runningSince !== null
  g = pause(g, now)
  const receiver = (g.turn + 1) % g.teams.length
  const owner = [...g.owner]
  const teams = g.teams.map(t => ({ ...t }))
  if (result === 'correct') owner[g.index] = g.turn
  if (result === 'comodin') {
    teams[g.turn].comodines--
    teams[receiver].comodines++ // with a single team this hands it straight back, so nothing changes
  }
  g = { ...g, owner, teams }
  const next = nextPending(g)
  if (next >= 0) g = { ...g, index: next }
  if (result !== 'pass' && !isDone(g, g.turn)) return running ? start(g, now) : g
  return passTurn(g, now)
}

/** Admin correction: sets who owns letter j. If that was the letter being asked, moves on to the next pending one. */
export function mark(g: Game, j: number, owner: number | null): Game {
  const owners = g.owner.map((o, k) => (k === j ? owner : o))
  g = { ...g, owner: owners }
  const next = g.owner[g.index] === null ? -1 : nextPending(g)
  return next >= 0 ? { ...g, index: next } : g
}

/** Ends the turn when the clock runs out. */
export const tick = (g: Game, now = Date.now()) =>
  g.runningSince !== null && remaining(g, g.turn, now) <= 0 ? passTurn(g, now) : g

/** Winner first: most correct answers, ties broken by more time left. */
export const ranking = (g: Game) =>
  g.teams
    .map((_, i) => ({ i, correct: count(g, i), timeLeft: remaining(g, i) }))
    .sort((a, b) => b.correct - a.correct || b.timeLeft - a.timeLeft)

/** Uppercase without accents, keeping the Ñ distinct from the N. */
const norm = (s: string) => s.toUpperCase().normalize('NFD').replace(/[\u0300-\u0302\u0304-\u036f]/g, '')

/** Human-readable problems in a word set, shown in the admin view. */
export function validate(set: WordSet): string[] {
  if (!set.name || !set.color || !Array.isArray(set.words) || !set.words.length)
    return ['Falta "name", "color" o la lista "words"']
  return set.words.flatMap((w, i) => {
    if (!w.letter || !w.question || !w.answer) return [`Palabra ${i + 1}: falta "letter", "question" o "answer"`]
    const [l, a] = [norm(w.letter), norm(w.answer)]
    if (w.contains ? !a.includes(l) : !a.startsWith(l))
      return [`${w.letter}: "${w.answer}" no ${w.contains ? 'contiene' : 'empieza por'} la ${w.letter}`]
    return []
  })
}
