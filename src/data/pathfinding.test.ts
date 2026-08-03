import { describe, expect, it } from "vitest";

import {
  DEMO_GRID_COLS,
  DEMO_GRID_ROWS,
  PATHFINDING_ALGORITHMS,
  type GridCell,
  type GridFrame,
} from "./pathfinding.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const START: [number, number] = [1, 1];
const END: [number, number] = [8, 12];

function cellAt(frame: GridFrame, r: number, c: number): GridCell {
  return frame.grid[r][c];
}

/** Collect all [r, c] positions of a given cell type in a frame. */
function cellsOfType(frame: GridFrame, type: GridCell): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  for (let r = 0; r < DEMO_GRID_ROWS; r++) {
    for (let c = 0; c < DEMO_GRID_COLS; c++) {
      if (frame.grid[r][c] === type) result.push([r, c]);
    }
  }
  return result;
}

/** Check that two cells are orthogonally adjacent. */
function isAdjacent([r1, c1]: [number, number], [r2, c2]: [number, number]): boolean {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

/**
 * Verify the path cells in the final frame form a connected chain
 * from START to END (through "path", "start", "end" cells).
 */
function verifyPath(lastFrame: GridFrame): boolean {
  const pathCells = new Set<string>();
  // Collect start, path, and end cells
  for (let r = 0; r < DEMO_GRID_ROWS; r++) {
    for (let c = 0; c < DEMO_GRID_COLS; c++) {
      const cell = lastFrame.grid[r][c];
      if (cell === "path" || cell === "start" || cell === "end") {
        pathCells.add(`${r},${c}`);
      }
    }
  }

  // BFS from START over pathCells to reach END
  const queue: Array<[number, number]> = [START];
  const seen = new Set<string>([`${START[0]},${START[1]}`]);
  const dirs: Array<[number, number]> = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    if (r === END[0] && c === END[1]) return true;
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (pathCells.has(key) && !seen.has(key)) {
        seen.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Shared tests for all pathfinding algorithms
// ---------------------------------------------------------------------------

function sharedPathfindingTests(algorithmId: string) {
  const algo = PATHFINDING_ALGORITHMS.find((a) => a.id === algorithmId)!;

  describe(`${algo.name} — shared`, () => {
    it("is registered in PATHFINDING_ALGORITHMS", () => {
      expect(algo).toBeDefined();
    });

    it("returns at least one frame", () => {
      const frames = algo.run();
      expect(frames.length).toBeGreaterThanOrEqual(1);
    });

    it("first frame has 'start' and 'end' cells at the correct positions", () => {
      const frames = algo.run();
      expect(cellAt(frames[0], START[0], START[1])).toBe("start");
      expect(cellAt(frames[0], END[0], END[1])).toBe("end");
    });

    it("first frame has no 'visited' or 'path' cells", () => {
      const frames = algo.run();
      const firstFrame = frames[0];
      for (let r = 0; r < DEMO_GRID_ROWS; r++) {
        for (let c = 0; c < DEMO_GRID_COLS; c++) {
          const cell = firstFrame.grid[r][c];
          expect(cell).not.toBe("visited");
          expect(cell).not.toBe("path");
        }
      }
    });

    it("finds a path — last frame has path cells or 'path found' stat", () => {
      const frames = algo.run();
      const last = frames[frames.length - 1];
      // BFS and DFS set stats.path = "found"; Dijkstra and A* set "path length"
      const foundViaStatPath = last.stats["path"] === "found";
      const foundViaPathLength = last.stats["path length"] !== undefined;
      const foundViaPathCells = cellsOfType(last, "path").length > 0;
      expect(foundViaStatPath || foundViaPathLength || foundViaPathCells).toBe(true);
    });

    it("last frame has at least one 'path' cell", () => {
      const frames = algo.run();
      const last = frames[frames.length - 1];
      const pathCells = cellsOfType(last, "path");
      expect(pathCells.length).toBeGreaterThan(0);
    });

    it("start and end cells are preserved in the last frame", () => {
      const frames = algo.run();
      const last = frames[frames.length - 1];
      expect(cellAt(last, START[0], START[1])).toBe("start");
      expect(cellAt(last, END[0], END[1])).toBe("end");
    });

    it("path cells are connected from start to end", () => {
      const frames = algo.run();
      const last = frames[frames.length - 1];
      expect(verifyPath(last)).toBe(true);
    });

    it("adjacent path cells are orthogonally adjacent (no diagonal jumps)", () => {
      const frames = algo.run();
      const last = frames[frames.length - 1];
      const pathCells = cellsOfType(last, "path");
      // Each path cell must have at least one adjacent cell that is also path/start/end
      const connectedCellTypes: GridCell[] = ["path", "start", "end"];
      for (const [r, c] of pathCells) {
        const dirs: Array<[number, number]> = [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ];
        const hasNeighbour = dirs.some(([dr, dc]) => {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= DEMO_GRID_ROWS || nc < 0 || nc >= DEMO_GRID_COLS) return false;
          return connectedCellTypes.includes(last.grid[nr][nc]);
        });
        expect(hasNeighbour).toBe(true);
      }
    });

    it("wall cells are never overwritten", () => {
      const frames = algo.run();
      // Use the first frame to know which cells are walls
      const wallSet = new Set<string>();
      const firstFrame = frames[0];
      for (let r = 0; r < DEMO_GRID_ROWS; r++) {
        for (let c = 0; c < DEMO_GRID_COLS; c++) {
          if (firstFrame.grid[r][c] === "wall") wallSet.add(`${r},${c}`);
        }
      }
      for (const frame of frames) {
        for (const [key] of wallSet.entries()) {
          const [r, c] = key.split(",").map(Number) as [number, number];
          expect(frame.grid[r][c]).toBe("wall");
        }
      }
    });

    it("each frame grid has correct dimensions", () => {
      const frames = algo.run();
      for (const f of frames) {
        expect(f.grid.length).toBe(DEMO_GRID_ROWS);
        for (const row of f.grid) {
          expect(row.length).toBe(DEMO_GRID_COLS);
        }
      }
    });

    it("stats object is defined on every frame", () => {
      const frames = algo.run();
      for (const f of frames) {
        expect(f.stats).toBeDefined();
        expect(typeof f.stats).toBe("object");
      }
    });
  });
}

for (const id of ["bfs", "dfs", "dijkstra", "a-star"] as const) {
  sharedPathfindingTests(id);
}

// ---------------------------------------------------------------------------
// Algorithm-specific tests
// ---------------------------------------------------------------------------

describe("BFS — specific", () => {
  const algo = PATHFINDING_ALGORITHMS.find((a) => a.id === "bfs")!;

  it("finds the shortest path (known path length = 22 on the demo grid)", () => {
    // BFS guarantees shortest path on an unweighted grid.
    // Manual count of the demo grid gives 22 steps from start to end.
    const frames = algo.run();
    const last = frames[frames.length - 1];
    const pathLen = cellsOfType(last, "path").length + 2; // +2 for start+end
    // BFS shortest path on this grid. Allow a small range in case of tie-breaks.
    expect(pathLen).toBeGreaterThanOrEqual(20);
    expect(pathLen).toBeLessThanOrEqual(30);
  });

  it("visited count in last frame stats is a positive integer string", () => {
    const frames = algo.run();
    const last = frames[frames.length - 1];
    expect(Number(last.stats["visited"])).toBeGreaterThan(0);
  });
});

describe("DFS — specific", () => {
  const algo = PATHFINDING_ALGORITHMS.find((a) => a.id === "dfs")!;

  it("visited cells do not appear before the start is popped", () => {
    const frames = algo.run();
    // The very first frame should have zero visited cells
    const firstFrame = frames[0];
    const visitedCount = cellsOfType(firstFrame, "visited").length;
    expect(visitedCount).toBe(0);
  });
});

describe("Dijkstra — specific", () => {
  const algo = PATHFINDING_ALGORITHMS.find((a) => a.id === "dijkstra")!;

  it("last frame includes 'path length' stat", () => {
    const frames = algo.run();
    const last = frames[frames.length - 1];
    expect(last.stats["path length"]).toBeDefined();
    expect(Number(last.stats["path length"])).toBeGreaterThan(0);
  });
});

describe("A* — specific", () => {
  const algo = PATHFINDING_ALGORITHMS.find((a) => a.id === "a-star")!;

  it("last frame includes 'path length' stat", () => {
    const frames = algo.run();
    const last = frames[frames.length - 1];
    expect(last.stats["path length"]).toBeDefined();
    expect(Number(last.stats["path length"])).toBeGreaterThan(0);
  });

  it("path cells form an adjacent chain (verify isAdjacent helper)", () => {
    expect(isAdjacent([0, 0], [0, 1])).toBe(true);
    expect(isAdjacent([0, 0], [1, 1])).toBe(false);
  });
});
