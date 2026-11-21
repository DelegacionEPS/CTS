import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Admin } from './Admin'
import { Board } from './Board'
import './styles.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

function App() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const onHash = () => setHash(location.hash)
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])
  return hash === '#/admin' ? <Admin /> : <Board />
}

createRoot(document.getElementById('root')!).render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>,
)
