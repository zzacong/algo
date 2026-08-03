# learn-sort

An interactive visualiser for 8 classic sorting algorithms, built with React, TypeScript, Vite, TanStack Router, and Tailwind CSS v4.

## Algorithms

| Algorithm      | Avg         | Worst      | Space    |
| -------------- | ----------- | ---------- | -------- |
| Bubble Sort    | O(n²)       | O(n²)      | O(1)     |
| Selection Sort | O(n²)       | O(n²)      | O(1)     |
| Insertion Sort | O(n²)       | O(n²)      | O(1)     |
| Merge Sort     | O(n log n)  | O(n log n) | O(n)     |
| Quick Sort     | O(n log n)  | O(n²)      | O(log n) |
| Heap Sort      | O(n log n)  | O(n log n) | O(1)     |
| Shell Sort     | O(n log² n) | O(n²)      | O(1)     |
| Counting Sort  | O(n+k)      | O(n+k)     | O(k)     |

Each algorithm sorts the same 12-element seed array `[7, 3, 11, 1, 9, 4, 12, 6, 2, 10, 5, 8]` and emits a frame-by-frame snapshot of the array after every swap or placement. The gallery page animates all previews simultaneously; clicking a card opens a full-screen step-by-step view.

## Tech stack

- **React 19** + **TypeScript 6**
- **Vite 8** with `@vitejs/plugin-react`
- **TanStack Router** (file-based routing, auto-generated route tree)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **shadcn/ui** components (`Button`) via `components.json`
- **Base UI** (`@base-ui/react`) for accessible primitives
- **Inter** variable font (`@fontsource-variable/inter`)
- **oxlint** + **oxfmt** for linting and formatting

## Getting started

```bash
pnpm install
pnpm dev        # start dev server
```

## Scripts

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `pnpm dev`       | Start the Vite dev server     |
| `pnpm build`     | Type-check + production build |
| `pnpm preview`   | Preview the production build  |
| `pnpm lint`      | Run oxlint                    |
| `pnpm fmt`       | Format with oxfmt             |
| `pnpm fmt:check` | Check formatting (CI)         |
| `pnpm typecheck` | Run `tsc --noEmit`            |
| `pnpm check`     | fmt:check + typecheck + lint  |

## Project structure

```
src/
  data/algorithms.ts        # algorithm implementations + metadata
  components/
    SortVisualizer.tsx      # animated bar-chart visualiser
    ThemeToggle.tsx         # light/dark toggle
    theme-provider.tsx      # React context for theme
    ui/                     # shadcn/ui components
  routes/
    __root.tsx              # root layout (theme provider, keyboard shortcut)
    index.tsx               # gallery page (all algorithm cards)
    algorithm.$id.tsx       # detail page (full animation + complexity)
  main.tsx
```

## Adding shadcn components

```bash
npx shadcn@latest add <component>
```

Components are placed in `src/components/ui/`.
