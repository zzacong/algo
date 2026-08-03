# Plan 04 — Add Vitest & Algorithm Tests

> **Status: Completed**

## Goal

Install Vitest and write comprehensive test suites for all algorithm implementations in the codebase: sorting algorithms, pathfinding algorithms, and tree algorithms.

## Motivation

The algorithm logic lives in pure TypeScript data files with no UI dependencies, making them ideal candidates for unit testing. Tests give confidence that the animation frame generators produce correct outputs and that correctness is preserved as the codebase evolves.

---

## Step 1 — Install Vitest ✅

```bash
pnpm add -D vitest @vitest/coverage-v8
```

`@vitest/coverage-v8` is the recommended coverage provider for Vite projects.

---

## Step 2 — Configure Vitest ✅

Extended `vite.config.ts` with a `test` block (Vitest reads from the same config):

```ts
test: {
  environment: "node",   // no DOM needed for pure algorithm code
  include: ["src/**/*.test.ts"],
},
```

Added `"vitest/globals"` to `types` in `tsconfig.app.json`.

Added scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest",
"coverage": "vitest run --coverage"
```

---

## Step 3 — Sorting algorithm tests (`src/data/sorting.test.ts`) ✅

Tests each of the 8 sort algorithms with 11 shared tests + algorithm-specific checks:

| Algorithm      | Key assertions                                                 |
| -------------- | -------------------------------------------------------------- |
| Bubble Sort    | Final frame values are sorted ascending; all states `"sorted"` |
| Selection Sort | Sorted region grows monotonically                              |
| Insertion Sort | First element starts as `"sorted"` in initial frame            |
| Merge Sort     | Stable sort; single-element edge case handled                  |
| Quick Sort     | Correct on two-element arrays; reversed input                  |
| Heap Sort      | Same shared invariants                                         |
| Shell Sort     | Same shared invariants                                         |
| Counting Sort  | Placement frames contain `"selected"` state; skips empty input |

**Shared pattern for every sort:**

1. Last frame values equal the reference sorted array.
2. All states in last frame are `"sorted"`.
3. First frame matches original input (no mutation).
4. First and last frames contain the same multiset as input.
5. Edge cases: single-element, already-sorted, reverse-sorted.

**Notable implementation details discovered:**

- Insertion Sort, Merge Sort, Shell Sort, and Counting Sort use an output buffer — intermediate frames may not preserve the full multiset, so the multiset invariant is only checked on first/last frames for those.
- Merge Sort leaves a single-element array in `"unsorted"` state.
- Counting Sort crashes on empty input (`Math.max` of empty spread) — empty-array test skipped for it.

---

## Step 4 — Pathfinding algorithm tests (`src/data/pathfinding.test.ts`) ✅

Tests BFS, DFS, Dijkstra, and A\*:

| Check                  | Detail                                                                           |
| ---------------------- | -------------------------------------------------------------------------------- |
| Frames returned        | At least one frame                                                               |
| First frame            | Grid has `"start"` and `"end"` cells; no `"visited"` or `"path"` cells           |
| Last frame             | Has path cells or a path-found stat (`path: "found"` for BFS/DFS; `"path length"` for Dijkstra/A\*) |
| Path validity          | `"path"` cells form a connected chain from start to end                          |
| Start/end preservation | `"start"` and `"end"` cells never overwritten across all frames                  |
| Wall preservation      | Wall cells never overwritten across all frames                                   |
| BFS optimality         | Path length within expected range for the demo grid                              |

---

## Step 5 — Tree algorithm tests (`src/data/trees.test.ts`) ✅

Tests BST Insert, BST Search, BST Delete, and AVL Rotation:

| Algorithm       | Key assertions                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| BST Insert (55) | Node 55 inserted as left child of 60; root unchanged at 50; BST property holds                         |
| BST Search (65) | A frame has `stats.result === "found 65"`; node 65 state is `"found"`; tree unmodified across all frames |
| BST Delete (30) | No live node with value 30 in last frame; replaced by in-order successor (40); BST property holds       |
| AVL Rotation    | Root becomes 20; node 10 is left child; node 30 is right child; height stat is `"2"`                   |

---

## Files affected

| File                           | Action                                        |
| ------------------------------ | --------------------------------------------- |
| `vite.config.ts`               | Added `test` block                            |
| `tsconfig.app.json`            | Added `vitest/globals` to `types`             |
| `package.json`                 | Added `test`, `test:watch`, `coverage` scripts |
| `src/data/sorting.ts`          | Renamed from `algorithms.ts`                  |
| `src/data/sorting.test.ts`     | New — 93 sorting tests                        |
| `src/data/pathfinding.test.ts` | New — 54 pathfinding tests                    |
| `src/data/trees.test.ts`       | New — 49 tree tests                           |
| `src/routes/sorting/$id.tsx`   | Import updated to `@/data/sorting`            |
| `src/routes/sorting/index.tsx` | Import updated to `@/data/sorting`            |
| `src/components/sort-visualizer.tsx` | Import updated to `@/data/sorting`      |
