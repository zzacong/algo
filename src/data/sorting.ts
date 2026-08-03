export type AlgorithmId =
  | "bubble-sort"
  | "selection-sort"
  | "insertion-sort"
  | "merge-sort"
  | "quick-sort"
  | "heap-sort"
  | "shell-sort"
  | "counting-sort";

export interface AlgorithmComplexity {
  best: string;
  average: string;
  worst: string;
  space: string;
}

/** State of each bar in a single frame */
export type BarState = "unsorted" | "selected" | "sorted";

/** A single animation frame: parallel arrays of values and per-bar states */
export interface SortFrame {
  values: number[];
  states: BarState[];
}

export interface Algorithm {
  id: AlgorithmId;
  name: string;
  description: string;
  complexity: AlgorithmComplexity;
  sort: (input: number[]) => SortFrame[];
}

const SEED = [7, 3, 11, 1, 9, 4, 12, 6, 2, 10, 5, 8];

function frame(arr: number[], states: BarState[]): SortFrame {
  return { values: [...arr], states: [...states] };
}

function allUnsorted(n: number): BarState[] {
  return new Array<BarState>(n).fill("unsorted");
}

function bubbleSortFrames(input: number[]): SortFrame[] {
  const arr = [...input];
  const n = arr.length;
  const sortedFrom = n; // index at which sorted region starts (from the right)
  const frames: SortFrame[] = [];

  // Build a mutable states array
  const states: BarState[] = allUnsorted(n);
  frames.push(frame(arr, states));

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      // Highlight the two bars being compared
      states[j] = "selected";
      states[j + 1] = "selected";
      frames.push(frame(arr, states));

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        frames.push(frame(arr, states));
      }

      states[j] = "unsorted";
      states[j + 1] = "unsorted";
    }
    // The last position in this pass is now sorted
    states[n - 1 - i] = "sorted";
  }
  states[0] = "sorted";
  frames.push(frame(arr, states));
  void sortedFrom;
  return frames;
}

function selectionSortFrames(input: number[]): SortFrame[] {
  const arr = [...input];
  const n = arr.length;
  const states: BarState[] = allUnsorted(n);
  const frames: SortFrame[] = [frame(arr, states)];

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    states[minIdx] = "selected";

    for (let j = i + 1; j < n; j++) {
      states[j] = "selected";
      frames.push(frame(arr, states));
      if (arr[j] < arr[minIdx]) {
        states[minIdx] = "unsorted";
        minIdx = j;
        states[minIdx] = "selected";
      } else {
        states[j] = "unsorted";
      }
    }

    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      states[minIdx] = "unsorted";
    }
    states[i] = "sorted";
    frames.push(frame(arr, states));
  }
  states[n - 1] = "sorted";
  frames.push(frame(arr, states));
  return frames;
}

function insertionSortFrames(input: number[]): SortFrame[] {
  const arr = [...input];
  const n = arr.length;
  const states: BarState[] = allUnsorted(n);
  // element 0 is trivially sorted
  states[0] = "sorted";
  const frames: SortFrame[] = [frame(arr, states)];

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    states[i] = "selected";
    frames.push(frame(arr, states));

    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      states[j + 1] = "selected";
      frames.push(frame(arr, states));
      states[j + 1] = "sorted";
      j--;
    }
    arr[j + 1] = key;
    states[j + 1] = "sorted";
    frames.push(frame(arr, states));
  }
  return frames;
}

