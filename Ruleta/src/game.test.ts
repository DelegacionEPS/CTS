// Run with `bun run test`.
import assert from 'node:assert/strict'
import { answer, newGame, passTurn, ranking, remaining, start, tick, validate, type WordSet } from './game.ts'

const set = (letters: string): WordSet => ({
  name: 'x',
  color: '#000',
  words: [...letters].map(letter => ({ letter, question: '?', answer: letter + 'aaa' })),
})
const sets = [set('ABC'), set('ABC')]

let g = start(newGame(sets, 10), 0)
assert.equal(remaining(g, 0, 4000), 6000)

g = answer(g, 'correct', 1000) // keeps turn and clock
assert.deepEqual([g.turn, g.teams[0].index, g.teams[0].status[0], g.runningSince], [0, 1, 'correct', 1000])

g = answer(g, 'pass', 2000) // stops clock, turn to team b
assert.deepEqual([g.turn, g.teams[0].index, g.teams[0].timeLeft, g.runningSince], [1, 2, 8000, null])

g = answer(g, 'pass', 2000) // b fails A: letter stays pending, back to a
assert.deepEqual([g.turn, g.teams[1].status[0], g.teams[1].index], [0, 'pending', 1])

g = answer(answer(g, 'correct'), 'correct') // a finishes C, then wraps back to the passed B
assert.deepEqual([g.teams[0].status, g.turn], [['correct', 'correct', 'correct'], 1])

g = tick(start(g, 0), 10_000) // b runs out of time, nobody left
assert.equal(g.phase, 'finished')
assert.equal(ranking(g)[0].i, 0)

// a single team keeps the turn after passing
const solo = answer(newGame([sets[0]], 10), 'pass')
assert.deepEqual([solo.turn, solo.teams[0].index, solo.phase], [0, 1, 'playing'])
assert.equal(passTurn(newGame([sets[0]], 0)).phase, 'finished')

// comodines: most comodines starts; using one skips the letter, keeps turn + clock, and gives it to the next team
let f = start(newGame(sets, 10, [1, 2]), 0)
assert.equal(f.turn, 1)
f = answer(f, 'comodin', 1000)
assert.deepEqual([f.turn, f.teams[1].index, f.teams[1].status[0], f.runningSince], [1, 1, 'pending', 1000])
assert.deepEqual(f.teams.map(t => t.comodines), [2, 1])
f = answer(answer(f, 'comodin', 2000), 'comodin', 3000) // the second one is refused: no comodines left
assert.deepEqual([f.teams.map(t => t.comodines), f.teams[1].index], [[3, 0], 2])
assert.equal(newGame(sets, 10, [2, 2]).turn, 0) // tie: first team starts

assert.deepEqual(validate(set('AB')), [])
const bad: WordSet = {
  name: 'x',
  color: '#000',
  words: [
    { letter: 'Ñ', question: '?', answer: 'Ñandú' },
    { letter: 'Ñ', contains: true, question: '?', answer: 'Montaña' },
    { letter: 'A', question: '?', answer: 'Árbol' },
    { letter: 'Ñ', question: '?', answer: 'Nilo' },
  ],
}
assert.equal(validate(bad).length, 1)
console.log('ok')
