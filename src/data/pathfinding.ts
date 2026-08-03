export type PathfindingAlgorithmId = "bfs" | "dfs" | "dijkstra" | "a-star";

export type GridCell = "empty" | "wall" | "start" | "end" | "visited" | "path";

export interface GridFrame {
  grid: GridCell[][];
  stats: Record<string, string>;
}

export interface PathfindingAlgorithm {
  id: PathfindingAlgorithmId;
  name: string;
  description: string;
  stats: Array<{ label: string; value: string }>;
  run: () => GridFrame[];
}

// ---------------------------------------------------------------------------
// Demo grid — 10 rows × 14 cols
// S = start (row 1, col 1), E = end (row 8, col 12)
// W = wall cells creating a simple maze-like obstacle course
// ---------------------------------------------------------------------------
const ROWS = 10;
const COLS = 14;

type RawCell = "S" | "E" | "W" | ".";

const RAW_GRID: RawCell[][] = [
  [".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
  [".", "S", ".", ".", ".", "W", ".", ".", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", "W", ".", "W", ".", "W", "W", "W", ".", ".", ".", "."],
  [".", "W", "W", "W", ".", "W", ".", ".", ".", "W", ".", "W", ".", "."],
  [".", ".", ".", ".", ".", ".", ".", "W", ".", "W", ".", "W", ".", "."],
  [".", "W", ".", "W", "W", "W", "W", "W", ".", "W", ".", "W", ".", "."],
  [".", "W", ".", ".", ".", ".", ".", ".", ".", "W", ".", ".", ".", "."],
  [".", "W", "W", "W", "W", "W", ".", "W", "W", "W", "W", "W", ".", "."],
  [".", ".", ".", ".", ".", "W", ".", ".", ".", ".", ".", ".", "E", "."],
  [".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
];

const START: [number, number] = [1, 1];
const END: [number, number] = [8, 12];

function buildBaseGrid(): GridCell[][] {
  return RAW_GRID.map((row) =>
    row.map((cell): GridCell => {
      if (cell === "S") return "start";
      if (cell === "E") return "end";
      if (cell === "W") return "wall";
      return "empty";
    }),
  );
}

function cloneGrid(g: GridCell[][]): GridCell[][] {
  return g.map((row) => [...row]);
}

function snap(g: GridCell[][], stats: Record<string, string>): GridFrame {
  return { grid: cloneGrid(g), stats: { ...stats } };
}

function neighbors(r: number, c: number): Array<[number, number]> {
  const dirs: Array<[number, number]> = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  return dirs
    .map(([dr, dc]) => [r + dr, c + dc] as [number, number])
    .filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS);
}

// Mark the reconstructed path on the grid (excluding start/end)
function markPath(grid: GridCell[][], parent: Map<string, [number, number] | null>): void {
  let cur: [number, number] | undefined = END;
  while (cur) {
    const key = `${cur[0]},${cur[1]}`;
    const p = parent.get(key);
    if (!p) break;
    const [pr, pc] = p;
    if (grid[pr][pc] !== "start") grid[pr][pc] = "path";
    cur = p;
  }
  grid[END[0]][END[1]] = "end";
}

// ---------------------------------------------------------------------------
// BFS
// ---------------------------------------------------------------------------
function bfsFrames(): GridFrame[] {
  const base = buildBaseGrid();
  const frames: GridFrame[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, [number, number] | null>();
  const queue: Array<[number, number]> = [START];
  const startKey = `${START[0]},${START[1]}`;
  visited.add(startKey);
  parent.set(startKey, null);

  let steps = 0;
  frames.push(snap(base, { visited: "0", steps: "0" }));

  let found = false;
  while (queue.length > 0 && !found) {
    const [r, c] = queue.shift()!;
    for (const [nr, nc] of neighbors(r, c)) {
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      const cell = base[nr][nc];
      if (cell === "wall") continue;
      visited.add(key);
      parent.set(key, [r, c]);
      steps++;
      if (cell !== "end") base[nr][nc] = "visited";
      frames.push(snap(base, { visited: String(visited.size), steps: String(steps) }));
      if (nr === END[0] && nc === END[1]) {
        found = true;
        break;
      }
      queue.push([nr, nc]);
    }
  }

  // Reconstruct path
  if (found) {
    markPath(base, parent);
    frames.push(snap(base, { visited: String(visited.size), steps: String(steps), path: "found" }));
  }

  return frames;
}

// ---------------------------------------------------------------------------
// DFS
// ---------------------------------------------------------------------------
function dfsFrames(): GridFrame[] {
  const base = buildBaseGrid();
  const frames: GridFrame[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, [number, number] | null>();
  const stack: Array<[number, number]> = [START];
  const startKey = `${START[0]},${START[1]}`;
  parent.set(startKey, null);

  let steps = 0;
  frames.push(snap(base, { visited: "0", steps: "0" }));

  let found = false;
  while (stack.length > 0 && !found) {
    const [r, c] = stack.pop()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);
    if (base[r][c] !== "start" && base[r][c] !== "end") base[r][c] = "visited";
    steps++;
    frames.push(snap(base, { visited: String(visited.size), steps: String(steps) }));

    if (r === END[0] && c === END[1]) {
      found = true;
      break;
    }

    for (const [nr, nc] of neighbors(r, c)) {
      const nKey = `${nr},${nc}`;
      if (visited.has(nKey)) continue;
      if (base[nr][nc] === "wall") continue;
      if (!parent.has(nKey)) parent.set(nKey, [r, c]);
      stack.push([nr, nc]);
    }
  }

  if (found) {
    markPath(base, parent);
    frames.push(snap(base, { visited: String(visited.size), steps: String(steps), path: "found" }));
  }

  return frames;
}

// ---------------------------------------------------------------------------
// Dijkstra (uniform cost — all edges weight 1 → same as BFS on grid, but we
// track distance explicitly for the stats display)
// ---------------------------------------------------------------------------
function dijkstraFrames(): GridFrame[] {
  const base = buildBaseGrid();
  const frames: GridFrame[] = [];
  const dist = new Map<string, number>();
  const parent = new Map<string, [number, number] | null>();
  // Simple priority queue via sorted array (small grid, fine)
  const pq: Array<{ r: number; c: number; d: number }> = [];

  const startKey = `${START[0]},${START[1]}`;
  dist.set(startKey, 0);
  parent.set(startKey, null);
  pq.push({ r: START[0], c: START[1], d: 0 });

  let steps = 0;
  frames.push(snap(base, { visited: "0", steps: "0" }));

  let found = false;
  while (pq.length > 0 && !found) {
    pq.sort((a, b) => a.d - b.d);
    const { r, c, d } = pq.shift()!;
    const key = `${r},${c}`;
    if ((dist.get(key) ?? Infinity) < d) continue;

    for (const [nr, nc] of neighbors(r, c)) {
      const nKey = `${nr},${nc}`;
      const cell = base[nr][nc];
      if (cell === "wall") continue;
      const nd = d + 1;
      if (nd < (dist.get(nKey) ?? Infinity)) {
        dist.set(nKey, nd);
        parent.set(nKey, [r, c]);
        steps++;
        if (cell !== "end" && cell !== "start") base[nr][nc] = "visited";
        frames.push(snap(base, { visited: String(dist.size), steps: String(steps) }));
        if (nr === END[0] && nc === END[1]) {
          found = true;
          break;
        }
        pq.push({ r: nr, c: nc, d: nd });
      }
    }
  }

  if (found) {
    const endDist = dist.get(`${END[0]},${END[1]}`) ?? 0;
    markPath(base, parent);
    frames.push(
      snap(base, {
        visited: String(dist.size),
        steps: String(steps),
        "path length": String(endDist),
      }),
    );
  }

  return frames;
}

// ---------------------------------------------------------------------------
// A* (Manhattan heuristic)
// ---------------------------------------------------------------------------
function heuristic(r: number, c: number): number {
  return Math.abs(r - END[0]) + Math.abs(c - END[1]);
}

function aStarFrames(): GridFrame[] {
  const base = buildBaseGrid();
  const frames: GridFrame[] = [];
  const gScore = new Map<string, number>();
  const parent = new Map<string, [number, number] | null>();
  const open: Array<{ r: number; c: number; f: number }> = [];

  const startKey = `${START[0]},${START[1]}`;
  gScore.set(startKey, 0);
  parent.set(startKey, null);
  open.push({ r: START[0], c: START[1], f: heuristic(START[0], START[1]) });

  let steps = 0;
  frames.push(snap(base, { visited: "0", steps: "0" }));

  let found = false;
  while (open.length > 0 && !found) {
    open.sort((a, b) => a.f - b.f);
    const { r, c } = open.shift()!;
    const key = `${r},${c}`;
    const g = gScore.get(key) ?? Infinity;

    for (const [nr, nc] of neighbors(r, c)) {
      const nKey = `${nr},${nc}`;
      const cell = base[nr][nc];
      if (cell === "wall") continue;
      const ng = g + 1;
      if (ng < (gScore.get(nKey) ?? Infinity)) {
        gScore.set(nKey, ng);
        parent.set(nKey, [r, c]);
        steps++;
        if (cell !== "end" && cell !== "start") base[nr][nc] = "visited";
        frames.push(snap(base, { visited: String(gScore.size), steps: String(steps) }));
        if (nr === END[0] && nc === END[1]) {
          found = true;
          break;
        }
        open.push({ r: nr, c: nc, f: ng + heuristic(nr, nc) });
      }
    }
  }

  if (found) {
    const pathLen = gScore.get(`${END[0]},${END[1]}`) ?? 0;
    markPath(base, parent);
    frames.push(
      snap(base, {
        visited: String(gScore.size),
        steps: String(steps),
        "path length": String(pathLen),
      }),
    );
  }

  return frames;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
export const PATHFINDING_ALGORITHMS: PathfindingAlgorithm[] = [
  {
    id: "bfs",
    name: "Breadth-First Search",
    description:
      "Explores all neighbours at the current depth before moving to the next level. Guaranteed to find the shortest path on an unweighted grid.",
    stats: [
      { label: "Optimal", value: "Yes (unweighted)" },
      { label: "Complete", value: "Yes" },
      { label: "Weighted", value: "No" },
      { label: "Time", value: "O(V + E)" },
      { label: "Space", value: "O(V)" },
    ],
    run: bfsFrames,
  },
  {
    id: "dfs",
    name: "Depth-First Search",
    description:
      "Explores as far as possible down each branch before backtracking. Not guaranteed to find the shortest path but uses less memory than BFS.",
    stats: [
      { label: "Optimal", value: "No" },
      { label: "Complete", value: "Yes (finite graphs)" },
      { label: "Weighted", value: "No" },
      { label: "Time", value: "O(V + E)" },
      { label: "Space", value: "O(V)" },
    ],
    run: dfsFrames,
  },
  {
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    description:
      "Greedily expands the node with the smallest known distance. Guarantees the shortest path on weighted graphs with non-negative edge weights.",
    stats: [
      { label: "Optimal", value: "Yes" },
      { label: "Complete", value: "Yes" },
      { label: "Weighted", value: "Yes" },
      { label: "Time", value: "O((V + E) log V)" },
      { label: "Space", value: "O(V)" },
    ],
    run: dijkstraFrames,
  },
  {
    id: "a-star",
    name: "A* Search",
    description:
      "Combines Dijkstra's guaranteed optimality with a heuristic that guides search toward the goal. Uses Manhattan distance as the heuristic, making it faster than Dijkstra in practice.",
    stats: [
      { label: "Optimal", value: "Yes (admissible h)" },
      { label: "Complete", value: "Yes" },
      { label: "Weighted", value: "Yes" },
      { label: "Time", value: "O(E log V)" },
      { label: "Space", value: "O(V)" },
    ],
    run: aStarFrames,
  },
];

const pfMap = new Map<PathfindingAlgorithmId, PathfindingAlgorithm>(
  PATHFINDING_ALGORITHMS.map((a) => [a.id, a]),
);

export function getPathfindingAlgorithm(id: string): PathfindingAlgorithm | undefined {
  return pfMap.get(id as PathfindingAlgorithmId);
}

export const DEMO_GRID_ROWS = ROWS;
export const DEMO_GRID_COLS = COLS;