function mergeSortFrames(input: number[]): SortFrame[] {
  const arr = [...input];
  const n = arr.length;
  const states: BarState[] = allUnsorted(n);
  const frames: SortFrame[] = [frame(arr, states)];

  function merge(a: number[], left: number, mid: number, right: number) {
    const L = a.slice(left, mid + 1);
    const R = a.slice(mid + 1, right + 1);
    let i = 0,
      j = 0,
      k = left;

    while (i < L.length && j < R.length) {
      states[k] = "selected";
      if (L[i] <= R[j]) {
        a[k++] = L[i++];
      } else {
        a[k++] = R[j++];
      }
      frames.push(frame(a, states));
      states[k - 1] = "sorted";
    }
    while (i < L.length) {
      states[k] = "selected";
      a[k++] = L[i++];
      frames.push(frame(a, states));
      states[k - 1] = "sorted";
    }
    while (j < R.length) {
      states[k] = "selected";
      a[k++] = R[j++];
      frames.push(frame(a, states));
      states[k - 1] = "sorted";
    }
    // mark the merged region as sorted
    for (let x = left; x <= right; x++) states[x] = "sorted";
    frames.push(frame(a, states));
  }

  function mergeSort(a: number[], left: number, right: number) {
    if (left >= right) {
      states[left] = "sorted";
      return;
    }
    const mid = Math.floor((left + right) / 2);
    mergeSort(a, left, mid);
    mergeSort(a, mid + 1, right);
    merge(a, left, mid, right);
  }

  mergeSort(arr, 0, n - 1);
  return frames;
}

function quickSortFrames(input: number[]): SortFrame[] {
  const arr = [...input];
  const n = arr.length;
  const states: BarState[] = allUnsorted(n);
  const frames: SortFrame[] = [frame(arr, states)];

  function partition(a: number[], low: number, high: number): number {
    const pivot = a[high];
    states[high] = "selected";
    let i = low - 1;
    for (let j = low; j < high; j++) {
      states[j] = "selected";
      frames.push(frame(a, states));
      if (a[j] <= pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        frames.push(frame(a, states));
      }
      states[j] = "unsorted";
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    states[high] = "unsorted";
    states[i + 1] = "sorted";
    frames.push(frame(a, states));
    return i + 1;
  }

  function quickSort(a: number[], low: number, high: number) {
    if (low < high) {
      const pi = partition(a, low, high);
      quickSort(a, low, pi - 1);
      quickSort(a, pi + 1, high);
    } else if (low === high) {
      states[low] = "sorted";
    }
  }

  quickSort(arr, 0, n - 1);
  // mark any remaining unsorted as sorted (final state)
  for (let i = 0; i < n; i++) states[i] = "sorted";
  frames.push(frame(arr, states));
  return frames;
}

function heapSortFrames(input: number[]): SortFrame[] {
  const arr = [...input];
  const n = arr.length;
  const states: BarState[] = allUnsorted(n);
  const frames: SortFrame[] = [frame(arr, states)];

  function heapify(a: number[], size: number, root: number) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    if (left < size && a[left] > a[largest]) largest = left;
    if (right < size && a[right] > a[largest]) largest = right;
    if (largest !== root) {
      states[root] = "selected";
      states[largest] = "selected";
      [a[root], a[largest]] = [a[largest], a[root]];
      frames.push(frame(a, states));
      states[root] = "unsorted";
      states[largest] = "unsorted";
      heapify(a, size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);

  for (let i = n - 1; i > 0; i--) {
    states[0] = "selected";
    states[i] = "selected";
    [arr[0], arr[i]] = [arr[i], arr[0]];
    frames.push(frame(arr, states));
    states[0] = "unsorted";
    states[i] = "sorted";
    heapify(arr, i, 0);
  }
  states[0] = "sorted";
  frames.push(frame(arr, states));
  return frames;
}

function shellSortFrames(input: number[]): SortFrame[] {
  const arr = [...input];
  const n = arr.length;
  const states: BarState[] = allUnsorted(n);
  const frames: SortFrame[] = [frame(arr, states)];
  let gap = Math.floor(n / 2);

  while (gap > 0) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      states[i] = "selected";
      frames.push(frame(arr, states));

      while (j >= gap && arr[j - gap] > temp) {
        states[j - gap] = "selected";
        arr[j] = arr[j - gap];
        frames.push(frame(arr, states));
        states[j - gap] = "unsorted";
        states[j] = "unsorted";
        j -= gap;
      }
      arr[j] = temp;
      states[j] = "unsorted";
      frames.push(frame(arr, states));
    }
    gap = Math.floor(gap / 2);
  }

  // Final frame: all sorted
  for (let i = 0; i < n; i++) states[i] = "sorted";
  frames.push(frame(arr, states));
  return frames;
}

