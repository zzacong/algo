import { beforeEach, describe, expect, it } from "vitest";

import { TREE_ALGORITHMS, type TreeFrame, type TreeNode } from "./trees.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Find the node with a given value in a frame (excludes "deleted" state nodes). */
function findLiveNode(frame: TreeFrame, value: number): TreeNode | undefined {
  return frame.nodes.find((n) => n.value === value && n.state !== "deleted");
}

/** Return root node of a frame. */
function rootNode(frame: TreeFrame): TreeNode | undefined {
  if (frame.root === null) return undefined;
  return frame.nodes.find((n) => n.id === frame.root);
}

/**
 * Verify BST property recursively over live nodes.
 * Returns true if every non-deleted node satisfies BST ordering.
 */
function isBST(nodes: TreeNode[], id: number | null, min = -Infinity, max = Infinity): boolean {
  if (id === null) return true;
  const n = nodes.find((x) => x.id === id)!;
  if (n.state === "deleted") return true; // skip logical deletions
  if (n.value <= min || n.value >= max) return false;
  return isBST(nodes, n.left, min, n.value) && isBST(nodes, n.right, n.value, max);
}

// ---------------------------------------------------------------------------
// Shared tests for all tree algorithms
// ---------------------------------------------------------------------------

function sharedTreeTests(algorithmId: string) {
  const algo = TREE_ALGORITHMS.find((a) => a.id === algorithmId)!;

  describe(`${algo.name} — shared`, () => {
    it("is registered in TREE_ALGORITHMS", () => {
      expect(algo).toBeDefined();
    });

    it("returns at least 2 frames", () => {
      const frames = algo.run();
      expect(frames.length).toBeGreaterThanOrEqual(2);
    });

    it("each frame has a non-empty nodes array", () => {
      const frames = algo.run();
      for (const f of frames) {
        expect(f.nodes.length).toBeGreaterThan(0);
      }
    });

    it("root field refers to a valid node id in every frame", () => {
      const frames = algo.run();
      for (const f of frames) {
        if (f.root !== null) {
          const rootExists = f.nodes.some((n) => n.id === f.root);
          expect(rootExists).toBe(true);
        }
      }
    });

    it("each frame has a stats object", () => {
      const frames = algo.run();
      for (const f of frames) {
        expect(f.stats).toBeDefined();
        expect(typeof f.stats).toBe("object");
      }
    });

    it("last frame stats include a 'result' entry", () => {
      const frames = algo.run();
      const last = frames[frames.length - 1];
      expect(last.stats["result"]).toBeDefined();
    });
  });
}

for (const id of ["bst-insert", "bst-search", "bst-delete", "avl-rotation"] as const) {
  sharedTreeTests(id);
}

// ---------------------------------------------------------------------------
// BST Insert (insert 55)
// ---------------------------------------------------------------------------

