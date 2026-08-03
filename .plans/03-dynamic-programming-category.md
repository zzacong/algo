# Dynamic Programming Category Plan

## Summary

Add a fully-built Dynamic Programming category to the algo. platform. Six algorithms ship with split-view canvas visualizations — a DP table on the left canvas and a per-algorithm secondary panel on the right canvas, both synced to the same frame index. The category is accessible at `/dp`.

---

## Decisions

| Decision               | Choice                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Algorithms (6)         | Fibonacci, Coin Change, LIS, Knapsack, LCS, Edit Distance                               |
| Base URL               | `/dp`                                                                                   |
| Route files            | `src/routes/dp/index.tsx`, `src/routes/dp/$id.tsx`                                      |
| Visualizer component   | `DPVisualizer` — two separate `<canvas>` elements, synced to the same `frameIndex`      |
| Left canvas            | DP table (1D row for Fibonacci/Coin Change/LIS; 2D grid for Knapsack/LCS/Edit Distance) |
| Right canvas           | Per-algorithm secondary (see table below)                                               |
| Detail page layout     | Visualizer-first: both canvases side-by-side at top, description + metadata table below |
| `categories.ts` update | `route: "/dp"`, `count: 6`, `status: "live"`                                            |

### Per-Algorithm Visualization

| Algorithm     | URL slug        | Left canvas | Right canvas (secondary)                           | Demo input                                                      |
| ------------- | --------------- | ----------- | -------------------------------------------------- | --------------------------------------------------------------- |
| Fibonacci     | `fibonacci`     | 1D memo row | Recursion tree (node/edge, reuses tree draw style) | `n = 8`                                                         |
| Coin Change   | `coin-change`   | 1D dp array | Dependency arrows (left-to-right highlights)       | coins `[1, 3, 4]`, amount `6`                                   |
| LIS           | `lis`           | 1D dp array | Active comparisons (highlight scanned elements)    | `[3, 1, 8, 2, 5]`                                               |
| Knapsack      | `knapsack`      | 2D table    | Current row + previous row highlight               | 4 items `[(w:2,v:3),(w:3,v:4),(w:4,v:5),(w:5,v:8)]`, capacity 5 |
| LCS           | `lcs`           | 2D table    | Dependency arrows (diagonal, up, left)             | `"ABCB"` vs `"BDCAB"`                                           |
| Edit Distance | `edit-distance` | 2D table    | Dependency arrows (diagonal, up, left)             | `"SUNDAY"` vs `"SATURDAY"`                                      |

---

## Routing Map

```
/dp               → DP sub-gallery (6 algorithm cards)
/dp/$id           → DP detail page
```

### TanStack Router file layout

```
src/routes/
  dp/
    index.tsx     (DP sub-gallery)
    $id.tsx       (DP detail page)
```

---

## Data Layer

**`src/data/dp.ts`**

- `DPAlgorithmId` union type: `"fibonacci" | "coin-change" | "lis" | "knapsack" | "lcs" | "edit-distance"`
- `DPSecondaryVariant` union type: `"recursion-tree" | "dependency-arrows" | "lis-scan" | "row-highlight"`
- `DPCell`: `{ value: number | null; state: "default" | "active" | "computed" | "current" | "highlight" }`
- `DPTableFrame`: `{ cells: DPCell[] | DPCell[][]; label?: string }` (1D or 2D)
- `DPSecondaryFrame`: variant-specific payload —
  - `RecursionTreeFrame`: `{ nodes: { id: number; label: string; state: "default" | "active" | "cached" }[]; edges: { from: number; to: number }[] }`
  - `DependencyArrowFrame`: `{ arrows: { fromRow: number; fromCol: number; toRow: number; toCol: number }[] }`
  - `LISScanFrame`: `{ comparing: number[]; accepted: number[] }`
  - `RowHighlightFrame`: `{ currentRow: number; prevRow: number }`
