import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Every change to a score. Totals are the sum of these; undo deletes the latest one.
  events: defineTable({ team: v.number(), delta: v.number() }),
  // Name/colour edited from the admin panel; a team without a row uses the default in teams.ts.
  teams: defineTable({ team: v.number(), name: v.string(), color: v.string() }).index('by_team', ['team']),
})
