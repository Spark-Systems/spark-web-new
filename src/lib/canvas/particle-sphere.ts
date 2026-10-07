import { clamp, easeInOutCubic } from "@/lib/motion/math";

/** Points in the sphere. */
const COUNT = 1500;
/** Golden angle: spreads points evenly over a sphere (Fibonacci lattice). */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
/** Radius (px) around the pointer that pushes points away. */
const POINTER_RADIUS = 90;
const POINTER_PUSH = 36;

interface Particle {
  /** Position on the unit sphere. */
  s: [number, number, number];
  /** Resting spot in the loose cloud, as a share of the canvas size. */
  fx: number;
  fy: number;
  /** Drift phases and speed while loose. */
  p1: number;
  p2: number;
  speed: number;
  /** How late this point joins the sphere (0–1). */
  lag: number;
  size: number;
  /** Drawn position (eased towards its target). */
  x: number | null;
  y: number | null;
}

export interface SphereFrame {
  /** 0 = a loose drifting cloud, 1 = a full rotating sphere. */
  order: number;
  /** Seconds, for drift and rotation. */
  time: number;
  /** Adds a little spin while the page scrolls. */
  scroll: number;
  /** Reduced motion: no drift, no easing. */
  still: boolean;
}

/** Deterministic pseudo-random numbers, so the cloud looks the same on every load. */
function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** A soft red glow, pre-rendered once and stamped for every point. */
function glowSprite() {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  const ctx = sprite.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,190,186,1)");
  g.addColorStop(0.16, "rgba(226,92,88,1)");
  g.addColorStop(0.26, "rgba(210,82,79,0.55)");
  g.addColorStop(0.55, "rgba(185,56,58,0.18)");
  g.addColorStop(1, "rgba(185,56,58,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return sprite;
}

/**
 * Glowing red points on a 2D canvas: a loose, drifting cloud that gathers into
 * a slowly rotating, twisted sphere as `order` goes from 0 to 1. Points behind
 * the sphere are dimmer and smaller; the pointer pushes nearby points aside.
 */
export class ParticleSphere {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly sprite = glowSprite();
  private readonly points: Particle[] = [];
  private pointer = { x: -1e4, y: -1e4 };
  /** Order as drawn (eased towards the requested one). */
  private shown = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    const rnd = seeded(11);
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      this.points.push({
        s: [Math.cos(GOLDEN_ANGLE * i) * r, y, Math.sin(GOLDEN_ANGLE * i) * r],
        fx: rnd(),
        fy: rnd(),
        p1: rnd() * Math.PI * 2,
        p2: rnd() * Math.PI * 2,
        speed: 0.2 + rnd() * 0.4,
        lag: rnd(),
        size: 0.6 + rnd() * 1.2,
        x: null,
        y: null,
      });
    }
  }

  /** Pointer position relative to the canvas. */
  setPointer(x: number, y: number) {
    this.pointer = { x, y };
  }

  clearPointer() {
    this.pointer = { x: -1e4, y: -1e4 };
  }

  render({ order, time, scroll, still }: SphereFrame) {
    const { canvas, ctx } = this;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (!W || !H) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }

    this.shown = still ? order : this.shown + (order - this.shown) * 0.08;
    const og = this.shown;
    const t = still ? 0 : time;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const R = Math.min(W * 0.42, H * 0.47);
    const cx = W / 2;
    const cy = H / 2;
    const rot = t * 0.15 + scroll * 0.0006;
    const tilt = -0.32;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    const scale = Math.max(0.7, R / 300);
    const drift = 1 - og;

    ctx.globalCompositeOperation = "lighter";
    for (const d of this.points) {
      const [x, y, z] = d.s;
      const k = easeInOutCubic(clamp(og * 1.35 - d.lag * 0.35));

      // Spin around the vertical axis, twisted by height, then tilt towards the viewer.
      const a = rot + y * 1.35;
      const x1 = x * Math.cos(a) + z * Math.sin(a);
      const z1 = -x * Math.sin(a) + z * Math.cos(a);
      const y2 = y * cosT - z1 * sinT;
      const z2 = y * sinT + z1 * cosT;
      const sx = cx + x1 * R;
      const sy = cy - y2 * R;
      const depth = (z2 + 1) / 2;

      // Loose position: a resting spot that drifts slowly.
      const fx = d.fx * W + Math.sin(t * d.speed + d.p1) * W * 0.04 * drift;
      const fy = d.fy * H + Math.cos(t * d.speed * 0.8 + d.p2) * H * 0.07 * drift;
      let tx = fx + (sx - fx) * k;
      let ty = fy + (sy - fy) * k;

      const dx = tx - this.pointer.x;
      const dy = ty - this.pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < POINTER_RADIUS && dist > 0.01) {
        const push = (1 - dist / POINTER_RADIUS) * POINTER_PUSH;
        tx += (dx / dist) * push;
        ty += (dy / dist) * push;
      }

      if (d.x === null || d.y === null || still) {
        d.x = tx;
        d.y = ty;
      } else {
        d.x += (tx - d.x) * 0.18;
        d.y += (ty - d.y) * 0.18;
      }

      const alpha = 0.45 * (1 - k) + k * (0.12 + 0.88 * depth);
      if (alpha < 0.02) continue;
      const radius = (d.size * (1 - k) + k * (0.5 + 1.6 * depth)) * scale;
      const S = radius * 6.2;
      ctx.globalAlpha = alpha;
      ctx.drawImage(this.sprite, d.x - S / 2, d.y - S / 2, S, S);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
}