- `DPFrame`: `{ table: DPTableFrame; secondary: DPSecondaryFrame; stats: Record<string, string> }`
- `DPAlgorithm` interface: `id`, `name`, `description`, `stats` (flexible key/value rows), `variant: DPSecondaryVariant`, `frames: DPFrame[]`
- Export `DP_ALGORITHMS: DPAlgorithm[]` and `getDPAlgorithm(id: DPAlgorithmId): DPAlgorithm`

### Frame generators (all in `src/data/dp.ts`)

Each generator produces the full `DPFrame[]` sequence using the fixed demo input.

1. **Fibonacci** — iterative memoization fill, each step computes `fib(i)` and adds a recursion tree node
2. **Coin Change** — bottom-up 1D table fill, each cell shows which coin was used
3. **LIS** — O(n²) DP, each step scans left for valid predecessors
4. **Knapsack** — 2D table fill row by row, each step highlights the current and previous row
5. **LCS** — 2D table fill, each step shows the 3-way dependency arrows
6. **Edit Distance** — 2D table fill, each step shows the 3-way dependency arrows

---

## Visualizer Component

**`src/components/dp-visualizer.tsx`**

### Props

```ts
interface DPVisualizerProps {
  frames: DPFrame[];
  variant: DPSecondaryVariant;
  fps?: number; // default 4 (DP tables fill slowly for readability)
  size?: "sm" | "lg"; // default "lg"
}
```

### Architecture

- Single React component, two `useRef<HTMLCanvasElement>` refs (table canvas + secondary canvas).
- One shared `rAF` loop managing a single `frameIndex`, advancing at `fps` rate.
- Both canvases draw on every tick from the same `frameIndex`.
- Pause-and-loop at end of frames (~800ms pause, reset to 0).
- `useEffect` cleanup cancels `rAF` handle.
- `size="sm"`: both canvases ~80px tall, side by side.
- `size="lg"`: both canvases ~260px tall, side by side, full width split 50/50.
- Wrapper div `aria-hidden="true"`.

### Left canvas — Table renderer

- **1D**: render a single row of `DPCell` boxes with value labels. Color per state:
  - `default` → surface color
  - `active` → accent (currently being computed)
  - `computed` → muted green
  - `current` → primary
  - `highlight` → secondary
- **2D**: render a grid of `DPCell` boxes. Row/column header labels from algorithm metadata. Same state colors.
- Cell values shown as numbers (hidden at `size="sm"` if too small).

### Right canvas — Secondary renderer (variant-specific draw functions)

- **`recursion-tree`**: draw nodes as circles with call labels (`fib(3)` etc.), edges as lines. Node states: `default` (grey), `active` (accent), `cached` (muted). Same layout algorithm as `TreeVisualizer` (level-order positioning).
- **`dependency-arrows`**: re-render a mini version of the 2D table with animated arrows pointing from dependency cells to the current cell. Arrow color matches the accent.
- **`lis-scan`**: render the input array as boxes; highlight `comparing` indices in accent and `accepted` indices in green.
- **`row-highlight`**: render the 2D table (same as left canvas) with the `currentRow` cells in accent and `prevRow` cells in a muted highlight — shows the "look up one row" dependency directly.

---

## Detail Page Layout

**`src/routes/dp/$id.tsx`**

```
┌─────────────────────────────────────────────────┐
│  ← Back to Dynamic Programming                  │
│  Algorithm Name                                 │
├────────────────────┬────────────────────────────┤
│  Table canvas (lg) │  Secondary canvas (lg)     │
│  (left, 50%)       │  (right, 50%)              │
├─────────────────────────────────────────────────┤
│  Description text                               │
│  Metadata table (key/value rows)                │
└─────────────────────────────────────────────────┘
```

- On mobile: canvases stack vertically (table first, secondary second), then description.
- Back link → `/dp`.
- Invalid `id` → "not found" message with link back to `/dp`.

---

## Sub-Gallery Page

**`src/routes/dp/index.tsx`**

- Mirrors the structure of `/sorting/index.tsx` and `/pathfinding/index.tsx`.
- 6 algorithm cards in a responsive grid.
- Each card: algorithm name, key stat badge, `<DPVisualizer size="sm" />` preview.
- Card links to `/dp/$id`.

