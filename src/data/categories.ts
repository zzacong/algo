export type CategoryStatus = "live" | "coming-soon";

export interface Category {
  id: string;
  name: string;
  description: string;
  route: string;
  count: number | null;
  status: CategoryStatus;
}

export const CATEGORIES: Category[] = [
  {
    id: "sorting",
    name: "Sorting",
    description: "Compare, swap, and place — eight classic algorithms that bring order to chaos.",
    route: "/sorting",
    count: 8,
    status: "live",
  },
  {
    id: "pathfinding",
    name: "Pathfinding",
    description: "Navigate grids and graphs — from brute-force BFS to the elegance of A*.",
    route: "/pathfinding",
    count: 4,
    status: "live",
  },
  {
    id: "trees",
    name: "Trees",
    description: "Insert, search, delete, and rotate — the building blocks of BSTs and AVL trees.",
    route: "/trees",
    count: 4,
    status: "live",
  },
  {
    id: "graphs",
    name: "Graph Algorithms",
    description: "Spanning trees, topological sort, strongly connected components, and more.",
    route: "/graphs",
    count: null,
    status: "coming-soon",
  },
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    description: "Break problems into overlapping subproblems — Fibonacci, knapsack, LCS.",
    route: "/dp",
    count: 6,
    status: "live",
  },
  {
    id: "searching",
    name: "Searching",
    description: "Linear, binary, interpolation — find values faster with the right technique.",
    route: "/searching",
    count: null,
    status: "coming-soon",
  },
];
