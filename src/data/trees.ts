export type TreeAlgorithmId = "bst-insert" | "bst-search" | "bst-delete" | "avl-rotation";

export type NodeState = "default" | "active" | "found" | "inserted" | "deleted" | "rotated";

export interface TreeNode {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  parent: number | null;
  state: NodeState;
}

export interface TreeFrame {
  nodes: TreeNode[];
  /** id of the root node */
  root: number | null;
  stats: Record<string, string>;
}

export interface TreeAlgorithm {
  id: TreeAlgorithmId;
  name: string;
  description: string;
  stats: Array<{ label: string; value: string }>;
  run: () => TreeFrame[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cloneNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((n) => ({ ...n }));
}

function snap(nodes: TreeNode[], root: number | null, stats: Record<string, string>): TreeFrame {
  return { nodes: cloneNodes(nodes), root, stats: { ...stats } };
}

function nodeHeight(nodes: TreeNode[], id: number | null): number {
  if (id === null) return 0;
  const n = nodes.find((x) => x.id === id)!;
  return 1 + Math.max(nodeHeight(nodes, n.left), nodeHeight(nodes, n.right));
}

function nodeCount(nodes: TreeNode[], id: number | null): number {
  if (id === null) return 0;
  const n = nodes.find((x) => x.id === id)!;
  return 1 + nodeCount(nodes, n.left) + nodeCount(nodes, n.right);
}

function resetStates(nodes: TreeNode[]): void {
  for (const n of nodes) n.state = "default";
}

// ---------------------------------------------------------------------------
// Seed BST — insert values in this order so the tree is balanced-ish
// Final tree:
//           50
//         /    \
//       30      70
//      /  \    /  \
//    20   40  60   80
//              \
//              65
// ---------------------------------------------------------------------------
const SEED_VALUES = [50, 30, 70, 20, 40, 60, 80, 65];

function buildSeedTree(): { nodes: TreeNode[]; root: number } {
  const nodes: TreeNode[] = [];
  let nextId = 0;

  function insert(parentId: number | null, value: number): number {
    const id = nextId++;
    nodes.push({ id, value, left: null, right: null, parent: parentId, state: "default" });

    if (parentId === null) return id;

    const parent = nodes.find((n) => n.id === parentId)!;
    if (value < parent.value) {
      parent.left = id;
    } else {
      parent.right = id;
    }
    return id;
  }

  let root = -1;
  for (const v of SEED_VALUES) {
    if (root === -1) {
      root = insert(null, v);
    } else {
      // Walk tree to find insertion point
      let cur = root;
      let parent = -1;
      while (cur !== -1) {
        parent = cur;
        const node = nodes.find((n) => n.id === cur)!;
        if (v < node.value) {
          cur = node.left ?? -1;
          if (cur === -1) {
            insert(parent, v);
            break;
          }
        } else {
          cur = node.right ?? -1;
          if (cur === -1) {
            insert(parent, v);
            break;
          }
        }
      }
    }
  }

  return { nodes, root };
}

// ---------------------------------------------------------------------------
// BST Insert — insert value 55
// ---------------------------------------------------------------------------
function bstInsertFrames(): TreeFrame[] {
  const { nodes, root } = buildSeedTree();
  const frames: TreeFrame[] = [];
  const TARGET = 55;
  const h = () => String(nodeHeight(nodes, root));
  const cnt = () => String(nodeCount(nodes, root));

  frames.push(snap(nodes, root, { height: h(), nodes: cnt(), operation: `insert ${TARGET}` }));

  // Walk and highlight path
  let cur: number | null = root;
  while (cur !== null) {
    const node = nodes.find((n) => n.id === cur)!;
    node.state = "active";
    frames.push(snap(nodes, root, { height: h(), nodes: cnt(), comparing: String(node.value) }));
    node.state = "default";

    if (TARGET < node.value) {
      if (node.left === null) {
        // Insert here
        const newId = nodes.length;
        nodes.push({
          id: newId,
          value: TARGET,
          left: null,
          right: null,
          parent: cur,
          state: "inserted",
        });
        node.left = newId;
        frames.push(
          snap(nodes, root, {
            height: h(),
            nodes: cnt(),
            inserted: String(TARGET),
            position: "left child of " + String(node.value),
          }),
        );
        break;
      }
      cur = node.left;
    } else {
      if (node.right === null) {
        const newId = nodes.length;
        nodes.push({
          id: newId,
          value: TARGET,
          left: null,
          right: null,
          parent: cur,
          state: "inserted",
        });
        node.right = newId;
        frames.push(
          snap(nodes, root, {
            height: h(),
            nodes: cnt(),
            inserted: String(TARGET),
            position: "right child of " + String(node.value),
          }),
        );
        break;
      }
      cur = node.right;
    }
  }

  resetStates(nodes);
  frames.push(snap(nodes, root, { height: h(), nodes: cnt(), result: "done" }));
  return frames;
}

// ---------------------------------------------------------------------------
// BST Search — search for value 65
// ---------------------------------------------------------------------------
function bstSearchFrames(): TreeFrame[] {
  const { nodes, root } = buildSeedTree();
  const frames: TreeFrame[] = [];
  const TARGET = 65;
  const h = () => String(nodeHeight(nodes, root));
  const cnt = () => String(nodeCount(nodes, root));

  frames.push(snap(nodes, root, { height: h(), nodes: cnt(), operation: `search ${TARGET}` }));

  let cur: number | null = root;
  let steps = 0;
  while (cur !== null) {
    const node = nodes.find((n) => n.id === cur)!;
    node.state = "active";
    steps++;
    frames.push(
      snap(nodes, root, {
        height: h(),
        nodes: cnt(),
        comparing: String(node.value),
        steps: String(steps),
      }),
    );

    if (node.value === TARGET) {
      node.state = "found";
      frames.push(
        snap(nodes, root, {
          height: h(),
          nodes: cnt(),
          result: "found " + String(TARGET),
          steps: String(steps),
        }),
      );
      break;
    }
    node.state = "default";
    cur = TARGET < node.value ? node.left : node.right;
  }

  return frames;
}

// ---------------------------------------------------------------------------
// BST Delete — delete value 30 (node with two children)
// ---------------------------------------------------------------------------
function bstDeleteFrames(): TreeFrame[] {
  const { nodes, root } = buildSeedTree();
  const frames: TreeFrame[] = [];
  const TARGET = 30;
  const h = () => String(nodeHeight(nodes, root));
  const cnt = () => String(nodeCount(nodes, root));

  frames.push(snap(nodes, root, { height: h(), nodes: cnt(), operation: `delete ${TARGET}` }));

  // Find the node
  let cur: number | null = root;
  while (cur !== null) {
    const node = nodes.find((n) => n.id === cur)!;
    node.state = "active";
    frames.push(snap(nodes, root, { height: h(), nodes: cnt(), comparing: String(node.value) }));

    if (node.value === TARGET) {
      node.state = "deleted";
      frames.push(
        snap(nodes, root, {
          height: h(),
          nodes: cnt(),
          found: String(TARGET),
          strategy: "find in-order successor",
        }),
      );

      // Find in-order successor (min of right subtree)
      let succParentId = cur;
      let succId = node.right!;
      let succ = nodes.find((n) => n.id === succId)!;
      succ.state = "active";
      while (succ.left !== null) {
        succ.state = "default";
        succParentId = succId;
        succId = succ.left;
        succ = nodes.find((n) => n.id === succId)!;
        succ.state = "active";
        frames.push(snap(nodes, root, { height: h(), nodes: cnt(), successor: "searching…" }));
      }
      succ.state = "found";
      frames.push(snap(nodes, root, { height: h(), nodes: cnt(), successor: String(succ.value) }));

      // Replace target's value with successor's value
      node.value = succ.value;
      node.state = "inserted";

      // Remove successor node
      const succParent = nodes.find((n) => n.id === succParentId)!;
      if (succParent.left === succId) {
        succParent.left = succ.right;
      } else {
        succParent.right = succ.right;
      }
      if (succ.right !== null) {
        const sr = nodes.find((n) => n.id === succ.right!)!;
        sr.parent = succParentId;
      }
      // Mark successor as deleted (hide it by setting a tombstone state)
      succ.state = "deleted";
      frames.push(
        snap(nodes, root, {
          height: h(),
          nodes: String(nodeCount(nodes, root) - 1),
          result: "replaced with " + String(node.value),
        }),
      );

      break;
    }

    node.state = "default";
    cur = TARGET < node.value ? node.left : node.right;
  }

  resetStates(nodes);
  frames.push(snap(nodes, root, { height: h(), nodes: cnt(), result: "done" }));
  return frames;
}

// ---------------------------------------------------------------------------
// AVL Rotation — demonstrate a left rotation on a right-heavy subtree
// We build a simple right-skewed tree then perform a left rotation at root.
// Tree: 10 → 20 → 30  (right-right case) → balanced: 20 as root
// ---------------------------------------------------------------------------
function avlRotationFrames(): TreeFrame[] {
  // Build a fresh unbalanced tree: 10, 20, 30 (right skewed)
  const nodes: TreeNode[] = [
    { id: 0, value: 10, left: null, right: 1, parent: null, state: "default" },
    { id: 1, value: 20, left: null, right: 2, parent: 0, state: "default" },
    { id: 2, value: 30, left: null, right: null, parent: 1, state: "default" },
  ];
  let root: number | null = 0;
  const frames: TreeFrame[] = [];

  frames.push(snap(nodes, root, { height: "3", nodes: "3", operation: "left rotation at 10" }));

  // Highlight imbalance
  nodes[0].state = "active";
  frames.push(snap(nodes, root, { height: "3", nodes: "3", balance: "right-heavy at 10" }));

  // Highlight the pivot
  nodes[1].state = "active";
  frames.push(snap(nodes, root, { height: "3", nodes: "3", pivot: "20 becomes new root" }));

  // Perform left rotation: 20 becomes root, 10 becomes 20's left child
  nodes[0].state = "rotated";
  nodes[1].state = "rotated";

  // Update pointers
  nodes[0].right = null; // 10's right is now null (20 takes over)
  nodes[1].left = 0; // 20's left is now 10
  nodes[1].parent = null;
  nodes[0].parent = 1;
  root = 1;

  frames.push(snap(nodes, root, { height: "2", nodes: "3", result: "balanced — height reduced" }));

  // Show stable final state
  resetStates(nodes);
  frames.push(snap(nodes, root, { height: "2", nodes: "3", result: "done" }));

  return frames;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
export const TREE_ALGORITHMS: TreeAlgorithm[] = [
  {
    id: "bst-insert",
    name: "BST Insert",
    description:
      "Inserts a new value into a binary search tree by traversing left (smaller) or right (larger) at each node until an empty spot is found.",
    stats: [
      { label: "Operation", value: "Insert 55" },
      { label: "Average", value: "O(log n)" },
      { label: "Worst case", value: "O(n)" },
      { label: "Space", value: "O(1)" },
    ],
    run: bstInsertFrames,
  },
  {
    id: "bst-search",
    name: "BST Search",
    description:
      "Finds a value in a binary search tree by comparing at each node and going left if smaller, right if larger — eliminating half the tree at each step.",
    stats: [
      { label: "Operation", value: "Search 65" },
      { label: "Average", value: "O(log n)" },
      { label: "Worst case", value: "O(n)" },
      { label: "Space", value: "O(1)" },
    ],
    run: bstSearchFrames,
  },
  {
    id: "bst-delete",
    name: "BST Delete",
    description:
      "Removes a value from a BST. When the target has two children, it finds the in-order successor (smallest value in the right subtree) and replaces the target with it.",
    stats: [
      { label: "Operation", value: "Delete 30" },
      { label: "Strategy", value: "In-order successor" },
      { label: "Average", value: "O(log n)" },
      { label: "Worst case", value: "O(n)" },
    ],
    run: bstDeleteFrames,
  },
  {
    id: "avl-rotation",
    name: "AVL Rotation",
    description:
      "Demonstrates a left rotation — the core rebalancing operation of AVL trees. When a node becomes right-heavy, its right child is promoted to maintain the height-balance property.",
    stats: [
      { label: "Rotation type", value: "Left (RR case)" },
      { label: "Trigger", value: "Balance factor > 1" },
      { label: "Cost", value: "O(1)" },
      { label: "Result", value: "Height −1" },
    ],
    run: avlRotationFrames,
  },
];

const treeMap = new Map<TreeAlgorithmId, TreeAlgorithm>(TREE_ALGORITHMS.map((a) => [a.id, a]));

export function getTreeAlgorithm(id: string): TreeAlgorithm | undefined {
  return treeMap.get(id as TreeAlgorithmId);
}