---

## Sub-Tasks

---

### Sub-Task 1 — Data layer (`src/data/dp.ts`)

**Intent**
Implement all types, frame generators, and exports for the 6 DP algorithms.

**Todo List**

1. Create `src/data/dp.ts`.
2. Define all types: `DPAlgorithmId`, `DPSecondaryVariant`, `DPCell`, `DPTableFrame`, all `DPSecondaryFrame` variants, `DPFrame`, `DPAlgorithm`.
3. Implement Fibonacci frame generator (1D memo row + recursion tree frames).
4. Implement Coin Change frame generator (1D dp + dependency arrows).
5. Implement LIS frame generator (1D dp + lis-scan frames).
6. Implement Knapsack frame generator (2D table + row-highlight frames).
7. Implement LCS frame generator (2D table + dependency arrows).
8. Implement Edit Distance frame generator (2D table + dependency arrows).
9. Assemble `DP_ALGORITHMS` array with `id`, `name`, `description`, `stats`, `variant`, `frames` for each.
10. Export `getDPAlgorithm(id)` helper.

**Status:** [x] complete

---

### Sub-Task 2 — `DPVisualizer` component (`src/components/dp-visualizer.tsx`)

**Intent**
Build the split-view canvas component with two synced canvases.

**Todo List**

1. Create `src/components/dp-visualizer.tsx`.
2. Define props interface (`frames`, `variant`, `fps`, `size`).
3. Set up two `useRef<HTMLCanvasElement>` refs and one shared `rAF` loop.
4. Implement the 1D table renderer (left canvas).
5. Implement the 2D table renderer (left canvas, shared with 1D path).
6. Implement `recursion-tree` secondary renderer (right canvas).
7. Implement `dependency-arrows` secondary renderer (right canvas).
8. Implement `lis-scan` secondary renderer (right canvas).
9. Implement `row-highlight` secondary renderer (right canvas).
10. Wire variant prop to the correct secondary renderer.
11. Handle `size="sm"` / `size="lg"` sizing for both canvases.
12. Pause-and-loop at end of frames.
13. `useEffect` cleanup for `cancelAnimationFrame`.

**Status:** [x] complete

---

### Sub-Task 3 — Update `categories.ts`

**Intent**
Mark the Dynamic Programming category as live with the correct route and count.

**Todo List**

1. Update the `dynamic-programming` entry in `src/data/categories.ts`: set `route: "/dp"`, `count: 6`, `status: "live"`.

**Status:** [x] complete

---

### Sub-Task 4 — Route scaffolds

**Intent**
Create the TanStack Router route files for the DP category.

**Todo List**

1. Create `src/routes/dp/index.tsx` — DP sub-gallery page (6 cards, `DPVisualizer size="sm"`).
2. Create `src/routes/dp/$id.tsx` — DP detail page (visualizer-first layout, metadata below).
3. Run `pnpm dev` to trigger route tree regeneration; verify routes resolve.

**Status:** [x] complete

---

### Sub-Task 5 — Validation

**Intent**
Ensure everything passes checks and looks correct.

**Todo List**

1. Run `pnpm check` (fmt + typecheck + lint) — zero errors.
2. Smoke-test `/dp`, `/dp/fibonacci`, `/dp/coin-change`, `/dp/lis`, `/dp/knapsack`, `/dp/lcs`, `/dp/edit-distance`.
3. Verify homepage category tile for Dynamic Programming now links to `/dp` and shows as live.
4. Verify `size="sm"` previews animate correctly on the sub-gallery cards.
5. Verify `size="lg"` split-view renders correctly on detail pages.
6. Verify dark mode on all new pages.

**Status:** [x] complete

---

## Implementation Order

```
Sub-Task 1 (data layer)
  → Sub-Task 2 (DPVisualizer component)
    → Sub-Task 3 (categories.ts update)
    → Sub-Task 4 (route files)
      → Sub-Task 5 (validation)
```

Sub-Tasks 3 and 4 can run in parallel after Sub-Task 2.
