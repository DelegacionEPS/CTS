// Run with `bun run test`.
import assert from 'node:assert/strict'
import { answer, count, mark, newGame, passTurn, ranking, remaining, start, tick, validate, type WordSet } from './game.ts'

const set = (letters: string): WordSet => ({
  name: 'x',
  color: '#000',
  words: [...letters].map(letter => ({ letter, question: '?', answer: letter + 'aaa' })),
})
const abc = set('ABC')
const players = (...comodines: number[]) => comodines.map((c, i) => ({ name: 't' + i, color: '#000', comodines: c }))

let g = start(newGame(abc, players(0, 0), 10), 0)
assert.equal(remaining(g, 0, 4000), 6000)

g = answer(g, 'correct', 1000) // team 0 owns A, keeps turn and clock, next letter
assert.deepEqual([g.turn, g.index, g.owner, g.runningSince], [0, 1, [0, null, null], 1000])

g = answer(g, 'pass', 2000) // wrong: B stays pending, clock stops, turn to team 1 on the next letter
assert.deepEqual([g.turn, g.index, g.teams[0].timeLeft, g.runningSince, g.owner[1]], [1, 2, 8000, null, null])

g = answer(g, 'correct', 2000) // team 1 gets C: its colour/owner is 1
assert.deepEqual(g.owner, [0, null, 1])
g = answer(g, 'correct') // ...and goes back to B (wrapping), getting it too
assert.deepEqual([g.owner, g.phase, count(g, 1)], [[0, 1, 1], 'finished', 2])
assert.equal(ranking(g)[0].i, 1)

// admin marking the letter being asked moves on to the next one; other letters leave it alone
let m = mark(newGame(abc, players(0, 0), 10), 0, 0)
assert.deepEqual([m.owner, m.index], [[0, null, null], 1])
assert.equal(mark(m, 2, 1).index, 1)
assert.equal(mark(m, 0, null).index, 1) // un-marking doesn't move it

// time runs out: turn moves on, and the game ends when nobody can play
g = start(newGame(abc, players(0, 0), 10), 0)
g = tick(g, 10_000)
assert.deepEqual([g.turn, g.phase], [1, 'playing'])
g = tick(start(g, 0), 10_000)
assert.equal(g.phase, 'finished')

// a single team keeps the turn after passing
const solo = answer(newGame(abc, players(0), 10), 'pass')
assert.deepEqual([solo.turn, solo.index, solo.phase], [0, 1, 'playing'])
assert.equal(passTurn(newGame(abc, players(0), 0)).phase, 'finished')

// four teams, one rosco: a correct answer is owned only by that team
const four = answer(newGame(abc, players(0, 0, 0, 0), 10), 'correct')
assert.deepEqual([four.teams.length, four.owner], [4, [0, null, null]])

// comodines: most comodines starts; using one skips the letter, keeps turn + clock, and gives it to the next team
let f = start(newGame(abc, players(1, 2), 10), 0)
assert.equal(f.turn, 1)
f = answer(f, 'comodin', 1000)
assert.deepEqual([f.turn, f.index, f.owner[0], f.runningSince], [1, 1, null, 1000])
assert.deepEqual(f.teams.map(t => t.comodines), [2, 1])
f = answer(answer(f, 'comodin', 2000), 'comodin', 3000) // the second one is refused: no comodines left
assert.deepEqual([f.teams.map(t => t.comodines), f.index], [[3, 0], 2])
assert.equal(newGame(abc, players(2, 2), 10).turn, 0) // tie: first team starts

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
