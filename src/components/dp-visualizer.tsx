import { useEffect, useRef } from "react";

import type {
  DPFrame,
  DPSecondaryVariant,
  DependencyArrowFrame,
  LISScanFrame,
  RecursionTreeFrame,
  RowHighlightFrame,
} from "@/data/dp";

interface DPVisualizerProps {
  frames: DPFrame[];
  variant: DPSecondaryVariant;
  fps?: number;
  size?: "sm" | "lg";
}

const CANVAS_HEIGHT: Record<"sm" | "lg", number> = { sm: 80, lg: 260 };
const PAUSE_MS = 900;

// ---------------------------------------------------------------------------
// Theme helpers
// ---------------------------------------------------------------------------
function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

function getColors() {
  const dark = isDark();
  return {
    bg: dark ? "#1c1c1c" : "#f8f9fa",
    border: dark ? "#374151" : "#e5e7eb",
    cellDefault: dark ? "#27272a" : "#f1f5f9",
    cellDefaultText: dark ? "#71717a" : "#94a3b8",
    cellComputed: dark ? "#334155" : "#e2e8f0",
    cellComputedText: dark ? "#94a3b8" : "#475569",
    cellActive: dark ? "#3b82f6" : "#2563eb",
    cellActiveText: "#ffffff",
    cellHighlight: dark ? "#7c3aed" : "#6d28d9",
    cellHighlightText: "#ffffff",
    cellCurrent: dark ? "#0f766e" : "#0d9488",
    cellCurrentText: "#ffffff",
    nodeDefault: dark ? "#374151" : "#e5e7eb",
    nodeDefaultText: dark ? "#9ca3af" : "#6b7280",
    nodeActive: dark ? "#3b82f6" : "#2563eb",
    nodeActiveText: "#ffffff",
    nodeCached: dark ? "#059669" : "#10b981",
    nodeCachedText: "#ffffff",
    edge: dark ? "#4b5563" : "#d1d5db",
    arrow: dark ? "#3b82f6" : "#2563eb",
    accepted: dark ? "#059669" : "#10b981",
    comparing: dark ? "#f59e0b" : "#d97706",
    text: dark ? "#e5e7eb" : "#1f2937",
    prevRowHighlight: dark ? "#1d4ed8" : "#bfdbfe",
    prevRowHighlightText: dark ? "#bfdbfe" : "#1d4ed8",
  };
}

