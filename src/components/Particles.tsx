import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type BurstKind = "step" | "shard" | "star" | "void" | "danger" | "gameover";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  gravity: number;
  drag: number;
  streak: boolean;
}

interface Ring {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
  width: number;
}

const PALETTES: Record<
  BurstKind,
  { colors: string[]; count: number; speed: number; gravity: number; ring?: string }
> = {
  step: {
    colors: ["116,214,186", "206,240,224", "233,201,135"],
    count: 6,
    speed: 55,
    gravity: 20,
  },
  shard: {
    colors: ["116,214,186", "190,246,226", "233,201,135", "255,244,213"],
    count: 34,
    speed: 215,
    gravity: 65,
    ring: "116,214,186",
  },
  star: {
    colors: ["255,232,171", "233,201,135", "255,249,229", "116,214,186"],
    count: 42,
    speed: 245,
    gravity: 40,
    ring: "233,201,135",
  },
  void: {
    colors: ["224,141,99", "144,104,74", "84,96,88"],
    count: 12,
    speed: 90,
    gravity: 210,
  },
  danger: {
    colors: ["229,118,108", "224,141,99", "255,214,180"],
    count: 12,
    speed: 120,
    gravity: 30,
    ring: "229,118,108",
  },
  gameover: {
    colors: ["229,118,108", "224,141,99", "126,145,148", "56,72,74"],
    count: 40,
    speed: 210,
    gravity: 120,
    ring: "229,118,108",
  },
};

export interface ParticlesHandle {
  burst: (x: number, y: number, kind: BurstKind) => void;
  clear: () => void;
}

export const Particles = forwardRef<ParticlesHandle, { className?: string }>(
  function Particles({ className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const stateRef = useRef<{ particles: Particle[]; rings: Ring[] }>({
      particles: [],
      rings: [],
    });
    const rafRef = useRef<number | null>(null);
    const sizeRef = useRef({ w: 0, h: 0 });
    const lastRef = useRef(0);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        sizeRef.current = { w: rect.width, h: rect.height };
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      window.addEventListener("orientationchange", resize);
      return () => {
        observer.disconnect();
        window.removeEventListener("orientationchange", resize);
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      };
    }, []);

    const startLoop = () => {
      if (rafRef.current !== null) return;
      lastRef.current = performance.now();
      const tick = (now: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) {
          rafRef.current = null;
          return;
        }
        const dt = Math.min(34, now - lastRef.current) / 16.667;
        lastRef.current = now;
        const { particles, rings } = stateRef.current;
        const { w, h } = sizeRef.current;
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life -= dt * 16.667;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += p.gravity * dt;
          const drag = Math.pow(p.drag, dt);
          p.vx *= drag;
          p.vy *= drag;
          const alpha = Math.max(0, p.life / p.max);
          if (p.streak) {
            ctx.strokeStyle = `rgba(${p.color},${alpha * 0.85})`;
            ctx.lineWidth = p.size;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
            ctx.stroke();
          } else {
            ctx.fillStyle = `rgba(${p.color},${alpha * 0.22})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(${p.color},${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        for (let i = rings.length - 1; i >= 0; i--) {
          const r = rings[i];
          r.life -= dt * 16.667;
          if (r.life <= 0) {
            rings.splice(i, 1);
            continue;
          }
          const progress = 1 - r.life / r.maxLife;
          const ease = 1 - Math.pow(1 - progress, 3);
          const alpha = (1 - progress) * 0.75;
          ctx.strokeStyle = `rgba(${r.color},${alpha})`;
          ctx.lineWidth = r.width * (1 - progress * 0.6);
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius + (r.maxRadius - r.radius) * ease, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.globalCompositeOperation = "source-over";
        if (particles.length || rings.length) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    useImperativeHandle(
      ref,
      () => ({
        burst(x, y, kind) {
          const palette = PALETTES[kind];
          const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
          const count = Math.round(palette.count * (reduced ? 0.4 : 1));
          const { particles, rings } = stateRef.current;
          for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = palette.speed * (0.28 + Math.random() * 0.9);
            particles.push({
              x,
              y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - palette.speed * 0.18,
              life: 420 + Math.random() * 520,
              max: 900,
              size: 1.2 + Math.random() * (kind === "step" ? 1.7 : 2.9),
              color: palette.colors[Math.floor(Math.random() * palette.colors.length)],
              gravity: palette.gravity * (0.4 + Math.random()),
              drag: 0.935,
              streak: Math.random() > 0.55,
            });
          }
          if (palette.ring) {
            rings.push({
              x,
              y,
              radius: 4,
              maxRadius: kind === "star" ? 54 : kind === "shard" ? 38 : 24,
              life: kind === "gameover" ? 620 : 460,
              maxLife: kind === "gameover" ? 620 : 460,
              color: palette.ring,
              width: kind === "star" ? 2.4 : 1.6,
            });
          }
          startLoop();
        },
        clear() {
          stateRef.current.particles.length = 0;
          stateRef.current.rings.length = 0;
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (canvas && ctx) {
            const { w, h } = sizeRef.current;
            ctx.clearRect(0, 0, w, h);
          }
        },
      }),
      []
    );

    return (
      <canvas
        ref={canvasRef}
        aria-hidden
        className={className}
        style={{ pointerEvents: "none" }}
      />
    );
  }
);
