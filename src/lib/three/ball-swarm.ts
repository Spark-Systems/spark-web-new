import * as THREE from "three";
import { clamp, hexToRgb, mixRgb, seededRandom, type Rgb } from "@/lib/motion/math";

interface Ball {
  col: number;
  row: number;
  /** Resting position inside the formation box (0–1), when scattered. */
  fx: number;
  fy: number;
  phaseX: number;
  phaseY: number;
  speed: number;
  color: Rgb;
  /** Starts white and turns red as the grid forms. */
  white: boolean;
  x: number | null;
  y: number | null;
  vx: number;
  vy: number;
}

export interface SwarmFrame {
  /** Centre of the formation, in px relative to the canvas. */
  x: number;
  y: number;
  /** Edge length of the formation's square box, in px. */
  size: number;
  /** 0 = scattered cloud, 1 = tidy N×N grid. */
  order: number;
  /** Seconds; drives the drift. */
  time: number;
  /** Seconds since the previous frame. */
  dt: number;
  /** Snap to targets without springs (reduced motion). */
  still: boolean;
}

const WHITE = hexToRgb("#F2F2F0");
/** Depth gap between spheres; larger than any diameter so overlapping balls layer instead of intersecting. */
const LAYER_GAP = 100;
const PALETTE = ["#B9383A", "#D2524F", "#8E2A2D", "#E0716F"].map(hexToRgb);

/**
 * A swarm of glossy 3D spheres rendered with three.js as one instanced mesh.
 * The canvas covers its whole section and uses an orthographic camera in CSS
 * pixels, so the formation can be placed on any DOM element's rect. Each
 * frame, spheres spring towards their slot in the formation and are pushed
 * away from the pointer.
 */
export class BallSwarm {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(0, 1, 0, -1, 0.1, 20000);
  private readonly geometry = new THREE.SphereGeometry(1, 32, 24);
  private readonly material = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.05 });
  private readonly mesh: THREE.InstancedMesh;
  private readonly balls: Ball[] = [];
  private readonly dummy = new THREE.Object3D();
  private readonly tint = new THREE.Color();
  private pointer = { x: -1e4, y: -1e4 };

  constructor(
    canvas: HTMLCanvasElement,
    private readonly gridSize = 7,
    seed = 7,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.camera.position.z = 10000;

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(-0.6, 0.8, 1);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd6d0, 0.6);
    rim.position.set(0.8, -0.6, 0.4);
    this.scene.add(rim);

    const count = gridSize * gridSize;
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);

    const rnd = seededRandom(seed);
    for (let i = 0; i < count; i++) {
      this.balls.push({
        col: i % gridSize,
        row: Math.floor(i / gridSize),
        fx: 0.06 + rnd() * 0.88,
        fy: 0.08 + rnd() * 0.84,
        phaseX: rnd() * 6.28,
        phaseY: rnd() * 6.28,
        speed: 0.25 + rnd() * 0.35,
        color: PALETTE[Math.floor(rnd() * PALETTE.length)],
        white: rnd() < 0.24,
        x: null,
        y: null,
        vx: 0,
        vy: 0,
      });
      this.mesh.setColorAt(i, this.tint);
    }
  }

  setSize(width: number, height: number) {
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.setSize(width, height, false);
    this.camera.right = width;
    this.camera.bottom = -height;
    this.camera.updateProjectionMatrix();
  }

  setPointer(x: number, y: number) {
    this.pointer = { x, y };
  }

  clearPointer() {
    this.pointer = { x: -1e4, y: -1e4 };
  }

  render(frame: SwarmFrame) {
    const { x, y, size, order, time, dt, still } = frame;
    const N = this.gridSize;
    const cell = (size * 0.84) / N;
    const left = x - size / 2;
    const top = y - size / 2;
    const gx0 = x - (cell * N) / 2 + cell / 2;
    const gy0 = y - (cell * N) / 2 + cell / 2;
    const radius = cell * 0.43 * (1.5 - 0.5 * order);
    const drift = 1 - order;
    const pushRadius = Math.max(24, size * 0.18);
    const pushForce = pushRadius * 0.57;
    // Springs are tuned per 60fps frame; scale them so motion is frame-rate independent.
    const steps = Math.min(3, dt * 60);
    const damping = Math.pow(0.8, steps);

    this.balls.forEach((b, i) => {
      const fx = left + b.fx * size + Math.sin(time * b.speed + b.phaseX) * size * 0.05 * drift;
      const fy = top + b.fy * size + Math.cos(time * b.speed * 0.8 + b.phaseY) * size * 0.08 * drift;
      let tx = fx + (gx0 + b.col * cell - fx) * order;
      let ty = fy + (gy0 + b.row * cell - fy) * order;

      const dx = tx - this.pointer.x;
      const dy = ty - this.pointer.y;
      const d = Math.hypot(dx, dy);
      if (d < pushRadius && d > 0.01) {
        const f = (1 - d / pushRadius) * pushForce;
        tx += (dx / d) * f;
        ty += (dy / d) * f;
      }

      if (b.x === null || b.y === null || still) {
        b.x = tx;
        b.y = ty;
        b.vx = b.vy = 0;
      } else {
        b.vx = (b.vx + (tx - b.x) * 0.07 * steps) * damping;
        b.vy = (b.vy + (ty - b.y) * 0.07 * steps) * damping;
        b.x += b.vx * steps;
        b.y += b.vy * steps;
      }

      this.dummy.position.set(b.x, -b.y, i * LAYER_GAP);
      this.dummy.scale.setScalar(radius);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);

      const c = b.white ? mixRgb(WHITE, b.color, clamp((order - 0.55) / 0.4)) : b.color;
      this.tint.setRGB(c[0] / 255, c[1] / 255, c[2] / 255, THREE.SRGBColorSpace);
      this.mesh.setColorAt(i, this.tint);
    });

    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.mesh.dispose();
    this.renderer.dispose();
  }
}
