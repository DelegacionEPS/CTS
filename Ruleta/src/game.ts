// Pure game logic. No React, no imports: runnable with `node` for the tests.

export type Word = { letter: string; question: string; answer: string; contains?: boolean }
export type WordSet = { name: string; color: string; words: Word[] }
export type Status = 'pending' | 'correct'
/** A team plays a snapshot of its word set, so editing sets mid-game can't break it. */
export type Team = WordSet & { status: Status[]; index: number; timeLeft: number; comodines: number }
export type Game = {
  phase: 'playing' | 'finished'
  teams: Team[]
  turn: number
  /** Timestamp when the clock of `teams[turn]` started running, null when paused. */
  runningSince: number | null
}

/** Max comodines a team can win before the rosco: one per minigame. */
export const MAX_COMODINES = 3

/** `comodines[i]` is what team i won in the minigames; the team with the most starts (first one on a tie). */
export function newGame(sets: WordSet[], seconds: number, comodines: number[] = []): Game {
  const teams = sets.map((set, i) => ({
    ...set,
    status: set.words.map((): Status => 'pending'),
    index: 0,
    timeLeft: seconds * 1000,
    comodines: comodines[i] ?? 0,
  }))
  const turn = teams.reduce((best, t, i) => (t.comodines > teams[best].comodines ? i : best), 0)
  return { phase: 'playing', turn, runningSince: null, teams }
}

export const remaining = (g: Game, i: number, now = Date.now()) =>
  Math.max(0, g.teams[i].timeLeft - (i === g.turn && g.runningSince !== null ? now - g.runningSince : 0))

export const count = (t: Team, s: Status) => t.status.filter(x => x === s).length

export const isDone = (t: Team) => t.timeLeft <= 0 || !t.status.includes('pending')

/** Next pending letter after the current one (wrapping, may be itself), -1 if none. */
function nextPending(t: Team) {
  const n = t.status.length
  for (let k = 1; k <= n; k++) {
    const j = (t.index + k) % n
    if (t.status[j] === 'pending') return j
  }
  return -1
}

export function pause(g: Game, now = Date.now()): Game {
  if (g.runningSince === null) return g
  const teams = g.teams.map((t, i) => (i === g.turn ? { ...t, timeLeft: remaining(g, i, now) } : t))
  return { ...g, teams, runningSince: null }
}

export function start(g: Game, now = Date.now()): Game {
  if (g.phase === 'finished' || g.runningSince !== null || isDone(g.teams[g.turn])) return g
  return { ...g, runningSince: now }
}

/** Hands the turn to the next team that can still play, or finishes the game. */
export function passTurn(g: Game, now = Date.now()): Game {
  g = pause(g, now)
  const n = g.teams.length
  for (let k = 1; k <= n; k++) {
    const j = (g.turn + k) % n
    if (!isDone(g.teams[j])) return { ...g, turn: j }
  }
  return { ...g, phase: 'finished' }
}

/**
 * - correct: marks the letter, keeps the turn and the clock.
 * - pass: a wrong answer is also a pasapalabra; the letter stays pending and the turn moves on.
 * - comodin: "usar comodín" skips the letter without losing the turn; the comodín goes to the next team.
 */
export function answer(g: Game, result: 'correct' | 'pass' | 'comodin', now = Date.now()): Game {
  if (result === 'comodin' && g.teams[g.turn].comodines < 1) return g
  const running = g.runningSince !== null
  g = pause(g, now)
  const receiver = (g.turn + 1) % g.teams.length
  const teams = g.teams.map(t => ({ ...t, status: [...t.status] }))
  const t = teams[g.turn]
  if (result === 'correct') t.status[t.index] = 'correct'
  if (result === 'comodin') {
    t.comodines--
    teams[receiver].comodines++ // with a single team this hands it straight back, so nothing changes
  }
  const next = nextPending(t)
  if (next >= 0) t.index = next
  g = { ...g, teams }
  if (result !== 'pass' && !isDone(t)) return running ? start(g, now) : g
  return passTurn(g, now)
}

/** Ends the turn when the clock runs out. */
export const tick = (g: Game, now = Date.now()) =>
  g.runningSince !== null && remaining(g, g.turn, now) <= 0 ? passTurn(g, now) : g

/** Winner first: most correct answers, ties broken by more time left. */
export const ranking = (g: Game) =>
  g.teams
    .map((t, i) => ({ i, correct: count(t, 'correct'), timeLeft: remaining(g, i) }))
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