describe("BST Insert — specific", () => {
  const algo = TREE_ALGORITHMS.find((a) => a.id === "bst-insert")!;
  let frames: TreeFrame[];

  beforeEach(() => {
    frames = algo.run();
  });

  it("last frame contains a node with value 55", () => {
    const last = frames[frames.length - 1];
    expect(findLiveNode(last, 55)).toBeDefined();
  });

  it("node 55 is the left child of node 60", () => {
    // Insertion path: 55 > 50 → right (70), 55 < 70 → left (60), 55 < 60 → left child of 60
    const last = frames[frames.length - 1];
    const node55 = findLiveNode(last, 55)!;
    const node60 = findLiveNode(last, 60)!;
    expect(node55.parent).toBe(node60.id);
    expect(node60.left).toBe(node55.id);
  });

  it("root value is still 50 after insertion", () => {
    const last = frames[frames.length - 1];
    expect(rootNode(last)?.value).toBe(50);
  });

  it("seed nodes (50, 30, 70, 20, 40, 60, 80, 65) are all present after insert", () => {
    const last = frames[frames.length - 1];
    const expectedValues = [50, 30, 70, 20, 40, 60, 80, 65];
    for (const v of expectedValues) {
      expect(findLiveNode(last, v)).toBeDefined();
    }
  });

  it("BST property holds in last frame", () => {
    const last = frames[frames.length - 1];
    expect(isBST(last.nodes, last.root)).toBe(true);
  });

  it("a frame with 'inserted' node state appears during the animation", () => {
    const hasInsertedFrame = frames.some((f) => f.nodes.some((n) => n.state === "inserted"));
    expect(hasInsertedFrame).toBe(true);
  });

  it("an 'active' state frame appears while walking the tree", () => {
    const hasActiveFrame = frames.some((f) => f.nodes.some((n) => n.state === "active"));
    expect(hasActiveFrame).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// BST Search (search 65)
// ---------------------------------------------------------------------------

describe("BST Search — specific", () => {
  const algo = TREE_ALGORITHMS.find((a) => a.id === "bst-search")!;
  let frames: TreeFrame[];

  beforeEach(() => {
    frames = algo.run();
  });

  it("a frame has stats.result === 'found 65'", () => {
    const found = frames.some((f) => f.stats["result"] === "found 65");
    expect(found).toBe(true);
  });

  it("the node with value 65 is in state 'found' in some frame", () => {
    const foundFrame = frames.find((f) =>
      f.nodes.some((n) => n.value === 65 && n.state === "found"),
    );
    expect(foundFrame).toBeDefined();
  });

  it("'active' state nodes appear during traversal", () => {
    const hasActive = frames.some((f) => f.nodes.some((n) => n.state === "active"));
    expect(hasActive).toBe(true);
  });

  it("node count stays the same across all frames (search does not modify tree)", () => {
    const baseLiveCount = frames[0].nodes.length;
    for (const f of frames) {
      expect(f.nodes.length).toBe(baseLiveCount);
    }
  });

  it("root is unchanged throughout all frames", () => {
    const initialRoot = frames[0].root;
    for (const f of frames) {
      expect(f.root).toBe(initialRoot);
    }
  });
});

// ---------------------------------------------------------------------------
// BST Delete (delete 30)
// ---------------------------------------------------------------------------

describe("BST Delete — specific", () => {
  const algo = TREE_ALGORITHMS.find((a) => a.id === "bst-delete")!;
  let frames: TreeFrame[];

  beforeEach(() => {
    frames = algo.run();
  });

  it("no live node with value 30 exists in the last frame", () => {
    const last = frames[frames.length - 1];
    expect(findLiveNode(last, 30)).toBeUndefined();
  });

  it("the node with value 30 is replaced by the in-order successor (40)", () => {
    // In-order successor of 30 (with children 20 and 40) is 40.
    const last = frames[frames.length - 1];
    // Position where 30 was (left child of 50) should now hold 40
    const root50 = findLiveNode(last, 50)!;
    const leftChildId = root50.left;
    const leftChild = last.nodes.find((n) => n.id === leftChildId);
    expect(leftChild?.value).toBe(40);
  });

  it("BST property holds in last frame for all live nodes", () => {
    const last = frames[frames.length - 1];
    expect(isBST(last.nodes, last.root)).toBe(true);
  });

  it("root remains 50 after deletion", () => {
    const last = frames[frames.length - 1];
    expect(rootNode(last)?.value).toBe(50);
  });

  it("a 'deleted' state node appears during the animation", () => {
    const hasDeleted = frames.some((f) => f.nodes.some((n) => n.state === "deleted"));
    expect(hasDeleted).toBe(true);
  });

  it("successor found frame has stats.successor defined", () => {
    const succFrame = frames.find((f) => f.stats["successor"] !== undefined);
    expect(succFrame).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// AVL Rotation (left rotation: 10→20→30 becomes 20 as root)
// ---------------------------------------------------------------------------

describe("AVL Rotation — specific", () => {
  const algo = TREE_ALGORITHMS.find((a) => a.id === "avl-rotation")!;
  let frames: TreeFrame[];

  beforeEach(() => {
    frames = algo.run();
  });

  it("initial root is node with value 10 (id 0)", () => {
    expect(frames[0].root).toBe(0);
    expect(rootNode(frames[0])?.value).toBe(10);
  });

  it("last frame root is node with value 20 (id 1)", () => {
    const last = frames[frames.length - 1];
    expect(last.root).toBe(1);
    expect(rootNode(last)?.value).toBe(20);
  });

  it("after rotation node 10 is the left child of node 20", () => {
    const last = frames[frames.length - 1];
    const node20 = last.nodes.find((n) => n.value === 20)!;
    const node10 = last.nodes.find((n) => n.value === 10)!;
    expect(node20.left).toBe(node10.id);
    expect(node10.parent).toBe(node20.id);
  });

  it("after rotation node 30 is the right child of node 20", () => {
    const last = frames[frames.length - 1];
    const node20 = last.nodes.find((n) => n.value === 20)!;
    const node30 = last.nodes.find((n) => n.value === 30)!;
    expect(node20.right).toBe(node30.id);
  });

  it("height in last frame stats is '2'", () => {
    const last = frames[frames.length - 1];
    expect(last.stats["height"]).toBe("2");
  });

  it("a frame with 'rotated' node states appears during animation", () => {
    const hasRotated = frames.some((f) => f.nodes.some((n) => n.state === "rotated"));
    expect(hasRotated).toBe(true);
  });

  it("all 3 nodes are present throughout every frame", () => {
    for (const f of frames) {
      expect(f.nodes.length).toBe(3);
    }
  });
});
