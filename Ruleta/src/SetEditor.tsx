import { useState, type CSSProperties } from 'react'
import { validate, type Word, type WordSet } from './game'

// The classic TV rosco: no K and no W.
const ALPHABET = 'ABCDEFGHIJLMNÑOPQRSTUVXYZ'

export const blankSet = (): WordSet => ({
  name: 'Nuevo rosco',
  color: '#22c55e',
  words: [...ALPHABET].map(letter => ({ letter, question: '', answer: '' })),
})

type Props = { initial: WordSet; onSave: (set: WordSet) => void; onCancel: () => void }

export function SetEditor({ initial, onSave, onCancel }: Props) {
  const [set, setSet] = useState(initial)
  const editWord = (i: number, patch: Partial<Word>) =>
    setSet(s => ({ ...s, words: s.words.map((w, j) => (j === i ? { ...w, ...patch } : w)) }))
  const moveWord = (i: number, by: number) =>
    setSet(s => {
      const words = [...s.words]
      const j = i + by
      if (j < 0 || j >= words.length) return s
      ;[words[i], words[j]] = [words[j], words[i]]
      return { ...s, words }
    })
  const problems = validate(set)

  return (
    <section className="card editor" style={{ '--team': set.color } as CSSProperties}>
      <div className="row editor-head">
        <input type="color" value={set.color} onChange={e => setSet({ ...set, color: e.target.value })} aria-label="Color" />
        <input className="name-input" value={set.name} onChange={e => setSet({ ...set, name: e.target.value })} placeholder="Nombre del rosco" />
      </div>

      <table className="words">
        <thead>
          <tr>
            <th>Letra</th>
            <th title="«Contiene la…» en vez de «Empieza por…»">Contiene</th>
            <th>Definición</th>
            <th>Respuesta</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {set.words.map((w, i) => (
            <tr key={i}>
              <td>
                <input className="letter-input" value={w.letter} maxLength={1} onChange={e => editWord(i, { letter: e.target.value.toUpperCase() })} />
              </td>
              <td>
                <input type="checkbox" checked={!!w.contains} onChange={e => editWord(i, { contains: e.target.checked || undefined })} />
              </td>
              <td>
                <input value={w.question} onChange={e => editWord(i, { question: e.target.value })} />
              </td>
              <td>
                <input value={w.answer} onChange={e => editWord(i, { answer: e.target.value })} />
              </td>
              <td className="row-actions">
                <button className="icon" onClick={() => moveWord(i, -1)} title="Subir">↑</button>
                <button className="icon" onClick={() => moveWord(i, 1)} title="Bajar">↓</button>
                <button className="icon" onClick={() => setSet({ ...set, words: set.words.filter((_, j) => j !== i) })} title="Quitar">✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn ghost" onClick={() => setSet({ ...set, words: [...set.words, { letter: '', question: '', answer: '' }] })}>
        + Añadir palabra
      </button>

      {problems.map(p => (
        <span key={p} className="warning">⚠ {p}</span>
      ))}
      <div className="row">
        <button className="btn ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn correct" onClick={() => onSave(set)}>Guardar rosco</button>
      </div>
    </section>
  )
}
