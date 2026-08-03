# algo. — Rebrand & Platform Expansion Plan

## Summary

Lift the site from a single-purpose sorting visualiser into a full algorithm learning platform. The brand becomes **`algo.`** The homepage becomes a category selector. Three categories ship fully built (Sorting, Pathfinding, Trees); three more are decorative "coming soon" placeholders (Graph, Dynamic Programming, Searching).

---

## Decisions

| Decision | Choice |
|---|---|
| Brand name | `algo.` |
| Top-level nav | Category landing pages |
| Launch categories (full) | Sorting, Pathfinding, Trees |
| Launch categories (placeholder) | Graph, Dynamic Programming, Searching |
| URL shape | Category-scoped: `/sorting/bubble-sort`, `/pathfinding/dijkstra`, `/trees/bst-insert` |
| Old `/algorithm/$id` route | Removed — no redirect |
| Detail page layout | Unified template, flexible per-algorithm metadata rows |
| Pathfinding visualizer | `GridVisualizer` — 2D grid canvas, same frames/fps pattern |
| Tree visualizer | `TreeVisualizer` — node/edge canvas, same frames/fps pattern |
| Coming soon tiles | Pure decorative placeholder, no interaction |
| In-repo branding | `<title>`, site header, `README.md`, `package.json` name |

---

## Routing Map

```
/                          → Homepage: category selector grid
/sorting                   → Sorting sub-gallery (8 algorithm cards)
/sorting/$id               → Sorting detail page
/pathfinding               → Pathfinding sub-gallery (4 algorithm cards)
/pathfinding/$id           → Pathfinding detail page
/trees                     → Trees sub-gallery (4 algorithm cards)
/trees/$id                 → Trees detail page
```

Old route `/algorithm/$id` is deleted.

### TanStack Router file layout

```
src/routes/
  __root.tsx               (unchanged — layout shell)
  index.tsx                (rebrand: category selector homepage)
  sorting/
    index.tsx              (sorting sub-gallery)
    $id.tsx                (sorting detail — migrated from algorithm.$id.tsx)
  pathfinding/
    index.tsx              (pathfinding sub-gallery)
    $id.tsx                (pathfinding detail)
  trees/
    index.tsx              (trees sub-gallery)
    $id.tsx                (trees detail)
  algorithm.$id.tsx        (DELETED)
```

---

## Data Layer

### Existing

`src/data/algorithms.ts` — exports `ALGORITHMS`, `Algorithm`, `AlgorithmId`, `SortFrame`, `SEED_INPUT`, `getAlgorithm()`. Keep as-is, rename file to `src/data/sorting.ts` to match the category pattern.

### New files

**`src/data/pathfinding.ts`**
- `PathfindingAlgorithmId` union type
- `GridCell` type: `"empty" | "wall" | "start" | "end" | "visited" | "path"`
- `GridFrame`: `{ grid: GridCell[][]; stats: Record<string, string> }`
- `PathfindingAlgorithm` interface: `id`, `name`, `description`, `stats` (flexible key/value rows), `run(grid) → GridFrame[]`
- 4 algorithms: `bfs`, `dfs`, `dijkstra`, `a-star`
- Export `PATHFINDING_ALGORITHMS`, `getPathfindingAlgorithm(id)`

**`src/data/trees.ts`**
- `TreeAlgorithmId` union type
- `TreeNode`: `{ value: number; left?: number; right?: number; state: NodeState }`
- `NodeState`: `"default" | "active" | "found" | "inserted" | "deleted"`
- `TreeFrame`: `{ nodes: TreeNode[]; stats: Record<string, string> }`
- `TreeAlgorithm` interface: `id`, `name`, `description`, `stats`, `run() → TreeFrame[]`
- 4 operations: `bst-insert`, `bst-search`, `bst-delete`, `avl-rotation`
- Export `TREE_ALGORITHMS`, `getTreeAlgorithm(id)`

**`src/data/categories.ts`**
- `Category` type: `{ id, name, description, route, count, status: "live" | "coming-soon" }`
- `CATEGORIES` array — all 6 entries (3 live, 3 coming-soon)

---

## Visualizer Components

### Existing
`src/components/sort-visualizer.tsx` — unchanged, keep as-is.

### New

**`src/components/grid-visualizer.tsx`**
- Props: `frames: GridFrame[]`, `fps?: number` (default 8), `size?: "sm" | "lg"`
- Canvas-based, `rAF` loop, same pause-and-loop pattern as `SortVisualizer`
- Cell colors read from CSS variables (visited = accent, path = primary, wall = foreground, etc.)
- `"sm"`: fixed height ~100px; `"lg"`: ~300px, full width
- `aria-hidden="true"` wrapper

