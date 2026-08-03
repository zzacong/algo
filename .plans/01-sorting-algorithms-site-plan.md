# Sorting Algorithms Educational Website — Plan

## Top-Level Overview

Build a polished, modern educational website inside the existing Vite + React + TypeScript + Tailwind 4 + shadcn (`base-mira` style) project. The site teaches sorting algorithms through animated visualizations. TanStack Router will be added for routing.

**Two routes:**

- `/` — Gallery page: a card grid where every algorithm card shows its name and a small looping animated preview.
- `/algorithm/$id` — Detail page: full explanation + a large, full-screen looping animated visualization for the selected algorithm.

**Algorithms to cover (8 total):**

1. Bubble Sort
2. Selection Sort
3. Insertion Sort
4. Merge Sort
5. Quick Sort
6. Heap Sort
7. Shell Sort
8. Counting Sort

**Key constraints & conventions from codebase research:**

- Tailwind 4 — no `tailwind.config.*`, configured via `src/index.css` with `@theme inline`.
- Shadcn style: `base-mira`, icon library `hugeicons` (`@hugeicons/react`).
- UI component base: `@base-ui/react` (headless), not Radix.
- Linter (`oxlint`) already has overrides for `src/routes/**` — TanStack Router file-based routing pattern is the intended convention.
- Formatter ignores `**/routeTree.gen.ts` — confirms TanStack Router code-gen is expected.
- Path alias `@/*` → `src/*`.
- Package manager: pnpm.
- TypeScript strict mode; `noUnusedLocals` and `noUnusedParameters` are on.
- No test framework — no tests required.
- **Animation approach: Option E — HTML Canvas + `requestAnimationFrame`.**

---

## Sub-Tasks

---

### Sub-Task 1 — Install TanStack Router and wire up routing

**Intent**
Add `@tanstack/react-router` as a dependency and configure it. Use file-based routing with the Vite plugin (`@tanstack/router-plugin/vite`) so the route tree is auto-generated in `src/routeTree.gen.ts`. Update `vite.config.ts`, `main.tsx`, and create the root route file + index route scaffold.

**Expected Outcomes**

- `@tanstack/react-router` and `@tanstack/router-plugin` are in `package.json`.
- `vite.config.ts` has the TanStack Router Vite plugin.
- `src/routes/__root.tsx` exists with the root route (layout with ThemeProvider wrapper and `<Outlet />`).
- `src/routes/index.tsx` exists as a placeholder for the gallery page.
- `src/routes/algorithm.$id.tsx` exists as a placeholder for the detail page.
- `src/main.tsx` renders the router instead of `<App />`.
- `src/routeTree.gen.ts` is generated after running `pnpm dev`.
- `src/App.tsx` can be removed or emptied — it is no longer needed.

**Todo List**

1. Run `pnpm add @tanstack/react-router` and `pnpm add -D @tanstack/router-plugin`.
2. Update `vite.config.ts` to import and register `TanStackRouterVite` plugin (add it before the `react()` plugin).
3. Create `src/routes/__root.tsx`: root route that wraps children in `ThemeProvider` and renders `<Outlet />`.
4. Create `src/routes/index.tsx`: bare scaffold (placeholder `<div>Gallery</div>`).
5. Create `src/routes/algorithm.$id.tsx`: bare scaffold (placeholder `<div>Detail</div>`).
6. Update `src/main.tsx`: create router from `routeTree`, wrap in `<RouterProvider>`.
7. Delete `src/App.tsx` (no longer needed).

**Relevant Context**

- `src/main.tsx` currently renders `<ThemeProvider><App/></ThemeProvider>` — ThemeProvider moves to `__root.tsx`.
- `vite.config.ts` uses `defineConfig` with `plugins: [react(), tailwindcss()]`.
- `.oxlintrc.json` already ignores `routeTree.gen.ts` and allows non-component exports in `src/routes/**`.
- `.oxfmtrc.json` already ignores `**/routeTree.gen.ts`.

**Status:** [x] complete

---

### Sub-Task 2 — Algorithm data layer

**Intent**
Define a strongly-typed data structure describing each sorting algorithm: its `id`, `name`, short `description`, and `steps` (the algorithm logic as a generator or step-sequence function that the animation engine will consume). This is the single source of truth consumed by both the gallery cards and the detail page.

**Expected Outcomes**

- `src/data/algorithms.ts` exports a typed `ALGORITHMS` array and an `Algorithm` type.
- Each algorithm entry has: `id`, `name`, `description` (1–2 sentence plain-English explanation), `complexity` (big-O time best/average/worst + space), and a `sort` function that accepts an array of numbers and returns an ordered list of snapshots (array-of-arrays representing the state after each comparison/swap).
- A `getAlgorithm(id)` helper is exported for O(1) lookup.
- All 8 algorithms are implemented and produce correct snapshots.

