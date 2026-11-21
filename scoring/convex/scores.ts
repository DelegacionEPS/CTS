import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { TEAMS } from './teams'

/** The admin password lives in the Convex env var ADMIN_PASSWORD, never in the frontend bundle. */
function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) throw new ConvexError('Falta ADMIN_PASSWORD en Convex (npx convex env set ADMIN_PASSWORD ...)')
  if (password !== expected) throw new ConvexError('Contraseña incorrecta')
}

function validTeam(team: number) {
  if (!Number.isInteger(team) || team < 0 || team >= TEAMS.length) throw new ConvexError('Equipo inválido')
}

/** Teams, totals per team, plus the latest change so the admin can see what undo will revert. */
// ponytail: sums every event on each read; fine for a night of scoring (thousands of rows), keep running totals if it grows past that.
export const get = query({
  args: {},
  handler: async ctx => {
    const events = await ctx.db.query('events').collect()
    const totals = TEAMS.map(() => 0)
    for (const e of events) totals[e.team] += e.delta
    const edited = await ctx.db.query('teams').collect()
    const teams = TEAMS.map((t, i) => {
      const row = edited.find(r => r.team === i)
      return row ? { name: row.name, color: row.color } : t
    })
    return { teams, totals, last: events.at(-1) ?? null, count: events.length }
  },
})

export const login = query({
  args: { password: v.string() },
  handler: async (_ctx, { password }) => {
    checkPassword(password)
    return true
  },
})

export const add = mutation({
  args: { password: v.string(), team: v.number(), delta: v.number() },
  handler: async (ctx, { password, team, delta }) => {
    checkPassword(password)
    validTeam(team)
    if (!Number.isFinite(delta) || delta === 0) throw new ConvexError('Cantidad inválida')
    await ctx.db.insert('events', { team, delta })
  },
})

export const setTeam = mutation({
  args: { password: v.string(), team: v.number(), name: v.string(), color: v.string() },
  handler: async (ctx, { password, team, name, color }) => {
    checkPassword(password)
    validTeam(team)
    name = name.trim().slice(0, 40)
    if (!name) throw new ConvexError('Falta el nombre')
    if (!/^#[0-9a-f]{6}$/i.test(color)) throw new ConvexError('Color inválido: usa el formato #rrggbb')
    const row = await ctx.db.query('teams').withIndex('by_team', q => q.eq('team', team)).unique()
    if (row) await ctx.db.patch(row._id, { name, color })
    else await ctx.db.insert('teams', { team, name, color })
  },
})

export const undo = mutation({
  args: { password: v.string() },
  handler: async (ctx, { password }) => {
    checkPassword(password)
    const last = await ctx.db.query('events').order('desc').first()
    if (last) await ctx.db.delete(last._id)
    return last
  },
})