**`src/components/tree-visualizer.tsx`**
- Props: `frames: TreeFrame[]`, `fps?: number` (default 6), `size?: "sm" | "lg"`
- Canvas-based, `rAF` loop
- Draws nodes as circles, edges as lines; highlights active nodes per frame state
- `"sm"`: ~100px tall; `"lg"`: ~320px tall
- `aria-hidden="true"` wrapper

---

## Shared Detail Page Template

Both new category detail routes reuse the same visual structure as the existing sorting detail page:

- Back link → category sub-gallery
- Algorithm name + description
- Flexible metadata table (key/value rows defined per algorithm)
- Large looping visualizer (`size="lg"`)

Sorting detail page is migrated to `/sorting/$id` with no functional changes beyond the back-link target.

---

## Branding Changes

| Location | Old | New |
|---|---|---|
| `package.json` `name` | `learn-sort` | `algo` |
| `index.html` `<title>` | `sort.` (or similar) | `algo.` |
| `src/routes/index.tsx` header | `sort.` | `algo.` |
| `src/components/site-header.tsx` | any `sort.` references | `algo.` |
| `README.md` title/description | sorting-focused | algo. platform description |

---

## Sub-Tasks

---

### Sub-Task 1 — Branding pass

**Intent**
Update all in-repo brand references from `sort.` to `algo.` — `package.json`, `index.html`, `README.md`, and any component text.

**Todo List**
1. Update `package.json` `name` to `algo`.
2. Update `index.html` `<title>` to `algo.`.
3. Update `README.md` — new title, new description.
4. Search codebase for `"sort."` brand text and replace with `"algo."` in UI components.

**Status:** [ ] pending

---

### Sub-Task 2 — Routing restructure

**Intent**
Create the new category-scoped TanStack Router file structure. Delete the old flat route. Migrate existing sorting pages to `/sorting/*`.

**Todo List**
1. Create `src/routes/sorting/` directory.
2. Move `src/routes/algorithm.$id.tsx` → `src/routes/sorting/$id.tsx` (update back-link to `/sorting`).
3. Create `src/routes/sorting/index.tsx` (copy of current `src/routes/index.tsx` gallery, scoped to sorting).
4. Update `src/routes/index.tsx` to be the new category homepage (see Sub-Task 5).
5. Delete `src/routes/algorithm.$id.tsx`.
6. Create empty scaffolds: `src/routes/pathfinding/index.tsx`, `src/routes/pathfinding/$id.tsx`, `src/routes/trees/index.tsx`, `src/routes/trees/$id.tsx`.
7. Run `pnpm dev` to trigger TanStack Router route tree regeneration; verify no broken routes.

**Status:** [ ] pending

---

### Sub-Task 3 — Data layer: Pathfinding

**Intent**
Implement `src/data/pathfinding.ts` with 4 algorithms producing `GridFrame[]` sequences on a fixed demo grid.

**Todo List**
1. Create `src/data/pathfinding.ts`.
2. Define types: `PathfindingAlgorithmId`, `GridCell`, `GridFrame`, `PathfindingAlgorithm`.
3. Define a fixed demo grid (e.g. 10×10 with a few wall cells, fixed start/end).
4. Implement `bfs` frame generator.
5. Implement `dfs` frame generator.
6. Implement `dijkstra` frame generator.
7. Implement `a-star` frame generator.
8. Export `PATHFINDING_ALGORITHMS` array and `getPathfindingAlgorithm(id)` helper.

**Status:** [ ] pending

---

### Sub-Task 4 — Data layer: Trees

**Intent**
Implement `src/data/trees.ts` with 4 tree operations producing `TreeFrame[]` sequences.

**Todo List**
1. Create `src/data/trees.ts`.
2. Define types: `TreeAlgorithmId`, `NodeState`, `TreeNode`, `TreeFrame`, `TreeAlgorithm`.
3. Define a fixed demo tree (pre-populated BST with ~8 nodes).
4. Implement `bst-insert` frame generator.
5. Implement `bst-search` frame generator.
6. Implement `bst-delete` frame generator.
7. Implement `avl-rotation` frame generator.
8. Export `TREE_ALGORITHMS` array and `getTreeAlgorithm(id)` helper.

**Status:** [ ] pending

---

### Sub-Task 5 — Category homepage