**Expected Outcomes (algorithm logic)**

- `bubbleSort`, `selectionSort`, `insertionSort`, `mergeSort`, `quickSort`, `heapSort`, `shellSort`, `countingSort` — each returns `number[][]` (frames).
- Snapshot arrays are small enough to animate smoothly (~10–60 frames for a 12-bar array).

**Todo List**

1. Create `src/data/algorithms.ts`.
2. Define `AlgorithmId` union type and `Algorithm` interface (id, name, description, complexity, sort fn).
3. Implement `bubbleSort` frame generator (swap-based, returns frames).
4. Implement `selectionSort` frame generator.
5. Implement `insertionSort` frame generator.
6. Implement `mergeSort` frame generator.
7. Implement `quickSort` frame generator.
8. Implement `heapSort` frame generator.
9. Implement `shellSort` frame generator.
10. Implement `countingSort` frame generator.
11. Export `ALGORITHMS: Algorithm[]` array.
12. Export `getAlgorithm(id: AlgorithmId): Algorithm` helper.

**Relevant Context**

- No external libraries — pure TypeScript array manipulation.
- Frames = snapshots of the full bar array after each meaningful step (not every comparison — only swaps/moves to keep frame count reasonable).
- Use a fixed input array of 12 values for frame generation: `[7, 3, 11, 1, 9, 4, 12, 6, 2, 10, 5, 8]`.

**Status:** [x] complete

---

### Sub-Task 3 — Shared bar-chart animation component

**Intent**
Build a reusable `<SortVisualizer>` component that renders an animated bar chart on a `<canvas>` element. A `requestAnimationFrame` loop draws bars directly via the Canvas 2D API — no DOM elements per bar, no React re-renders during animation. It loops indefinitely with no user interaction required.

**Animation approach: Option E — HTML Canvas + `requestAnimationFrame`**

Each `SortVisualizer` mounts a `<canvas>`. On mount, a `rAF` loop starts that:

1. Tracks elapsed time to advance frame index at a target FPS.
2. Clears the canvas and redraws all bars for the current frame using `fillRect`.
3. After the last frame, waits ~600ms then resets to frame 0 and repeats.
4. Cancels the animation frame handle on unmount (cleanup).

Bar colors are read from computed CSS custom properties (`getComputedStyle`) so they respect light/dark mode. A highlighted bar index per frame can be stored alongside the frame snapshot to color active bars differently.

**Expected Outcomes**

- `src/components/SortVisualizer.tsx` exported as a named export.
- Props: `frames: number[][]`, `fps?: number` (default 10), `size?: "sm" | "lg"`.
- `"sm"` size: compact canvas, fits inside a gallery card (~80px tall).
- `"lg"` size: full detail view (~260px tall, full width).
- Loops indefinitely: plays all frames, brief pause (~600ms), resets to frame 0.
- Clean-up: cancels `rAF` handle on unmount via `useEffect` cleanup.
- `aria-hidden="true"` on the canvas wrapper.
- Reacts to theme changes (dark/light) by reading CSS variables on each draw call.
- Canvas resizes correctly if the container resizes (use a `ResizeObserver` or fixed dimensions tied to `size` prop).

**Todo List**

1. Create `src/components/SortVisualizer.tsx`.
2. Define props interface (`frames`, `fps`, `size`).
3. Use `useRef<HTMLCanvasElement>` to hold the canvas reference.
4. In `useEffect`, start the `rAF` loop: track `lastTime`, compute `elapsed`, advance `frameIndex` when `elapsed >= 1000/fps`.
5. On each draw: clear canvas, iterate bars, compute bar width/height from canvas dimensions and frame values, `fillRect` each bar.
6. Read bar fill color from `getComputedStyle(document.documentElement).getPropertyValue('--color-primary')` (or equivalent) for theme-aware colors.
7. After last frame: set a `pauseUntil` timestamp (~600ms ahead); skip frame advance until wall clock exceeds it, then reset index to 0.
8. Return cleanup function that calls `cancelAnimationFrame`.
9. Set `size="sm"` canvas to fixed `height: 80px`; `size="lg"` to `height: 260px`, both `width: 100%` (use `canvas.width = canvas.offsetWidth` on mount/resize).
10. Wrap canvas in a `<div aria-hidden="true">`.

**Relevant Context**

- No extra dependencies — pure Canvas 2D API.
- `src/index.css` CSS variables (`--color-primary`, `--color-foreground`, etc.) drive bar colors for dark/light mode compatibility.
- 8 simultaneous small canvases on the gallery page — Canvas is the right choice for this load.

**Status:** [x] complete

---

### Sub-Task 4 — Gallery page

**Intent**
Build the `/` gallery route — a visually polished page with a header, intro text, and a responsive card grid. Each card shows the algorithm name, big-O badge, and a small animated `<SortVisualizer size="sm">` preview.

