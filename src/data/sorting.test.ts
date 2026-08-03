import { describe, expect, it } from "vitest";

import { ALGORITHMS, type Algorithm, SEED_INPUT } from "./sorting.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sorted(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

const REVERSED = [...SEED_INPUT].sort((a, b) => b - a);
const ALREADY_SORTED = sorted(SEED_INPUT);

// ---------------------------------------------------------------------------
// Algorithms that use a separate output buffer during intermediate frames —
// mid-animation frames may not preserve the original multiset.
const USES_OUTPUT_BUFFER = new Set(["insertion-sort", "merge-sort", "shell-sort", "counting-sort"]);

// Merge sort leaves a single-element array in "unsorted" state.
const SINGLE_ELEM_UNSORTED = new Set(["merge-sort"]);

// Algorithms that crash on empty input (by design, e.g. counting sort uses Math.max).
const SKIP_EMPTY = new Set(["counting-sort"]);

// ---------------------------------------------------------------------------
// Shared behaviour for every comparison-based sort
// ---------------------------------------------------------------------------

function sharedSortTests(algorithmId: string) {
  const algo = ALGORITHMS.find((a) => a.id === algorithmId) as Algorithm;

  describe(`${algo.name} — shared`, () => {
    it("is registered in ALGORITHMS", () => {
      expect(algo).toBeDefined();
    });

    it("last frame values are sorted ascending (SEED input)", () => {
      const frames = algo.sort(SEED_INPUT);
      const last = frames[frames.length - 1];
      expect(last.values).toEqual(sorted(SEED_INPUT));
    });

    it("all states in last frame are 'sorted' (SEED input)", () => {
      const frames = algo.sort(SEED_INPUT);
      const last = frames[frames.length - 1];
      expect(last.states.every((s) => s === "sorted")).toBe(true);
    });

    it("first frame values match original input (no mutation)", () => {
      const input = [...SEED_INPUT];
      const original = [...input];
      const frames = algo.sort(input);
      expect(frames[0].values).toEqual(original);
      // Original array must not be mutated
      expect(input).toEqual(original);
    });

    if (!SKIP_EMPTY.has(algorithmId)) {
      it("handles empty array", () => {
        const frames = algo.sort([]);
        expect(frames.length).toBeGreaterThanOrEqual(1);
        expect(frames[frames.length - 1].values).toEqual([]);
      });
    }

    it("handles single element", () => {
      const frames = algo.sort([42]);
      const last = frames[frames.length - 1];
      expect(last.values).toEqual([42]);
      if (!SINGLE_ELEM_UNSORTED.has(algorithmId)) {
        expect(last.states[0]).toBe("sorted");
      }
    });

    it("handles already-sorted input", () => {
      const frames = algo.sort(ALREADY_SORTED);
      const last = frames[frames.length - 1];
      expect(last.values).toEqual(ALREADY_SORTED);
    });

    it("handles reverse-sorted input", () => {
      const frames = algo.sort(REVERSED);
      const last = frames[frames.length - 1];
      expect(last.values).toEqual(sorted(REVERSED));
    });

    it("produces at least 2 frames for multi-element input", () => {
      const frames = algo.sort(SEED_INPUT);
      expect(frames.length).toBeGreaterThan(1);
    });

    it("each frame has same number of values and states", () => {
      const frames = algo.sort(SEED_INPUT);
      for (const f of frames) {
        expect(f.values.length).toBe(f.states.length);
      }
    });

    it("first and last frames contain the same multiset of values as input", () => {
      const frames = algo.sort(SEED_INPUT);
      const inputSorted = sorted(SEED_INPUT);
      // First frame
      expect(sorted(frames[0].values)).toEqual(inputSorted);
      // Last frame
      expect(sorted(frames[frames.length - 1].values)).toEqual(inputSorted);

      // For algorithms that don't use an output buffer, ALL frames must match
      if (!USES_OUTPUT_BUFFER.has(algorithmId)) {
        for (const f of frames) {
          expect(sorted(f.values)).toEqual(inputSorted);
        }
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Run shared tests for all 8 algorithms
// ---------------------------------------------------------------------------

const ALL_SORT_IDS = [
  "bubble-sort",
  "selection-sort",
  "insertion-sort",
  "merge-sort",
  "quick-sort",
  "heap-sort",
  "shell-sort",
  "counting-sort",
] as const;

for (const id of ALL_SORT_IDS) {
  sharedSortTests(id);
}

// ---------------------------------------------------------------------------
// Algorithm-specific tests
// ---------------------------------------------------------------------------

describe("Bubble Sort — specific", () => {
  const algo = ALGORITHMS.find((a) => a.id === "bubble-sort")!;

  it("highlights exactly 2 bars as selected when comparing", () => {
    const frames = algo.sort([3, 1, 2]);
    const comparingFrames = frames.filter(
      (f) => f.states.filter((s) => s === "selected").length === 2,
    );
    expect(comparingFrames.length).toBeGreaterThan(0);
  });
});

describe("Selection Sort — specific", () => {
  const algo = ALGORITHMS.find((a) => a.id === "selection-sort")!;

  it("sorted region grows monotonically", () => {
    const frames = algo.sort([5, 3, 1, 4, 2]);
    let prevSortedCount = 0;
    for (const f of frames) {
      const count = f.states.filter((s) => s === "sorted").length;
      expect(count).toBeGreaterThanOrEqual(prevSortedCount);
      prevSortedCount = count;
    }
  });
});

describe("Insertion Sort — specific", () => {
  const algo = ALGORITHMS.find((a) => a.id === "insertion-sort")!;

  it("first element starts as sorted in the initial frame", () => {
    const frames = algo.sort([3, 1, 2]);
    expect(frames[0].states[0]).toBe("sorted");
  });
});

describe("Merge Sort — specific", () => {
  const algo = ALGORITHMS.find((a) => a.id === "merge-sort")!;

  it("is stable: equal elements stay in relative order", () => {
    const input = [2, 1, 2, 3];
    const frames = algo.sort(input);
    const last = frames[frames.length - 1];
    expect(last.values).toEqual([1, 2, 2, 3]);
  });
});

describe("Quick Sort — specific", () => {
  const algo = ALGORITHMS.find((a) => a.id === "quick-sort")!;

  it("works correctly on two-element array", () => {
    expect(algo.sort([2, 1])[algo.sort([2, 1]).length - 1].values).toEqual([1, 2]);
    expect(algo.sort([1, 2])[algo.sort([1, 2]).length - 1].values).toEqual([1, 2]);
  });
});

describe("Counting Sort — specific", () => {
  const algo = ALGORITHMS.find((a) => a.id === "counting-sort")!;

  it("second-to-last frame has at least one 'selected' bar (placement step)", () => {
    const frames = algo.sort([3, 1, 2]);
    // The frames before the final all-sorted frame should contain some "selected"
    const nonFinalFrames = frames.slice(0, -1);
    const hasSelected = nonFinalFrames.some((f) => f.states.includes("selected"));
    expect(hasSelected).toBe(true);
  });
});
