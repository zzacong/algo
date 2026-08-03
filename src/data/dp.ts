// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DPAlgorithmId =
  | "fibonacci"
  | "coin-change"
  | "lis"
  | "knapsack"
  | "lcs"
  | "edit-distance";

export type DPSecondaryVariant =
  | "recursion-tree"
  | "dependency-arrows"
  | "lis-scan"
  | "row-highlight";

export type DPCellState = "default" | "active" | "computed" | "current" | "highlight";

export interface DPCell {
  value: number | null;
  state: DPCellState;
}

// Left canvas: 1D or 2D table
export type DPTableFrame =
  | { kind: "1d"; cells: DPCell[]; label?: string }
  | { kind: "2d"; cells: DPCell[][]; rowLabels?: string[]; colLabels?: string[]; label?: string };

// Right canvas: variant-specific secondary frame
export interface RecursionTreeNode {
  id: number;
  label: string;
  state: "default" | "active" | "cached";
  parentId: number | null;
}

export interface RecursionTreeFrame {
  kind: "recursion-tree";
  nodes: RecursionTreeNode[];
}

export interface DependencyArrowFrame {
  kind: "dependency-arrows";
  /** Indices into the current 2D table pointing to the cells whose values feed the current cell */
  arrows: Array<{ fromRow: number; fromCol: number; toRow: number; toCol: number }>;
  /** The cell currently being computed */
  currentRow: number;
  currentCol: number;
}

export interface LISScanFrame {
  kind: "lis-scan";
  /** Input array indices that are currently being compared */
  comparing: number[];
  /** Input array indices that are in the accepted LIS prefix */
  accepted: number[];
  /** The index currently being placed */
  current: number;
}

export interface RowHighlightFrame {
  kind: "row-highlight";
  currentRow: number;
  prevRow: number;
}

export type DPSecondaryFrame =
  | RecursionTreeFrame
  | DependencyArrowFrame
  | LISScanFrame
  | RowHighlightFrame;

export interface DPFrame {
  table: DPTableFrame;
  secondary: DPSecondaryFrame;
  stats: Record<string, string>;
}