**Expected Outcomes**

- `src/routes/index.tsx` renders the full gallery page.
- Responsive grid: 1 col mobile → 2 col tablet → 3–4 col desktop.
- Each card: algorithm name, time complexity badge, small animated bar chart preview, a "View →" affordance.
- Clicking a card navigates to `/algorithm/$id` using TanStack Router's `<Link>`.
- Page has a sticky header with site title and dark-mode toggle button (press `d` shortcut already works via ThemeProvider).
- Cards have subtle hover effects (scale, shadow) using Tailwind transitions.
- Uses the existing shadcn `Button` component where applicable.

**Todo List**

1. Replace placeholder in `src/routes/index.tsx` with the full gallery component.
2. Import `ALGORITHMS` from `src/data/algorithms.ts`.
3. Build `AlgorithmCard` sub-component (local to the file).
4. Add responsive grid layout.
5. Add sticky header with site title and theme toggle hint.
6. Implement card click/link navigation with TanStack Router `<Link>`.
7. Add hover animations via Tailwind `hover:` classes.
8. Wire `<SortVisualizer size="sm" frames={...} />` into each card.

**Relevant Context**

- TanStack Router's `<Link to="/algorithm/$id" params={{ id: algo.id }}>` is the navigation primitive.
- `src/components/ui/button.tsx` is already installed.
- Icon library is `@hugeicons/react` — can use for decorative icons (arrow, etc.).

**Status:** [x] complete

---

### Sub-Task 5 — Algorithm detail page

**Intent**
Build the `/algorithm/$id` detail route — a full-screen detail view for a single algorithm. Includes a back navigation link, algorithm name, description, complexity table, and a large looping `<SortVisualizer size="lg">`.

**Expected Outcomes**

- `src/routes/algorithm.$id.tsx` renders the full detail view.
- Reads `$id` from route params via TanStack Router's `useParams`.
- If `id` is invalid, redirects to `/` or shows a "not found" message.
- Layout: header with back button + site title, then a two-section layout: left/top = text (name, description, complexity table), right/bottom = large animated visualizer.
- On desktop: side-by-side (text left, visualizer right).
- On mobile: stacked (visualizer first, then text).
- Visualizer starts automatically and loops — no start button.
- Complexity table shows: Best, Average, Worst time complexity + Space complexity.

**Todo List**

1. Replace placeholder in `src/routes/algorithm.$id.tsx`.
2. Read `id` param and look up algorithm via `getAlgorithm()`.
3. Handle invalid `id`: render a "not found" message with a link back.
4. Build responsive two-column layout.
5. Render algorithm name, description, complexity table.
6. Render `<SortVisualizer size="lg" frames={...} fps={10} />`.
7. Add `<Link to="/">← Back to Gallery</Link>` button.

**Relevant Context**

- TanStack Router: `Route.useParams()` gives `{ id: string }`.
- `getAlgorithm()` from `src/data/algorithms.ts` for data lookup.
- `AlgorithmId` type for type-safe param narrowing.

**Status:** [x] complete

---

### Sub-Task 6 — Visual polish pass

**Intent**
Apply a final layer of visual refinement across both pages to ensure the site feels modern and distinctive — not like a default shadcn template. This includes typography, spacing, color accents, and micro-interactions.

**Expected Outcomes**

- Consistent page-level padding and max-width container.
- Hero area on gallery page with gradient text or subtle background texture.
- Cards have a consistent border, rounded corners, and a clear interactive state.
- Complexity badges use the existing color variables (no hardcoded colors).
- Dark mode looks polished (not just inverted colors).
- Smooth page transitions (CSS-based, not a library).
- `src/index.css` updated if any global styles need adding (e.g., custom scroll behavior, selection color).
- The site title / branding is consistent across both pages.

**Todo List**

1. Review gallery page for spacing and typography consistency.
2. Add gradient or accent highlight to the hero heading.
3. Ensure complexity badges use CSS variable colors.
4. Add `scroll-smooth` and `selection:` styles to `src/index.css`.
5. Review detail page layout at multiple breakpoints.
6. Test dark mode on both pages and adjust as needed.
7. Ensure all interactive elements have visible focus styles.

**Relevant Context**

- `src/index.css` uses `@theme inline` for CSS variables — any new design tokens go here.
- Tailwind 4 dark mode via `.dark` class (applied by ThemeProvider).
- `tw-animate-css` is available for additional animation utilities.

**Status:** [x] complete

---

## Implementation Order

```
Sub-Task 1 → Sub-Task 2 → Sub-Task 3 → Sub-Task 4 → Sub-Task 5 → Sub-Task 6
  (router)     (data)       (animator)   (gallery)    (detail)     (polish)
```

Each sub-task is independently reviewable before moving to the next.