// ---------------------------------------------------------------------------
// Left canvas — DP table renderer
// ---------------------------------------------------------------------------
function drawTable(ctx: CanvasRenderingContext2D, frame: DPFrame, w: number, h: number) {
  const c = getColors();
  const { table } = frame;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, w, h);

  if (table.kind === "1d") {
    const cells = table.cells;
    const N = cells.length;
    if (N === 0) return;

    const PAD = 4;
    const cellW = Math.min(48, (w - PAD * 2) / N);
    const cellH = Math.min(36, h - PAD * 2 - 14);
    const startX = (w - cellW * N) / 2;
    const startY = (h - cellH - 14) / 2;

    // Row label
    if (table.label) {
      ctx.fillStyle = c.cellComputedText;
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(table.label, w / 2, startY - 4);
    }

    for (let i = 0; i < N; i++) {
      const cell = cells[i];
      const x = startX + i * cellW;
      const y = startY;
      const gap = 2;

      let bg = c.cellDefault;
      let fg = c.cellDefaultText;
      if (cell.state === "active") {
        bg = c.cellActive;
        fg = c.cellActiveText;
      } else if (cell.state === "current") {
        bg = c.cellCurrent;
        fg = c.cellCurrentText;
      } else if (cell.state === "highlight") {
        bg = c.cellHighlight;
        fg = c.cellHighlightText;
      } else if (cell.state === "computed" && cell.value !== null) {
        bg = c.cellComputed;
        fg = c.cellComputedText;
      }

      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(x + gap, y, cellW - gap * 2, cellH, 3);
      ctx.fill();

      // Index label below
      ctx.fillStyle = c.cellComputedText;
      ctx.font = "9px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(i), x + cellW / 2, y + cellH + 10);

      // Value inside
      if (cell.value !== null) {
        ctx.fillStyle = fg;
        ctx.font = `bold ${Math.min(13, cellW * 0.5)}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(cell.value), x + cellW / 2, y + cellH / 2);
        ctx.textBaseline = "alphabetic";
      }
    }
  } else {
    // 2D table
    const rows = table.cells;
    const nRows = rows.length;
    const nCols = rows[0]?.length ?? 0;
    if (nRows === 0 || nCols === 0) return;

    const hasRowLabels = (table.rowLabels?.length ?? 0) > 0;
    const hasColLabels = (table.colLabels?.length ?? 0) > 0;

    const PAD = 2;
    const labelW = hasRowLabels ? 28 : 0;
    const labelH = hasColLabels ? 14 : 0;
    const usableW = w - PAD * 2 - labelW;
    const usableH = h - PAD * 2 - labelH;
    const cellW = Math.max(8, usableW / nCols);
    const cellH = Math.max(8, usableH / nRows);
    const originX = PAD + labelW;
    const originY = PAD + labelH;

    // Col labels
    if (hasColLabels && table.colLabels) {
      ctx.fillStyle = c.cellComputedText;
      ctx.font = "8px system-ui, sans-serif";
      ctx.textAlign = "center";
      for (let j = 0; j < nCols; j++) {
        ctx.fillText(table.colLabels[j] ?? "", originX + j * cellW + cellW / 2, PAD + 10);
      }
    }

    // Row labels
    if (hasRowLabels && table.rowLabels) {
      ctx.fillStyle = c.cellComputedText;
      ctx.font = "8px system-ui, sans-serif";
      ctx.textAlign = "right";
      for (let i = 0; i < nRows; i++) {
        const label = table.rowLabels[i] ?? "";
        const display = label.length > 4 ? label.slice(0, 4) : label;
        ctx.fillText(display, PAD + labelW - 2, originY + i * cellH + cellH / 2 + 3);
      }
    }

    for (let i = 0; i < nRows; i++) {
      for (let j = 0; j < nCols; j++) {
        const cell = rows[i][j];
        const x = originX + j * cellW;
        const y = originY + i * cellH;
        const gap = 1;

        let bg = c.cellDefault;
        let fg = c.cellDefaultText;
        if (cell.state === "active") {
          bg = c.cellActive;
          fg = c.cellActiveText;
        } else if (cell.state === "current") {
          bg = c.cellCurrent;
          fg = c.cellCurrentText;
        } else if (cell.state === "highlight") {
          bg = c.cellHighlight;
          fg = c.cellHighlightText;
        } else if (cell.state === "computed" && cell.value !== null) {
          bg = c.cellComputed;
          fg = c.cellComputedText;
        }

        ctx.fillStyle = bg;
        ctx.fillRect(x + gap, y + gap, cellW - gap * 2, cellH - gap * 2);

        if (cell.value !== null && cellW >= 10 && cellH >= 10) {
          const fs = Math.min(10, cellW * 0.55, cellH * 0.55);
          ctx.fillStyle = fg;
          ctx.font = `${fs}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(cell.value), x + cellW / 2, y + cellH / 2);
          ctx.textBaseline = "alphabetic";
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Right canvas — secondary renderers
// ---------------------------------------------------------------------------

function drawRecursionTree(
  ctx: CanvasRenderingContext2D,
  sec: RecursionTreeFrame,
  w: number,
  h: number,
) {
  const c = getColors();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, w, h);

  const { nodes } = sec;
  if (nodes.length === 0) return;

  // Compute level-order layout: group nodes by depth from root(s)
  const idMap = new Map(nodes.map((n) => [n.id, n]));
  const depths = new Map<number, number>();
  const roots = nodes.filter((n) => n.parentId === null);
  if (roots.length === 0) return;

  function computeDepth(id: number, depth: number) {
    depths.set(id, depth);
    for (const n of nodes) {
      if (n.parentId === id) computeDepth(n.id, depth + 1);
    }
  }
  for (const r of roots) computeDepth(r.id, 0);

  const maxDepth = Math.max(...depths.values());
  const levelNodes = new Map<number, number[]>();
  for (const [id, d] of depths) {
    if (!levelNodes.has(d)) levelNodes.set(d, []);
    levelNodes.get(d)!.push(id);
  }

  const R = Math.min(14, w / (nodes.length + 1), h / ((maxDepth + 1) * 2.5));
  const levelH = (h - R * 2) / (maxDepth + 1);
  const positions = new Map<number, { x: number; y: number }>();

  for (const [depth, ids] of levelNodes) {
    const y = R + depth * levelH + levelH / 2;
    const segW = w / (ids.length + 1);
    ids.forEach((id, i) => {
      positions.set(id, { x: segW * (i + 1), y });
    });
  }

  // Draw edges first
  ctx.strokeStyle = c.edge;
  ctx.lineWidth = 1;
  for (const n of nodes) {
    if (n.parentId === null) continue;
    const from = positions.get(n.parentId);
    const to = positions.get(n.id);
    if (!from || !to) continue;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  // Draw nodes
  for (const n of nodes) {
    const pos = positions.get(n.id);
    if (!pos) continue;
    void idMap;

    let bg = c.nodeDefault;
    let fg = c.nodeDefaultText;
    if (n.state === "active") {
      bg = c.nodeActive;
      fg = c.nodeActiveText;
    } else if (n.state === "cached") {
      bg = c.nodeCached;
      fg = c.nodeCachedText;
    }

    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, R, 0, Math.PI * 2);
    ctx.fill();

    const label = n.label.replace("fib(", "").replace(")", "");
    const fs = Math.max(7, R * 0.7);
    ctx.fillStyle = fg;
    ctx.font = `bold ${fs}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, pos.x, pos.y);
    ctx.textBaseline = "alphabetic";
  }
}

function drawDependencyArrows(
  ctx: CanvasRenderingContext2D,
  sec: DependencyArrowFrame,
  frame: DPFrame,
  w: number,
  h: number,
) {
  const c = getColors();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, w, h);

  // Re-draw mini table then overlay arrows
  if (frame.table.kind === "1d") {
    // 1D: draw cells in a row, then draw arrows between them
    const cells = frame.table.cells;
    const N = cells.length;
    if (N === 0) return;

    const PAD = 6;
    const cellW = Math.min(44, (w - PAD * 2) / N);
    const cellH = Math.min(30, h / 2 - PAD);
    const startX = (w - cellW * N) / 2;
    const startY = h / 2 - cellH / 2;

    // Draw cells
    for (let i = 0; i < N; i++) {
      const cell = cells[i];
      const x = startX + i * cellW + 1;
      const y = startY;
      let bg = c.cellDefault;
      let fg = c.cellDefaultText;
      if (i === sec.currentCol) {
        bg = c.cellActive;
        fg = c.cellActiveText;
      } else if (cell.state === "computed" && cell.value !== null) {
        bg = c.cellComputed;
        fg = c.cellComputedText;
      }

      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(x, y, cellW - 2, cellH, 2);
      ctx.fill();

      if (cell.value !== null) {
        ctx.fillStyle = fg;
        ctx.font = `bold ${Math.min(11, cellW * 0.45)}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(cell.value), x + (cellW - 2) / 2, y + cellH / 2);
        ctx.textBaseline = "alphabetic";
      }

      ctx.fillStyle = c.cellComputedText;
      ctx.font = "8px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(i), x + (cellW - 2) / 2, startY + cellH + 10);
    }

    // Draw arrows
    for (const arrow of sec.arrows) {
      const fromX = startX + arrow.fromCol * cellW + cellW / 2;
      const toX = startX + arrow.toCol * cellW + cellW / 2;
      const arrowY = startY - 6;

      ctx.strokeStyle = c.arrow;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(fromX, arrowY);
      ctx.lineTo(toX - 4, arrowY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead
      ctx.fillStyle = c.arrow;
      ctx.beginPath();
      ctx.moveTo(toX, arrowY);
      ctx.lineTo(toX - 6, arrowY - 3);
      ctx.lineTo(toX - 6, arrowY + 3);
      ctx.fill();
    }
  } else {
    // 2D: draw mini table + overlay arrows
    const rows = frame.table.cells;
    const nRows = rows.length;
    const nCols = rows[0]?.length ?? 0;
    if (nRows === 0 || nCols === 0) return;

    const PAD = 4;
    const cellW = Math.max(8, (w - PAD * 2) / nCols);
    const cellH = Math.max(8, (h - PAD * 2) / nRows);

    for (let i = 0; i < nRows; i++) {
      for (let j = 0; j < nCols; j++) {
        const cell = rows[i][j];
        const x = PAD + j * cellW;
        const y = PAD + i * cellH;
        const isTarget = i === sec.currentRow && j === sec.currentCol;
        const isSource = sec.arrows.some((a) => a.fromRow === i && a.fromCol === j);

        let bg = c.cellDefault;
        let fg = c.cellDefaultText;
        if (isTarget) {
          bg = c.cellActive;
          fg = c.cellActiveText;
        } else if (isSource) {
          bg = c.cellHighlight;
          fg = c.cellHighlightText;
        } else if (cell.state === "computed" && cell.value !== null) {
          bg = c.cellComputed;
          fg = c.cellComputedText;
        }

        ctx.fillStyle = bg;
        ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

        if (cell.value !== null && cellW >= 10 && cellH >= 10) {
          const fs = Math.min(9, cellW * 0.55, cellH * 0.55);
          ctx.fillStyle = fg;
          ctx.font = `${fs}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(cell.value), x + cellW / 2, y + cellH / 2);
          ctx.textBaseline = "alphabetic";
        }
      }
    }

    // Draw arrows
    ctx.strokeStyle = c.arrow;
    ctx.fillStyle = c.arrow;
    ctx.lineWidth = 1.5;

    for (const arrow of sec.arrows) {
      const fromCX = PAD + arrow.fromCol * cellW + cellW / 2;
      const fromCY = PAD + arrow.fromRow * cellH + cellH / 2;
      const toCX = PAD + arrow.toCol * cellW + cellW / 2;
      const toCY = PAD + arrow.toRow * cellH + cellH / 2;

      const dx = toCX - fromCX;
      const dy = toCY - fromCY;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1) continue;

      const ux = dx / len;
      const uy = dy / len;
      const r = Math.min(cellW, cellH) / 2;

      const x1 = fromCX + ux * r;
      const y1 = fromCY + uy * r;
      const x2 = toCX - ux * r;
      const y2 = toCY - uy * r;

      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead
      const headLen = 5;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
      ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawLISScan(
  ctx: CanvasRenderingContext2D,
  sec: LISScanFrame,
  frame: DPFrame,
  w: number,
  h: number,
) {
  const c = getColors();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, w, h);

  // The input array is encoded in the dp table indices — we need to recover it.
  // For LIS, we show the original input array as boxes, coloring by scan state.
  // Input is baked into the frame count so we derive it from the table size.
  const dpCells = frame.table.kind === "1d" ? frame.table.cells : [];
  const N = dpCells.length;
  if (N === 0) return;

  // Hard-coded input to match the data layer (same values)
  const INPUT = [3, 1, 8, 2, 5];

  const PAD = 6;
  const cellW = Math.min(44, (w - PAD * 2) / N);
  const cellH = Math.min(32, h / 2 - 4);
  const startX = (w - cellW * N) / 2;
  const topY = 8;
  const dpY = topY + cellH + 24;

  // Title
  ctx.fillStyle = c.cellComputedText;
  ctx.font = "9px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("input", w / 2, topY - 2);
  ctx.fillText("dp", w / 2, dpY - 2);

  // Input array
  for (let i = 0; i < N; i++) {
    const x = startX + i * cellW + 1;
    const isCurrent = i === sec.current;
    const isComparing = sec.comparing.includes(i);
    const isAccepted = sec.accepted.includes(i);

    let bg = c.cellDefault;
    let fg = c.cellDefaultText;
    if (isCurrent) {
      bg = c.cellActive;
      fg = c.cellActiveText;
    } else if (isComparing) {
      bg = c.comparing;
      fg = "#ffffff";
    } else if (isAccepted) {
      bg = c.accepted;
      fg = "#ffffff";
    }

    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(x, topY, cellW - 2, cellH, 2);
    ctx.fill();

    ctx.fillStyle = fg;
    ctx.font = `bold ${Math.min(12, cellW * 0.5)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(INPUT[i] ?? ""), x + (cellW - 2) / 2, topY + cellH / 2);
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = c.cellComputedText;
    ctx.font = "8px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(i), x + (cellW - 2) / 2, topY + cellH + 10);
  }

  // DP array
  for (let i = 0; i < N; i++) {
    const cell = dpCells[i];
    const x = startX + i * cellW + 1;
    let bg = c.cellDefault;
    let fg = c.cellDefaultText;
    if (cell.state === "active") {
      bg = c.cellActive;
      fg = c.cellActiveText;
    } else if (cell.state === "computed" && cell.value !== null) {
      bg = c.cellComputed;
      fg = c.cellComputedText;
    }

    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(x, dpY, cellW - 2, cellH, 2);
    ctx.fill();

    if (cell.value !== null) {
      ctx.fillStyle = fg;
      ctx.font = `bold ${Math.min(12, cellW * 0.5)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(cell.value), x + (cellW - 2) / 2, dpY + cellH / 2);
      ctx.textBaseline = "alphabetic";
    }
  }
}

function drawRowHighlight(
  ctx: CanvasRenderingContext2D,
  sec: RowHighlightFrame,
  frame: DPFrame,
  w: number,
  h: number,
) {
  const c = getColors();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, w, h);

  if (frame.table.kind !== "2d") return;
  const rows = frame.table.cells;
  const nRows = rows.length;
  const nCols = rows[0]?.length ?? 0;
  if (nRows === 0 || nCols === 0) return;

  const PAD = 2;
  const hasRowLabels = (frame.table.rowLabels?.length ?? 0) > 0;
  const labelW = hasRowLabels ? 28 : 0;
  const usableW = w - PAD * 2 - labelW;
  const usableH = h - PAD * 2;
  const cellW = Math.max(8, usableW / nCols);
  const cellH = Math.max(8, usableH / nRows);
  const originX = PAD + labelW;
  const originY = PAD;

  if (hasRowLabels && frame.table.rowLabels) {
    ctx.fillStyle = c.cellComputedText;
    ctx.font = "8px system-ui, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i < nRows; i++) {
      const label = frame.table.rowLabels[i] ?? "";
      const display = label.length > 4 ? label.slice(0, 4) : label;
      ctx.fillText(display, PAD + labelW - 2, originY + i * cellH + cellH / 2 + 3);
    }
  }

  for (let i = 0; i < nRows; i++) {
    for (let j = 0; j < nCols; j++) {
      const cell = rows[i][j];
      const x = originX + j * cellW;
      const y = originY + i * cellH;
      const isPrev = i === sec.prevRow && i !== sec.currentRow;
      const isCur = i === sec.currentRow;
      const isActive = cell.state === "active";

      let bg = c.cellDefault;
      let fg = c.cellDefaultText;
      if (isActive) {
        bg = c.cellActive;
        fg = c.cellActiveText;
      } else if (isCur) {
        bg = c.cellCurrent;
        fg = c.cellCurrentText;
      } else if (isPrev) {
        bg = c.prevRowHighlight;
        fg = c.prevRowHighlightText;
      } else if (cell.state === "computed" && cell.value !== null) {
        bg = c.cellComputed;
        fg = c.cellComputedText;
      }

      ctx.fillStyle = bg;
      ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

      if (cell.value !== null && cellW >= 10 && cellH >= 10) {
        const fs = Math.min(9, cellW * 0.55, cellH * 0.55);
        ctx.fillStyle = fg;
        ctx.font = `${fs}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(cell.value), x + cellW / 2, y + cellH / 2);
        ctx.textBaseline = "alphabetic";
      }
    }
  }
}