function countingSortFrames(input: number[]): SortFrame[] {
  const arr = [...input];
  const n = arr.length;
  const states: BarState[] = allUnsorted(n);
  const frames: SortFrame[] = [frame(arr, states)];

  const max = Math.max(...arr);
  const countStep = new Array<number>(max + 1).fill(0);
  for (const v of arr) countStep[v]++;
  for (let i = 1; i <= max; i++) countStep[i] += countStep[i - 1];

  const result = [...arr];
  const placed = new Array<boolean>(n).fill(false);

  for (let i = n - 1; i >= 0; i--) {
    const pos = countStep[arr[i]] - 1;
    result[pos] = arr[i];
    countStep[arr[i]]--;

    // show the placed bar as selected, previously placed as sorted
    const newStates: BarState[] = result.map((_, idx) => {
      if (placed[idx]) return "sorted";
      if (idx === pos) return "selected";
      return "unsorted";
    });
    placed[pos] = true;
    frames.push({ values: [...result], states: newStates });
  }

  const finalStates: BarState[] = new Array<BarState>(n).fill("sorted");
  frames.push({ values: [...result], states: finalStates });
  return frames;
}

export const ALGORITHMS: Algorithm[] = [
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    description:
      "Repeatedly steps through the list, compares adjacent elements, and swaps them if they're in the wrong order. The largest unsorted element 'bubbles' up to its final position on each pass.",
    complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
    sort: bubbleSortFrames,
  },
  {
    id: "selection-sort",
    name: "Selection Sort",
    description:
      "Divides the array into sorted and unsorted parts. On each pass it finds the minimum element in the unsorted region and places it at the beginning of the sorted region.",
    complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
    sort: selectionSortFrames,
  },
  {
    id: "insertion-sort",
    name: "Insertion Sort",
    description:
      "Builds the sorted array one element at a time by picking each new element and inserting it into its correct position among the already-sorted elements — much like sorting playing cards in your hand.",
    complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
    sort: insertionSortFrames,
  },
  {
    id: "merge-sort",
    name: "Merge Sort",
    description:
      "A divide-and-conquer algorithm that recursively splits the array in half, sorts each half, then merges the two sorted halves back together. Guarantees O(n log n) in all cases.",
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
    sort: mergeSortFrames,
  },
  {
    id: "quick-sort",
    name: "Quick Sort",
    description:
      "Picks a pivot element and partitions the array so elements smaller than the pivot come before it and larger elements after. Recursively sorts the two sub-arrays.",
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
    sort: quickSortFrames,
  },
  {
    id: "heap-sort",
    name: "Heap Sort",
    description:
      "Converts the array into a max-heap, then repeatedly extracts the maximum element and rebuilds the heap. Combines the best of selection sort and binary trees.",
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)" },
    sort: heapSortFrames,
  },
  {
    id: "shell-sort",
    name: "Shell Sort",
    description:
      "An extension of insertion sort that allows the exchange of elements far apart. Starts with a large gap between compared elements, then progressively shrinks the gap until it reaches 1.",
    complexity: { best: "O(n log n)", average: "O(n log² n)", worst: "O(n²)", space: "O(1)" },
    sort: shellSortFrames,
  },
  {
    id: "counting-sort",
    name: "Counting Sort",
    description:
      "A non-comparison sort that works by counting occurrences of each value. Uses prefix sums to calculate the position of each element in the output array. Only works for non-negative integers.",
    complexity: { best: "O(n+k)", average: "O(n+k)", worst: "O(n+k)", space: "O(k)" },
    sort: countingSortFrames,
  },
];

const algorithmMap = new Map<AlgorithmId, Algorithm>(ALGORITHMS.map((a) => [a.id, a]));

export function getAlgorithm(id: string): Algorithm | undefined {
  return algorithmMap.get(id as AlgorithmId);
}

export const SEED_INPUT = SEED;
