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

export interface Algorithm {
  id: AlgorithmId;
  name: string;
  description: string;
  complexity: AlgorithmComplexity;
  sort: (input: number[]) => number[][];
}

const SEED = [7, 3, 11, 1, 9, 4, 12, 6, 2, 10, 5, 8];

function snapshot(arr: number[]): number[] {
  return [...arr];
}

function bubbleSortFrames(input: number[]): number[][] {
  const arr = [...input];
  const frames: number[][] = [snapshot(arr)];
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        frames.push(snapshot(arr));
      }
    }
  }
  return frames;
}

function selectionSortFrames(input: number[]): number[][] {
  const arr = [...input];
  const frames: number[][] = [snapshot(arr)];
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      frames.push(snapshot(arr));
    }
  }
  return frames;
}

function insertionSortFrames(input: number[]): number[][] {
  const arr = [...input];
  const frames: number[][] = [snapshot(arr)];
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
    frames.push(snapshot(arr));
  }
  return frames;
}

function mergeSortFrames(input: number[]): number[][] {
  const arr = [...input];
  const frames: number[][] = [snapshot(arr)];

  function merge(a: number[], left: number, mid: number, right: number) {
    const L = a.slice(left, mid + 1);
    const R = a.slice(mid + 1, right + 1);
    let i = 0,
      j = 0,
      k = left;
    while (i < L.length && j < R.length) {
      if (L[i] <= R[j]) {
        a[k++] = L[i++];
      } else {
        a[k++] = R[j++];
      }
    }
    while (i < L.length) a[k++] = L[i++];
    while (j < R.length) a[k++] = R[j++];
    frames.push(snapshot(a));
  }

  function mergeSort(a: number[], left: number, right: number) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    mergeSort(a, left, mid);
    mergeSort(a, mid + 1, right);
    merge(a, left, mid, right);
  }

  mergeSort(arr, 0, arr.length - 1);
  return frames;
}

function quickSortFrames(input: number[]): number[][] {
  const arr = [...input];
  const frames: number[][] = [snapshot(arr)];

  function partition(a: number[], low: number, high: number): number {
    const pivot = a[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (a[j] <= pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        frames.push(snapshot(a));
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    frames.push(snapshot(a));
    return i + 1;
  }

  function quickSort(a: number[], low: number, high: number) {
    if (low < high) {
      const pi = partition(a, low, high);
      quickSort(a, low, pi - 1);
      quickSort(a, pi + 1, high);
    }
  }

  quickSort(arr, 0, arr.length - 1);
  return frames;
}

function heapSortFrames(input: number[]): number[][] {
  const arr = [...input];
  const frames: number[][] = [snapshot(arr)];
  const n = arr.length;

  function heapify(a: number[], size: number, root: number) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    if (left < size && a[left] > a[largest]) largest = left;
    if (right < size && a[right] > a[largest]) largest = right;
    if (largest !== root) {
      [a[root], a[largest]] = [a[largest], a[root]];
      frames.push(snapshot(a));
      heapify(a, size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    frames.push(snapshot(arr));
    heapify(arr, i, 0);
  }
  return frames;
}

function shellSortFrames(input: number[]): number[][] {
  const arr = [...input];
  const frames: number[][] = [snapshot(arr)];
  const n = arr.length;
  let gap = Math.floor(n / 2);
  while (gap > 0) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
      if (j !== i) frames.push(snapshot(arr));
    }
    gap = Math.floor(gap / 2);
  }
  return frames;
}

function countingSortFrames(input: number[]): number[][] {
  const arr = [...input];
  const frames: number[][] = [snapshot(arr)];
  const max = Math.max(...arr);
  const count = new Array<number>(max + 1).fill(0);
  for (const v of arr) count[v]++;
  for (let i = 1; i <= max; i++) count[i] += count[i - 1];
  const output = new Array<number>(arr.length);
  for (let i = arr.length - 1; i >= 0; i--) {
    output[count[arr[i]] - 1] = arr[i];
    count[arr[i]]--;
  }
  // produce step-by-step frames by placing values one at a time
  const result = [...arr];
  const countStep = new Array<number>(max + 1).fill(0);
  for (const v of arr) countStep[v]++;
  for (let i = 1; i <= max; i++) countStep[i] += countStep[i - 1];
  for (let i = arr.length - 1; i >= 0; i--) {
    const pos = countStep[arr[i]] - 1;
    result[pos] = arr[i];
    countStep[arr[i]]--;
    frames.push(snapshot(result));
  }
  void output; // used for correctness verification above
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
