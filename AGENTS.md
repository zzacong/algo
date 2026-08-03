# AGENTS.md

This file provides instructions for agents working in this repository.

## File naming

### Components

New component files must use **kebab-case**:

```
src/components/sort-visualizer.tsx   ✅
src/components/SortVisualizer.tsx    ❌
```

This applies to all files under `src/components/`, including subdirectories
such as `src/components/ui/`. The exported React component itself should still
use PascalCase as required by React, only the file name is kebab-case.

```tsx
// src/components/algorithm-card.tsx
export function AlgorithmCard() { ... }
```

### Routes

Route files follow **TanStack Router's file-based routing conventions** and
must not be renamed — e.g. `index.tsx`, `__root.tsx`,
`algorithm.$id.tsx`.

### Other files

All other new files (utilities, data, hooks, etc.) should use **kebab-case**
as well (`src/lib/use-theme.ts`, `src/data/algorithms.ts`).

## Tech stack

- **React 19** + **TypeScript 6**
- **Vite 8** — dev server and bundler
- **TanStack Router** — file-based routing; route tree is auto-generated at
  `src/routeTree.gen.ts` (do not edit manually)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **shadcn/ui** — add components with `npx shadcn@latest add <component>`;
  they land in `src/components/ui/`
- **Base UI** (`@base-ui/react`) — accessible primitives
- **oxlint** + **oxfmt** — linting and formatting

## Development

```bash
pnpm install
pnpm dev          # start dev server
pnpm check        # fmt:check + typecheck + lint (run before committing)
pnpm build        # production build
```
