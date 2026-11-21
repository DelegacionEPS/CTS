import fs from 'node:fs/promises'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'

// Tiny backend, shared by the Vite server (bun dev / preview) and the Vercel functions in ./api:
//   GET  /api/state       current game state, POST to replace it
//   GET  /api/sets        every word set as { id: set }
//   PUT  /api/sets/<id>   save a set, DELETE to remove it
// With Upstash Redis env vars (Vercel → Storage → Upstash, free) everything lives in Redis.
// Without them: sets are JSON files in ./sets and the game lives in memory (restart = reset).
// ponytail: last write wins, fine with one presenter + one admin; add a server-side reducer if more people edit at once.

type Store = {
  getState(): Promise<string>
  setState(json: string): Promise<void>
  sets(): Promise<Record<string, string>>
  putSet(id: string, json: string): Promise<void>
  delSet(id: string): Promise<void>
}

const redisUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

async function redis(...command: string[]) {
  const res = await fetch(redisUrl!, { method: 'POST', headers: { Authorization: `Bearer ${redisToken}` }, body: JSON.stringify(command) })
  const { result, error } = await res.json()
  if (error) throw new Error(error)
  return result
}

const redisStore: Store = {
  getState: async () => (await redis('GET', 'rosco:state')) ?? 'null',
  setState: json => redis('SET', 'rosco:state', json),
  sets: async () => {
    const flat: string[] = await redis('HGETALL', 'rosco:sets')
    return Object.fromEntries(flat.flatMap((v, i) => (i % 2 ? [] : [[v, flat[i + 1]]])))
  },
  putSet: (id, json) => redis('HSET', 'rosco:sets', id, json),
  delSet: id => redis('HDEL', 'rosco:sets', id),
}

const dir = path.resolve('sets')
let memoryState = 'null'
const fileStore: Store = {
  getState: async () => memoryState,
  setState: async json => void (memoryState = json),
  sets: async () => {
    await fs.mkdir(dir, { recursive: true })
    const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json'))
    return Object.fromEntries(await Promise.all(files.map(async f => [f.slice(0, -5), await fs.readFile(path.join(dir, f), 'utf8')])))
  },
  putSet: (id, json) => fs.writeFile(path.join(dir, `${id}.json`), json + '\n'),
  delSet: id => fs.rm(path.join(dir, `${id}.json`), { force: true }),
}

const store = redisUrl && redisToken ? redisStore : fileStore

const isSet = (s: any) => s && typeof s.name === 'string' && typeof s.color === 'string' && Array.isArray(s.words)

async function body(req: Request) {
  const text = await req.text()
  if (text.length > 1_000_000) throw new Error('Too big')
  return JSON.parse(text)
}

export async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url).pathname
  try {
    if (url === '/api/state' && req.method === 'POST') {
      await store.setState(JSON.stringify(await body(req)))
      return new Response()
    }
    if (url === '/api/state') return Response.json(JSON.parse(await store.getState()), { headers: { 'Cache-Control': 'no-store' } })
    if (url === '/api/sets') {
      const sets = Object.entries(await store.sets()).map(([id, text]) => {
        try {
          return [id, JSON.parse(text)]
        } catch {
          // A broken hand-edited file shows up as an invalid set instead of hiding all the others.
          return [id, { name: `${id}.json (JSON inválido)`, color: '#888888', words: [] }]
        }
      })
      return Response.json(Object.fromEntries(sets), { headers: { 'Cache-Control': 'no-store' } })
    }
    const id = url.match(/^\/api\/sets\/([a-z0-9-]+)$/)?.[1]
    if (id && req.method === 'PUT') {
      const set = await body(req)
      if (!isSet(set)) throw new Error('Rosco inválido')
      await store.putSet(id, JSON.stringify(set, null, 2))
      return new Response()
    }
    if (id && req.method === 'DELETE') {
      await store.delSet(id)
      return new Response()
    }
    return new Response(null, { status: 404 })
  } catch (e) {
    return new Response(String(e), { status: 400 })
  }
}

/** Serves handle() from the Vite dev and preview servers. */
export function gameApi(): Plugin {
  const api: Connect.NextHandleFunction = async (req, res, next) => {
    if (!req.url?.startsWith('/api/')) return next()
    const chunks: Buffer[] = []
    for await (const chunk of req) chunks.push(chunk)
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
    const out = await handle(new Request(`http://localhost${req.url}`, { method: req.method, body: hasBody ? Buffer.concat(chunks) : undefined }))
    res.writeHead(out.status, Object.fromEntries(out.headers))
    res.end(Buffer.from(await out.arrayBuffer()))
  }
  return {
    name: 'game-api',
    configureServer: server => void server.middlewares.use(api),
    configurePreviewServer: server => void server.middlewares.use(api),
  }
}
