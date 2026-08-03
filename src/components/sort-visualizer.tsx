import { useEffect, useRef } from "react";

import type { SortFrame } from "@/data/algorithms";

interface SortVisualizerProps {
  frames: SortFrame[];
  fps?: number;
  size?: "sm" | "lg";
}

const HEIGHT: Record<"sm" | "lg", number> = { sm: 80, lg: 260 };
const BAR_GAP = 2;
const PAUSE_MS = 700;

// Vivid, distinct palette for the three bar states — works in both light and dark
const COLORS = {
  unsorted: "#6366f1", // indigo — the default resting state
  selected: "#f59e0b", // amber — bars being actively compared / moved
  sorted: "#10b981", // emerald — bars that have reached their final position
} as const;

export function SortVisualizer({ frames, fps = 10, size = "sm" }: SortVisualizerProps) {
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

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      ctx!.scale(devicePixelRatio, devicePixelRatio);
    }

    resizeCanvas();

    function drawFrame(index: number) {
      if (!canvas || !ctx) return;
      const currentFrame = frames[index] ?? frames[0];
      const { values, states } = currentFrame;
      const canvasW = canvas.offsetWidth;
      const canvasH = height;
      const n = values.length;
      const barW = (canvasW - BAR_GAP * (n + 1)) / n;
      const maxVal = Math.max(...values);

      ctx.clearRect(0, 0, canvasW, canvasH);

      for (let i = 0; i < n; i++) {
        const barH = (values[i] / maxVal) * (canvasH - BAR_GAP * 2);
        const x = BAR_GAP + i * (barW + BAR_GAP);
        const y = canvasH - barH;

        ctx.fillStyle = COLORS[states[i]];
        ctx.globalAlpha = 1;

        const radius = Math.min(3, barW / 2);
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [radius, radius, 0, 0]);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
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
