import { useEffect, useRef } from "react";

import type { NodeState, TreeFrame, TreeNode } from "@/data/trees";

interface TreeVisualizerProps {
  frames: TreeFrame[];
  fps?: number;
  size?: "sm" | "lg";
}

const HEIGHT: Record<"sm" | "lg", number> = { sm: 100, lg: 320 };
const PAUSE_MS = 800;

const NODE_COLORS: Record<NodeState, string> = {
  default: "#6366f1", // indigo
  active: "#f59e0b", // amber
  found: "#10b981", // emerald
  inserted: "#10b981", // emerald
  deleted: "#ef4444", // red
  rotated: "#a78bfa", // violet
};

const NODE_COLORS_DARK: Record<NodeState, string> = {
  default: "#818cf8",
  active: "#fbbf24",
  found: "#34d399",
  inserted: "#34d399",
  deleted: "#f87171",
  rotated: "#c4b5fd",
};

const EDGE_COLOR = "#9ca3af";
const EDGE_COLOR_DARK = "#4b5563";

// ---------------------------------------------------------------------------
// Layout: assign (x, y) positions to each node using level-order traversal.
// x is computed as the column index within the level, then normalised to [0,1].
// ---------------------------------------------------------------------------
interface NodePos {
  x: number; // normalised 0–1
  y: number; // normalised 0–1
}

function computeLayout(nodes: TreeNode[], root: number | null): Map<number, NodePos> {
  const pos = new Map<number, NodePos>();
  if (root === null || nodes.length === 0) return pos;

  // BFS to assign (level, column) then normalise
  const queue: Array<{ id: number; level: number; minX: number; maxX: number }> = [
    { id: root, level: 0, minX: 0, maxX: 1 },
  ];
  const maxLevel = Math.ceil(Math.log2(nodes.length + 1));

  while (queue.length > 0) {
    const { id, level, minX, maxX } = queue.shift()!;
    const node = nodes.find((n) => n.id === id);
    if (!node) continue;

    const midX = (minX + maxX) / 2;
    // Leave top/bottom padding — y in range [0.08, 0.92]
    const y = maxLevel <= 1 ? 0.5 : 0.08 + (level / (maxLevel - 1)) * 0.84;
    pos.set(id, { x: midX, y });

    if (node.left !== null) {
      queue.push({ id: node.left, level: level + 1, minX, maxX: midX });
    }
    if (node.right !== null) {
      queue.push({ id: node.right, level: level + 1, minX: midX, maxX });
    }
  }

  return pos;
}

export function TreeVisualizer({ frames, fps = 6, size = "sm" }: TreeVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frames.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const height = HEIGHT[size];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameIndex = reducedMotion ? frames.length - 1 : 0;
    let lastFrameTime = performance.now();
    let pauseUntil = 0;
    let rafHandle = 0;

    function isDark(): boolean {
      return document.documentElement.classList.contains("dark");
    }

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      ctx!.scale(devicePixelRatio, devicePixelRatio);
    }

    resizeCanvas();

    function drawFrame(index: number) {
      if (!canvas || !ctx) return;
      const f: TreeFrame = frames[index] ?? frames[0];
      const { nodes, root } = f;

      const canvasW = canvas.offsetWidth;
      const canvasH = height;
      const dark = isDark();
      const nodeColors = dark ? NODE_COLORS_DARK : NODE_COLORS;
      const edgeColor = dark ? EDGE_COLOR_DARK : EDGE_COLOR;

      ctx.clearRect(0, 0, canvasW, canvasH);

      if (nodes.length === 0 || root === null) return;

      // Filter out "deleted" nodes from layout
      const visibleNodes = nodes.filter((n) => n.state !== "deleted");
      const layout = computeLayout(visibleNodes, root);

      const nodeRadius = size === "lg" ? 18 : 11;
      const fontSize = size === "lg" ? 11 : 7;

      // Compute pixel positions — inset by nodeRadius so circles aren't clipped
      function px(id: number): { x: number; y: number } | null {
        const p = layout.get(id);
        if (!p) return null;
        return {
          x: nodeRadius + p.x * (canvasW - 2 * nodeRadius),
          y: nodeRadius + p.y * (canvasH - 2 * nodeRadius),
        };
      }

      // Draw edges first (behind nodes)
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = size === "lg" ? 1.5 : 1;
      for (const node of visibleNodes) {
        if (node.state === "deleted") continue;
        const from = px(node.id);
        if (!from) continue;
        for (const childId of [node.left, node.right]) {
          if (childId === null) continue;
          const child = nodes.find((n) => n.id === childId);
          if (!child || child.state === "deleted") continue;
          const to = px(childId);
          if (!to) continue;
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
        }
      }

      // Draw nodes
      for (const node of visibleNodes) {
        if (node.state === "deleted") continue;
        const p = px(node.id);
        if (!p) continue;

        // Circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColors[node.state];
        ctx.fill();

        // Value label
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(node.value), p.x, p.y);
      }
    }

    function draw(now: number) {
      if (!canvas || !ctx) return;
      const interval = 1000 / fps;

      if (now >= pauseUntil && now - lastFrameTime >= interval) {
        lastFrameTime = now;
        frameIndex++;
        if (frameIndex >= frames.length) {
          frameIndex = 0;
          pauseUntil = now + PAUSE_MS;
        }
      }

      drawFrame(frameIndex);
      rafHandle = requestAnimationFrame(draw);
    }

    if (reducedMotion) {
      drawFrame(frameIndex);
    } else {
      rafHandle = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => {
      if (!canvas || !ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      resizeCanvas();
      if (reducedMotion) drawFrame(frameIndex);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(rafHandle);
      ro.disconnect();
    };
  }, [frames, fps, size]);

  return (
    <div aria-hidden="true" className="w-full overflow-hidden" style={{ height: HEIGHT[size] }}>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: HEIGHT[size], display: "block" }}
      />
    </div>
  );
}
