import { useEffect, useRef } from "react";

import type { GridCell, GridFrame } from "@/data/pathfinding";

interface GridVisualizerProps {
  frames: GridFrame[];
  fps?: number;
  size?: "sm" | "lg";
}

const HEIGHT: Record<"sm" | "lg", number> = { sm: 100, lg: 300 };
const PAUSE_MS = 800;

// Color palette for each cell state — same vibe as SortVisualizer
const CELL_COLORS: Record<GridCell, string> = {
  empty: "transparent",
  wall: "#374151", // gray-700
  start: "#10b981", // emerald
  end: "#f59e0b", // amber
  visited: "#818cf8", // indigo-400
  path: "#f43f5e", // rose
};

const CELL_DARK: Record<GridCell, string> = {
  empty: "transparent",
  wall: "#9ca3af", // gray-400
  start: "#10b981",
  end: "#f59e0b",
  visited: "#6366f1",
  path: "#f43f5e",
};

export function GridVisualizer({ frames, fps = 8, size = "sm" }: GridVisualizerProps) {
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
      const f = frames[index] ?? frames[0];
      const { grid } = f;
      const rows = grid.length;
      const cols = grid[0]?.length ?? 0;
      if (rows === 0 || cols === 0) return;

      const canvasW = canvas.offsetWidth;
      const canvasH = height;
      const cellW = canvasW / cols;
      const cellH = canvasH / rows;
      const gap = 1;
      const colors = isDark() ? CELL_DARK : CELL_COLORS;

      ctx.clearRect(0, 0, canvasW, canvasH);

      // Draw background grid
      ctx.fillStyle = isDark() ? "#1f2937" : "#f3f4f6";
      ctx.fillRect(0, 0, canvasW, canvasH);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = grid[r][c];
          const color = colors[cell];
          if (color === "transparent") continue;

          const x = c * cellW + gap;
          const y = r * cellH + gap;
          const w = cellW - gap * 2;
          const h2 = cellH - gap * 2;

          ctx.fillStyle = color;
          const radius = Math.min(2, w / 4);
          ctx.beginPath();
          ctx.roundRect(x, y, w, h2, radius);
          ctx.fill();
        }
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
