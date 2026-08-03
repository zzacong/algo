import { useEffect, useRef } from "react";

interface SortVisualizerProps {
  frames: number[][];
  fps?: number;
  size?: "sm" | "lg";
}

const HEIGHT: Record<"sm" | "lg", number> = { sm: 80, lg: 260 };
const BAR_GAP = 2;
const PAUSE_MS = 700;

export function SortVisualizer({ frames, fps = 10, size = "sm" }: SortVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frames.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const height = HEIGHT[size];
    let frameIndex = 0;
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

    function getColors() {
      const style = getComputedStyle(document.documentElement);
      const primary = style.getPropertyValue("--primary").trim();
      const muted = style.getPropertyValue("--muted").trim();
      return {
        bar: primary,
        bg: muted,
      };
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

      const currentFrame = frames[frameIndex] ?? frames[0];
      const { bar: barColor } = getColors();
      const canvasW = canvas.offsetWidth;
      const canvasH = height;
      const n = currentFrame.length;
      const barW = (canvasW - BAR_GAP * (n + 1)) / n;
      const maxVal = Math.max(...currentFrame);

      ctx.clearRect(0, 0, canvasW, canvasH);

      for (let i = 0; i < n; i++) {
        const barH = (currentFrame[i] / maxVal) * (canvasH - BAR_GAP * 2);
        const x = BAR_GAP + i * (barW + BAR_GAP);
        const y = canvasH - barH;

        // Slightly highlight bars that are in position (last few frames look sorted)
        const isFinalFrame = frameIndex === frames.length - 1;
        ctx.fillStyle = isFinalFrame
          ? getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()
          : barColor;
        ctx.globalAlpha = isFinalFrame ? 1 : 0.75 + 0.25 * (i / n);

        const radius = Math.min(3, barW / 2);
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [radius, radius, 0, 0]);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafHandle = requestAnimationFrame(draw);
    }

    rafHandle = requestAnimationFrame(draw);

    const ro = new ResizeObserver(() => {
      if (!canvas || !ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      resizeCanvas();
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