// ---------------------------------------------------------------------------
// DPVisualizer component
// ---------------------------------------------------------------------------
export function DPVisualizer({ frames, variant, fps = 4, size = "lg" }: DPVisualizerProps) {
  const tableRef = useRef<HTMLCanvasElement>(null);
  const secondaryRef = useRef<HTMLCanvasElement>(null);
  const canvasHeight = CANVAS_HEIGHT[size];

  useEffect(() => {
    const tableCanvas = tableRef.current;
    const secCanvas = secondaryRef.current;
    if (!tableCanvas || !secCanvas || frames.length === 0) return;

    const tCtx = tableCanvas.getContext("2d");
    const sCtx = secCanvas.getContext("2d");
    if (!tCtx || !sCtx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameIndex = reducedMotion ? frames.length - 1 : 0;
    let lastFrameTime = performance.now();
    let pauseUntil = 0;
    let rafHandle = 0;

    function resize() {
      if (!tableCanvas || !secCanvas || !tCtx || !sCtx) return;
      const dpr = devicePixelRatio;

      tableCanvas.width = tableCanvas.offsetWidth * dpr;
      tableCanvas.height = canvasHeight * dpr;
      tCtx.setTransform(1, 0, 0, 1, 0, 0);
      tCtx.scale(dpr, dpr);

      secCanvas.width = secCanvas.offsetWidth * dpr;
      secCanvas.height = canvasHeight * dpr;
      sCtx.setTransform(1, 0, 0, 1, 0, 0);
      sCtx.scale(dpr, dpr);
    }

    resize();

    function drawBoth(idx: number) {
      if (!tableCanvas || !secCanvas || !tCtx || !sCtx) return;
      const f = frames[idx] ?? frames[0];
      const tW = tableCanvas.offsetWidth;
      const sW = secCanvas.offsetWidth;

      drawTable(tCtx, f, tW, canvasHeight);

      const sec = f.secondary;
      if (sec.kind === "recursion-tree") {
        drawRecursionTree(sCtx, sec, sW, canvasHeight);
      } else if (sec.kind === "dependency-arrows") {
        drawDependencyArrows(sCtx, sec, f, sW, canvasHeight);
      } else if (sec.kind === "lis-scan") {
        drawLISScan(sCtx, sec, f, sW, canvasHeight);
      } else if (sec.kind === "row-highlight") {
        drawRowHighlight(sCtx, sec, f, sW, canvasHeight);
      }
    }

    function tick(now: number) {
      if (!tableCanvas) return;
      const interval = 1000 / fps;

      if (now >= pauseUntil && now - lastFrameTime >= interval) {
        lastFrameTime = now;
        frameIndex++;
        if (frameIndex >= frames.length) {
          frameIndex = 0;
          pauseUntil = now + PAUSE_MS;
        }
      }

      drawBoth(frameIndex);
      rafHandle = requestAnimationFrame(tick);
    }

    if (reducedMotion) {
      drawBoth(frameIndex);
    } else {
      rafHandle = requestAnimationFrame(tick);
    }

    const ro = new ResizeObserver(() => {
      if (!tCtx || !sCtx) return;
      resize();
      if (reducedMotion) drawBoth(frameIndex);
    });
    ro.observe(tableCanvas);
    ro.observe(secCanvas);

    return () => {
      cancelAnimationFrame(rafHandle);
      ro.disconnect();
    };
  }, [frames, variant, fps, size, canvasHeight]);

  return (
    <div aria-hidden="true" className="flex w-full gap-2" style={{ height: canvasHeight }}>
      <canvas
        ref={tableRef}
        className="flex-1 rounded-sm"
        style={{ height: canvasHeight, display: "block" }}
      />
      <canvas
        ref={secondaryRef}
        className="flex-1 rounded-sm"
        style={{ height: canvasHeight, display: "block" }}
      />
    </div>
  );
}