**Intent**
Rebuild `src/routes/index.tsx` as the category selector — a hero + grid of 6 category tiles (3 live, 3 coming-soon).

**Todo List**
1. Create `src/data/categories.ts` with `CATEGORIES` array.
2. Rewrite `src/routes/index.tsx` — hero section + 6-tile category grid.
3. Live tiles link to their sub-gallery route; coming-soon tiles are non-interactive with a visual "soon" badge.
4. Use `algo.` branding in hero heading.

**Status:** [ ] pending

---

### Sub-Task 6 — GridVisualizer component

**Intent**
Build `src/components/grid-visualizer.tsx` — canvas-based 2D grid animation.

**Todo List**
1. Create `src/components/grid-visualizer.tsx`.
2. Define props: `frames: GridFrame[]`, `fps?: number`, `size?: "sm" | "lg"`.
3. Implement `rAF` loop identical in structure to `SortVisualizer`.
4. Draw cells as filled rectangles; color per `GridCell` state using CSS variables.
5. Handle `"sm"` / `"lg"` sizing.
6. Pause-and-loop at end of frames.
7. `useEffect` cleanup for `cancelAnimationFrame`.

**Status:** [ ] pending

---

### Sub-Task 7 — TreeVisualizer component

**Intent**
Build `src/components/tree-visualizer.tsx` — canvas-based node/edge tree animation.

**Todo List**
1. Create `src/components/tree-visualizer.tsx`.
2. Define props: `frames: TreeFrame[]`, `fps?: number`, `size?: "sm" | "lg"`.
3. Implement `rAF` loop.
4. Compute node positions from tree structure (simple level-order layout).
5. Draw edges as lines, nodes as circles; color per `NodeState` using CSS variables.
6. Pause-and-loop at end of frames.
7. `useEffect` cleanup.

**Status:** [ ] pending

---

### Sub-Task 8 — Pathfinding sub-gallery + detail pages

**Intent**
Fill in the pathfinding route scaffolds with real UI — sub-gallery at `/pathfinding`, detail page at `/pathfinding/$id`.

**Todo List**
1. Implement `src/routes/pathfinding/index.tsx` — sub-gallery page with 4 pathfinding algorithm cards using `GridVisualizer size="sm"`.
2. Implement `src/routes/pathfinding/$id.tsx` — detail page with `GridVisualizer size="lg"` and flexible metadata table.

**Status:** [ ] pending

---

### Sub-Task 9 — Trees sub-gallery + detail pages

**Intent**
Fill in the trees route scaffolds with real UI — sub-gallery at `/trees`, detail page at `/trees/$id`.

**Todo List**
1. Implement `src/routes/trees/index.tsx` — sub-gallery page with 4 tree operation cards using `TreeVisualizer size="sm"`.
2. Implement `src/routes/trees/$id.tsx` — detail page with `TreeVisualizer size="lg"` and flexible metadata table.

**Status:** [ ] pending

---

### Sub-Task 10 — Final polish & validation

**Intent**
Cross-cutting polish pass: consistent navigation, back-links, category breadcrumbs, and `pnpm check` passing clean.

**Todo List**
1. Ensure `SiteHeader` on all sub-gallery and detail pages shows `algo.` brand and correct back-link.
2. Add category label breadcrumb on detail pages (e.g. "Pathfinding → Dijkstra").
3. Verify all `pnpm check` (fmt + typecheck + lint) pass with zero errors.
4. Smoke-test all routes: `/`, `/sorting`, `/sorting/bubble-sort`, `/pathfinding`, `/pathfinding/bfs`, `/trees`, `/trees/bst-insert`.
5. Verify coming-soon tiles are non-interactive and visually distinct.
6. Verify dark mode on all new pages.

**Status:** [ ] pending

---

## Implementation Order

```
Sub-Task 1 (brand)
  → Sub-Task 2 (routing)
    → Sub-Task 3 (data: pathfinding)
    → Sub-Task 4 (data: trees)
      → Sub-Task 5 (category homepage)
      → Sub-Task 6 (GridVisualizer)
      → Sub-Task 7 (TreeVisualizer)
        → Sub-Task 8 (pathfinding pages)
        → Sub-Task 9 (trees pages)
          → Sub-Task 10 (polish + validation)
```

Sub-Tasks 3 & 4 can run in parallel. Sub-Tasks 6 & 7 can run in parallel after their data layers exist. Sub-Tasks 8 & 9 can run in parallel after their visualizers exist.
