# AGENTS.md

## Cursor Cloud specific instructions

This is a Vite + React + TypeScript frontend-only SPA (no backend, no database, no auth). All state lives in React context and `localStorage`.

### Quick reference

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 8080) |
| Lint | `npm run lint` |
| Test | `npm run test` |
| Build | `npm run build` |

### Notes

- The dev server binds to `::` on port **8080** (configured in `vite.config.ts`).
- ESLint currently reports ~50 pre-existing errors (mostly `@typescript-eslint/no-explicit-any` in Fabric.js canvas code). These are not regressions.
- Tests use **Vitest** with jsdom. The test setup file is at `src/test/setup.ts`.
- The project uses **shadcn/ui** components (Radix primitives); component config is in `components.json`.
- Both `package-lock.json` and `bun.lock`/`bun.lockb` exist; use **npm** as the canonical package manager.
