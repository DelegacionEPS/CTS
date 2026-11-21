# Marcadores · scoring

The scores of the four teams, stored in Convex and updated live on every screen.

| URL        | Who it's for                                                                  |
| ---------- | ----------------------------------------------------------------------------- |
| `/`        | Projector: the four teams and their points                                    |
| `/#/admin` | Control panel (password): +n / −n per team and ↶ undo the latest change |

Live at **https://scoring-delegacion.vercel.app** (Convex project `scoring-delegacion`, prod deployment `affable-alpaca-901`).

- Every change is saved as an event; the totals are their sum, and **Undo** deletes the latest event. Undo can be pressed several times.
- The password is **not** in the frontend. It is the `ADMIN_PASSWORD` env var in Convex, and Convex checks it on every change.
- Team names and colours can be edited in the admin panel and are saved in Convex. Change them with the colour picker, or paste a `#rrggbb` code, e.g. one copied from the rosco's colour picker. The defaults (the rosco's default teams) are in `convex/teams.ts`.
- To reset the scores, clear the `events` table in the Convex dashboard (Data → events → Clear table).

## Running locally

```bash
cd scoring
bun install
bun run convex     # 1st terminal: logs in, connects to the Convex dev deployment and writes .env.local
bun dev            # 2nd terminal: http://localhost:5173 (and /#/admin)
```

The first time on a new computer, `bun run convex` asks which project to use: choose the existing `scoring-delegacion`.
Then set the password in the dev deployment:

```bash
npx convex env set ADMIN_PASSWORD steamdeck
```

Local runs use the **dev** deployment (`glad-peccary-623`), so they never touch the real scores.

## Deploying (Vercel + Convex)

The frontend (Vercel) and the backend (Convex) are deployed separately:

1. **Convex backend** (only when something in `convex/` changes):

   ```bash
   npx convex deploy                                   # pushes the functions to prod
   npx convex env set --prod ADMIN_PASSWORD steamdeck  # only the first time, or to change the password
   ```

2. **Vercel frontend.** The Vercel project `scoring-delegacion` (team astrak-projects) already has
   `VITE_CONVEX_URL=https://affable-alpaca-901.convex.cloud` set for Production.

   ```bash
   vercel deploy --prod
   ```

   For a fresh Vercel project, run `vercel link`, then add the variable
   (`vercel env add VITE_CONVEX_URL production`, with the URL that `npx convex deploy` prints), then deploy.

   For Git deploys instead (Vercel dashboard → import the repo with *Root Directory* `scoring`): commit `convex/_generated`
   (it is already committed) and keep deploying Convex by hand with step 1.
