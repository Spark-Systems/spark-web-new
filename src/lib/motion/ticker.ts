/**
 * A single shared requestAnimationFrame loop.
 *
 * Scroll-driven sections subscribe here instead of each running their own
 * rAF loop, so the page does one frame callback per paint no matter how many
 * animated sections are mounted.
 */
type FrameCallback = (time: number) => void;

/** Run before regular subscribers (e.g. the smooth-scroll engine). */
const early = new Set<FrameCallback>();
const regular = new Set<FrameCallback>();
let rafId = 0;

function loop(time: number) {
  rafId = requestAnimationFrame(loop);
  early.forEach((cb) => cb(time));
  regular.forEach((cb) => cb(time));
}

export function subscribeFrame(cb: FrameCallback, options: { early?: boolean } = {}) {
  const set = options.early ? early : regular;
  set.add(cb);
  if (early.size + regular.size === 1) rafId = requestAnimationFrame(loop);

  return () => {
    set.delete(cb);
    if (early.size + regular.size === 0) cancelAnimationFrame(rafId);
  };
}
