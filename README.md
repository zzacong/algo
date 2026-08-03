# algo.

A visual learning platform for algorithms — sorting, pathfinding, trees, and more. Each algorithm is animated step by step with complexity and metadata breakdowns.

Built with React, TypeScript, Vite, TanStack Router, and Tailwind CSS v4.

## Categories

### Sorting (8 algorithms)

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

### Pathfinding (4 algorithms)

BFS, DFS, Dijkstra, A\* — visualised on a 2D grid showing visited cells and the discovered path.

### Trees (4 operations)

BST Insert, BST Search, BST Delete, AVL Rotation — visualised as animated node/edge diagrams.

### Coming Soon

Graph algorithms, Dynamic Programming, Searching.

## Tech stack

- **React 19** + **TypeScript 6**
- **Vite 8** with `@vitejs/plugin-react`
- **TanStack Router** (file-based routing, auto-generated route tree)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **shadcn/ui** components via `components.json`
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
  data/
    algorithms.ts         # sorting algorithm implementations + metadata
    pathfinding.ts        # pathfinding algorithm implementations + metadata
    trees.ts              # tree operation implementations + metadata
    categories.ts         # top-level category definitions
  components/
    sort-visualizer.tsx   # animated bar-chart visualiser
    grid-visualizer.tsx   # animated 2D grid visualiser (pathfinding)
    tree-visualizer.tsx   # animated node/edge visualiser (trees)
    theme-toggle.tsx      # light/dark toggle
    theme-provider.tsx    # React context for theme
    ui/                   # shadcn/ui components
  routes/
    __root.tsx            # root layout (theme provider, keyboard shortcut)
    index.tsx             # homepage — category selector
    sorting/
      index.tsx           # sorting sub-gallery
      $id.tsx             # sorting detail page
    pathfinding/
      index.tsx           # pathfinding sub-gallery
      $id.tsx             # pathfinding detail page
    trees/
      index.tsx           # trees sub-gallery
      $id.tsx             # trees detail page
  main.tsx
```

## Adding shadcn components

```bash
npx shadcn@latest add <component>
```

Components are placed in `src/components/ui/`.
