// Uploads every sets/*.json to a running Ruleta, e.g. the Vercel deploy:
//   bun run seed https://tu-rosco.vercel.app
import fs from 'node:fs/promises'

const base = process.argv[2]?.replace(/\/$/, '')
if (!base) throw new Error('Uso: bun run seed <url>')
for (const f of (await fs.readdir('sets')).filter(f => f.endsWith('.json'))) {
  const res = await fetch(`${base}/api/sets/${f.slice(0, -5)}`, { method: 'PUT', body: await fs.readFile(`sets/${f}`) })
  console.log(res.ok ? '✓' : `✗ ${await res.text()}`, f)
}