export interface DPAlgorithm {
  id: DPAlgorithmId;
  name: string;
  description: string;
  stats: Array<{ label: string; value: string }>;
  variant: DPSecondaryVariant;
  frames: DPFrame[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cells1d(arr: (number | null)[], active = -1, highlight: number[] = []): DPCell[] {
  return arr.map((v, i) => ({
    value: v,
    state:
      i === active
        ? "active"
        : highlight.includes(i)
          ? "highlight"
          : v !== null
            ? "computed"
            : "default",
  }));
}

function emptyTree(): RecursionTreeFrame {
  return { kind: "recursion-tree", nodes: [] };
}

// ---------------------------------------------------------------------------
// Fibonacci — n = 8
// Bottom-up tabulation with recursion tree built incrementally
// ---------------------------------------------------------------------------
function fibonacciFrames(): DPFrame[] {
  const N = 8;
  const frames: DPFrame[] = [];
  const dp: (number | null)[] = new Array(N + 1).fill(null);
  const treeNodes: RecursionTreeNode[] = [];

  // Node id = n value (0-based)
  function addNode(n: number, parentId: number | null, state: RecursionTreeNode["state"]) {
    const existing = treeNodes.find((x) => x.id === n);
    if (existing) {
      existing.state = state;
    } else {
      treeNodes.push({ id: n, label: `fib(${n})`, state, parentId });
    }
  }

  function cloneTree(): RecursionTreeFrame {
    return { kind: "recursion-tree", nodes: treeNodes.map((n) => ({ ...n })) };
  }

  // Initial frame
  frames.push({
    table: { kind: "1d", cells: cells1d(dp), label: `dp[0..${N}]` },
    secondary: emptyTree(),
    stats: { n: String(N), computing: "—" },
  });

  // Base cases
  dp[0] = 0;
  dp[1] = 1;
  addNode(0, null, "cached");
  addNode(1, null, "cached");

  frames.push({
    table: { kind: "1d", cells: cells1d(dp, -1, [0, 1]), label: `dp[0..${N}]` },
    secondary: cloneTree(),
    stats: { n: String(N), computing: "base cases" },
  });

  for (let i = 2; i <= N; i++) {
    // Show active node being computed
    addNode(i, i - 1, "active");
    // Show the two dependencies as active
    const dep0 = treeNodes.find((x) => x.id === i - 1)!;
    const dep1 = treeNodes.find((x) => x.id === i - 2)!;
    dep0.state = "active";
    dep1.state = "active";

    frames.push({
      table: { kind: "1d", cells: cells1d(dp, i), label: `dp[0..${N}]` },
      secondary: cloneTree(),
      stats: { n: String(N), computing: `fib(${i}) = fib(${i - 1}) + fib(${i - 2})` },
    });

    dp[i] = dp[i - 1]! + dp[i - 2]!;
    dep0.state = "cached";
    dep1.state = "cached";
    const cur = treeNodes.find((x) => x.id === i)!;
    cur.state = "cached";

    frames.push({
      table: { kind: "1d", cells: cells1d(dp, i), label: `dp[0..${N}]` },
      secondary: cloneTree(),
      stats: { n: String(N), computing: `fib(${i}) = ${dp[i]}` },
    });
  }

  frames.push({
    table: { kind: "1d", cells: cells1d(dp), label: `dp[0..${N}]` },
    secondary: cloneTree(),
    stats: { n: String(N), result: `fib(${N}) = ${dp[N]}` },
  });

  return frames;
}

// ---------------------------------------------------------------------------
// Coin Change — coins [1, 3, 4], amount 6
// ---------------------------------------------------------------------------
function coinChangeFrames(): DPFrame[] {
  const COINS = [1, 3, 4];
  const AMOUNT = 6;
  const frames: DPFrame[] = [];
  const dp: (number | null)[] = new Array(AMOUNT + 1).fill(null);
  dp[0] = 0;

  function makeArrows(i: number, usedCoin: number): DependencyArrowFrame {
    return {
      kind: "dependency-arrows",
      arrows: [{ fromRow: 0, fromCol: i - usedCoin, toRow: 0, toCol: i }],
      currentRow: 0,
      currentCol: i,
    };
  }

  frames.push({
    table: { kind: "1d", cells: cells1d(dp, 0), label: `dp[0..${AMOUNT}]` },
    secondary: { kind: "dependency-arrows", arrows: [], currentRow: 0, currentCol: 0 },
    stats: { coins: COINS.join(", "), amount: String(AMOUNT), computing: "base: dp[0] = 0" },
  });

  for (let i = 1; i <= AMOUNT; i++) {
    let best: number | null = null;
    let bestCoin = COINS[0];

    for (const coin of COINS) {
      if (coin <= i && dp[i - coin] !== null) {
        const candidate = dp[i - coin]! + 1;
        if (best === null || candidate < best) {
          best = candidate;
          bestCoin = coin;
        }
      }
    }

    // Show computing frame
    frames.push({
      table: { kind: "1d", cells: cells1d(dp, i), label: `dp[0..${AMOUNT}]` },
      secondary: makeArrows(i, bestCoin),
      stats: {
        coins: COINS.join(", "),
        amount: String(AMOUNT),
        computing: `dp[${i}] = dp[${i - bestCoin}] + 1`,
      },
    });

    dp[i] = best;

    frames.push({
      table: { kind: "1d", cells: cells1d(dp, i), label: `dp[0..${AMOUNT}]` },
      secondary: makeArrows(i, bestCoin),
      stats: {
        coins: COINS.join(", "),
        amount: String(AMOUNT),
        computing: `dp[${i}] = ${dp[i]}`,
      },
    });
  }

  frames.push({
    table: { kind: "1d", cells: cells1d(dp), label: `dp[0..${AMOUNT}]` },
    secondary: { kind: "dependency-arrows", arrows: [], currentRow: 0, currentCol: AMOUNT },
    stats: { coins: COINS.join(", "), amount: String(AMOUNT), result: `min coins = ${dp[AMOUNT]}` },
  });

  return frames;
}

// ---------------------------------------------------------------------------
// LIS — input [3, 1, 8, 2, 5]
// ---------------------------------------------------------------------------
function lisFrames(): DPFrame[] {
  const INPUT = [3, 1, 8, 2, 5];
  const N = INPUT.length;
  const frames: DPFrame[] = [];
  const dp: (number | null)[] = new Array(N).fill(null);

  frames.push({
    table: { kind: "1d", cells: cells1d(dp), label: `dp[0..${N - 1}]` },
    secondary: { kind: "lis-scan", comparing: [], accepted: [], current: 0 },
    stats: { input: INPUT.join(", "), computing: "—" },
  });

  const accepted: number[] = [];

  for (let i = 0; i < N; i++) {
    dp[i] = 1;
    const comparing: number[] = [];

    for (let j = 0; j < i; j++) {
      comparing.push(j);
      frames.push({
        table: { kind: "1d", cells: cells1d(dp, i), label: `dp[0..${N - 1}]` },
        secondary: { kind: "lis-scan", comparing: [...comparing], accepted: [...accepted], current: i },
        stats: {
          input: INPUT.join(", "),
          comparing: `INPUT[${j}]=${INPUT[j]} < INPUT[${i}]=${INPUT[i]}?`,
        },
      });

      if (INPUT[j] < INPUT[i] && dp[j]! + 1 > dp[i]!) {
        dp[i] = dp[j]! + 1;
      }
    }

    accepted.push(i);

    frames.push({
      table: { kind: "1d", cells: cells1d(dp, i), label: `dp[0..${N - 1}]` },
      secondary: { kind: "lis-scan", comparing: [], accepted: [...accepted], current: i },
      stats: { input: INPUT.join(", "), computing: `dp[${i}] = ${dp[i]}` },
    });
  }

  const lisLen = Math.max(...(dp as number[]));
  frames.push({
    table: { kind: "1d", cells: cells1d(dp), label: `dp[0..${N - 1}]` },
    secondary: { kind: "lis-scan", comparing: [], accepted: [...accepted], current: N - 1 },
    stats: { input: INPUT.join(", "), result: `LIS length = ${lisLen}` },
  });

  return frames;
}

// ---------------------------------------------------------------------------
// Knapsack — 4 items [(w:2,v:3),(w:3,v:4),(w:4,v:5),(w:5,v:8)], capacity 5
// ---------------------------------------------------------------------------
function knapsackFrames(): DPFrame[] {
  const ITEMS = [
    { w: 2, v: 3 },
    { w: 3, v: 4 },
    { w: 4, v: 5 },
    { w: 5, v: 8 },
  ];
  const CAP = 5;
  const N = ITEMS.length;
  const frames: DPFrame[] = [];

  // dp[i][j] = max value with first i items, capacity j
  const dp: (number | null)[][] = Array.from({ length: N + 1 }, () =>
    new Array(CAP + 1).fill(null),
  );

  function makeGrid(curRow: number, curCol: number): DPCell[][] {
    return dp.map((row, r) =>
      row.map((v, c) => ({
        value: v,
        state:
          r === curRow && c === curCol
            ? "active"
            : v !== null
              ? "computed"
              : ("default" as DPCellState),
      })),
    );
  }

  // Base case: i=0 or j=0 → 0
  for (let j = 0; j <= CAP; j++) dp[0][j] = 0;
  for (let i = 0; i <= N; i++) dp[i][0] = 0;

  const rowLabels = ["—", ...ITEMS.map((it, i) => `i${i + 1}(w${it.w},v${it.v})`)];
  const colLabels = Array.from({ length: CAP + 1 }, (_, j) => String(j));

  frames.push({
    table: { kind: "2d", cells: makeGrid(-1, -1), rowLabels, colLabels, label: "0/1 Knapsack" },
    secondary: { kind: "row-highlight", currentRow: 0, prevRow: 0 },
    stats: { capacity: String(CAP), items: String(N), computing: "base cases" },
  });

  for (let i = 1; i <= N; i++) {
    const item = ITEMS[i - 1];
    for (let j = 1; j <= CAP; j++) {
      // Show the current cell being computed
      frames.push({
        table: { kind: "2d", cells: makeGrid(i, j), rowLabels, colLabels, label: "0/1 Knapsack" },
        secondary: { kind: "row-highlight", currentRow: i, prevRow: i - 1 },
        stats: {
          capacity: String(CAP),
          items: String(N),
          computing: `dp[${i}][${j}]: item w=${item.w} v=${item.v}`,
        },
      });

      if (item.w > j) {
        dp[i][j] = dp[i - 1][j];
      } else {
        dp[i][j] = Math.max(dp[i - 1][j]!, dp[i - 1][j - item.w]! + item.v);
      }

      frames.push({
        table: { kind: "2d", cells: makeGrid(i, j), rowLabels, colLabels, label: "0/1 Knapsack" },
        secondary: { kind: "row-highlight", currentRow: i, prevRow: i - 1 },
        stats: {
          capacity: String(CAP),
          items: String(N),
          computing: `dp[${i}][${j}] = ${dp[i][j]}`,
        },
      });
    }
  }

  frames.push({
    table: { kind: "2d", cells: makeGrid(-1, -1), rowLabels, colLabels, label: "0/1 Knapsack" },
    secondary: { kind: "row-highlight", currentRow: N, prevRow: N - 1 },
    stats: { capacity: String(CAP), items: String(N), result: `max value = ${dp[N][CAP]}` },
  });

  return frames;
}

// ---------------------------------------------------------------------------
// LCS — "ABCB" vs "BDCAB"
// ---------------------------------------------------------------------------
function lcsFrames(): DPFrame[] {
  const A = "ABCB";
  const B = "BDCAB";
  const M = A.length;
  const N = B.length;
  const frames: DPFrame[] = [];

  const dp: (number | null)[][] = Array.from({ length: M + 1 }, () =>
    new Array(N + 1).fill(null),
  );

  for (let i = 0; i <= M; i++) dp[i][0] = 0;
  for (let j = 0; j <= N; j++) dp[0][j] = 0;

  const rowLabels = ["—", ...A.split("")];
  const colLabels = ["—", ...B.split("")];

  function makeGrid(cr: number, cc: number): DPCell[][] {
    return dp.map((row, r) =>
      row.map((v, c) => ({
        value: v,
        state:
          r === cr && c === cc
            ? "active"
            : v !== null
              ? "computed"
              : ("default" as DPCellState),
      })),
    );
  }

  function makeArrows(i: number, j: number, match: boolean): DependencyArrowFrame {
    if (match) {
      return {
        kind: "dependency-arrows",
        arrows: [{ fromRow: i - 1, fromCol: j - 1, toRow: i, toCol: j }],
        currentRow: i,
        currentCol: j,
      };
    }
    return {
      kind: "dependency-arrows",
      arrows: [
        { fromRow: i - 1, fromCol: j, toRow: i, toCol: j },
        { fromRow: i, fromCol: j - 1, toRow: i, toCol: j },
      ],
      currentRow: i,
      currentCol: j,
    };
  }

  frames.push({
    table: { kind: "2d", cells: makeGrid(-1, -1), rowLabels, colLabels, label: `LCS "${A}" / "${B}"` },
    secondary: { kind: "dependency-arrows", arrows: [], currentRow: 0, currentCol: 0 },
    stats: { a: A, b: B, computing: "base cases" },
  });

  for (let i = 1; i <= M; i++) {
    for (let j = 1; j <= N; j++) {
      const match = A[i - 1] === B[j - 1];

      frames.push({
        table: { kind: "2d", cells: makeGrid(i, j), rowLabels, colLabels, label: `LCS "${A}" / "${B}"` },
        secondary: makeArrows(i, j, match),
        stats: {
          a: A,
          b: B,
          computing: match
            ? `'${A[i - 1]}' == '${B[j - 1]}' → dp[${i - 1}][${j - 1}] + 1`
            : `'${A[i - 1]}' ≠ '${B[j - 1]}' → max(dp[${i - 1}][${j}], dp[${i}][${j - 1}])`,
        },
      });

      dp[i][j] = match ? dp[i - 1][j - 1]! + 1 : Math.max(dp[i - 1][j]!, dp[i][j - 1]!);

      frames.push({
        table: { kind: "2d", cells: makeGrid(i, j), rowLabels, colLabels, label: `LCS "${A}" / "${B}"` },
        secondary: makeArrows(i, j, match),
        stats: { a: A, b: B, computing: `dp[${i}][${j}] = ${dp[i][j]}` },
      });
    }
  }

  frames.push({
    table: { kind: "2d", cells: makeGrid(-1, -1), rowLabels, colLabels, label: `LCS "${A}" / "${B}"` },
    secondary: { kind: "dependency-arrows", arrows: [], currentRow: M, currentCol: N },
    stats: { a: A, b: B, result: `LCS length = ${dp[M][N]}` },
  });

  return frames;
}

// ---------------------------------------------------------------------------
// Edit Distance — "SUNDAY" vs "SATURDAY"
// ---------------------------------------------------------------------------
function editDistanceFrames(): DPFrame[] {
  const A = "SUNDAY";
  const B = "SATURDAY";
  const M = A.length;
  const N = B.length;
  const frames: DPFrame[] = [];

  const dp: (number | null)[][] = Array.from({ length: M + 1 }, () =>
    new Array(N + 1).fill(null),
  );

  for (let i = 0; i <= M; i++) dp[i][0] = i;
  for (let j = 0; j <= N; j++) dp[0][j] = j;

  const rowLabels = ["—", ...A.split("")];
  const colLabels = ["—", ...B.split("")];

  function makeGrid(cr: number, cc: number): DPCell[][] {
    return dp.map((row, r) =>
      row.map((v, c) => ({
        value: v,
        state:
          r === cr && c === cc
            ? "active"
            : v !== null
              ? "computed"
              : ("default" as DPCellState),
      })),
    );
  }

  function makeArrows(i: number, j: number): DependencyArrowFrame {
    return {
      kind: "dependency-arrows",
      arrows: [
        { fromRow: i - 1, fromCol: j - 1, toRow: i, toCol: j },
        { fromRow: i - 1, fromCol: j, toRow: i, toCol: j },
        { fromRow: i, fromCol: j - 1, toRow: i, toCol: j },
      ],
      currentRow: i,
      currentCol: j,
    };
  }

  frames.push({
    table: { kind: "2d", cells: makeGrid(-1, -1), rowLabels, colLabels, label: `Edit Distance "${A}" → "${B}"` },
    secondary: { kind: "dependency-arrows", arrows: [], currentRow: 0, currentCol: 0 },
    stats: { from: A, to: B, computing: "base cases" },
  });

  for (let i = 1; i <= M; i++) {
    for (let j = 1; j <= N; j++) {
      const match = A[i - 1] === B[j - 1];

      frames.push({
        table: { kind: "2d", cells: makeGrid(i, j), rowLabels, colLabels, label: `Edit Distance "${A}" → "${B}"` },
        secondary: makeArrows(i, j),
        stats: {
          from: A,
          to: B,
          computing: match
            ? `'${A[i - 1]}' == '${B[j - 1]}' → no cost`
            : `'${A[i - 1]}' ≠ '${B[j - 1]}' → min(ins,del,rep) + 1`,
        },
      });

      dp[i][j] = match
        ? dp[i - 1][j - 1]!
        : Math.min(dp[i - 1][j - 1]!, dp[i - 1][j]!, dp[i][j - 1]!) + 1;

      frames.push({
        table: { kind: "2d", cells: makeGrid(i, j), rowLabels, colLabels, label: `Edit Distance "${A}" → "${B}"` },
        secondary: makeArrows(i, j),
        stats: { from: A, to: B, computing: `dp[${i}][${j}] = ${dp[i][j]}` },
      });
    }
  }

  frames.push({
    table: { kind: "2d", cells: makeGrid(-1, -1), rowLabels, colLabels, label: `Edit Distance "${A}" → "${B}"` },
    secondary: { kind: "dependency-arrows", arrows: [], currentRow: M, currentCol: N },
    stats: { from: A, to: B, result: `edit distance = ${dp[M][N]}` },
  });

  return frames;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
export const DP_ALGORITHMS: DPAlgorithm[] = [
  {
    id: "fibonacci",
    name: "Fibonacci",
    description:
      "Computes Fibonacci numbers bottom-up, filling a 1D memoization table from fib(0) to fib(n). Each value is the sum of the two preceding entries — no redundant recursion.",
    stats: [
      { label: "Input", value: "n = 8" },
      { label: "Result", value: "fib(8) = 21" },
      { label: "Time", value: "O(n)" },
      { label: "Space", value: "O(n)" },
    ],
    variant: "recursion-tree",
    frames: fibonacciFrames(),
  },
  {
    id: "coin-change",
    name: "Coin Change",
    description:
      "Finds the minimum number of coins needed to make a target amount. Builds a 1D table bottom-up: for each amount, tries all coin denominations and takes the best (minimum) result.",
    stats: [
      { label: "Coins", value: "[1, 3, 4]" },
      { label: "Amount", value: "6" },
      { label: "Time", value: "O(amount × coins)" },
      { label: "Space", value: "O(amount)" },
    ],
    variant: "dependency-arrows",
    frames: coinChangeFrames(),
  },
  {
    id: "lis",
    name: "Longest Increasing Subsequence",
    description:
      "Finds the length of the longest strictly increasing subsequence in an array. For each element, scans all previous elements to find the longest chain that can be extended.",
    stats: [
      { label: "Input", value: "[3, 1, 8, 2, 5]" },
      { label: "LIS length", value: "3" },
      { label: "Time", value: "O(n²)" },
      { label: "Space", value: "O(n)" },
    ],
    variant: "lis-scan",
    frames: lisFrames(),
  },
  {
    id: "knapsack",
    name: "0/1 Knapsack",
    description:
      "Maximises total value of items that fit in a knapsack of fixed capacity. Each item can be taken or left — no fractions. Builds a 2D table row by row, each row representing one more item considered.",
    stats: [
      { label: "Items", value: "4 items" },
      { label: "Capacity", value: "5" },
      { label: "Time", value: "O(n × W)" },
      { label: "Space", value: "O(n × W)" },
    ],
    variant: "row-highlight",
    frames: knapsackFrames(),
  },
  {
    id: "lcs",
    name: "Longest Common Subsequence",
    description:
      "Finds the longest subsequence present in both strings. Builds a 2D table where each cell depends on a diagonal (match) or the max of the cell above and to the left (no match).",
    stats: [
      { label: "String A", value: "ABCB" },
      { label: "String B", value: "BDCAB" },
      { label: "Time", value: "O(m × n)" },
      { label: "Space", value: "O(m × n)" },
    ],
    variant: "dependency-arrows",
    frames: lcsFrames(),
  },
  {
    id: "edit-distance",
    name: "Edit Distance",
    description:
      "Computes the minimum number of single-character edits (insert, delete, replace) to transform one string into another. Each cell in the 2D table depends on three neighbours.",
    stats: [
      { label: "From", value: "SUNDAY" },
      { label: "To", value: "SATURDAY" },
      { label: "Time", value: "O(m × n)" },
      { label: "Space", value: "O(m × n)" },
    ],
    variant: "dependency-arrows",
    frames: editDistanceFrames(),
  },
];

const dpMap = new Map<DPAlgorithmId, DPAlgorithm>(DP_ALGORITHMS.map((a) => [a.id, a]));

export function getDPAlgorithm(id: string): DPAlgorithm | undefined {
  return dpMap.get(id as DPAlgorithmId);
}
