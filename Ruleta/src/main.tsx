import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Admin } from './Admin'
import { Player } from './Player'
import { Presenter } from './Presenter'
import './styles.css'

// Anything that isn't admin or presenter shows the players' screen.
const VIEWS: Record<string, () => React.JSX.Element> = { '#/admin': Admin, '#/presentador': Presenter }

function App() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const onHash = () => setHash(location.hash)
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])
  const View = VIEWS[hash] ?? Player
  return <View />
}

createRoot(document.getElementById('root')!).render(<App />)
