import Lenis from "lenis";
import { easeInOutCubic } from "@/lib/motion/math";
import { subscribeFrame } from "@/lib/motion/ticker";

const WHEEL_QUIET_MS = 160;
const ANCHOR_OFFSET = 60;
const TWEEN_SECONDS = 0.8;

/**
 * Owns window scrolling. Smooth (inertial) scrolling is delegated to Lenis;
 * this class adapts it to the app: in-page anchor links, eased programmatic
 * tweens, and the wheel bookkeeping shared by step-snapping sections.
 *
 * Sections that snap between steps (see `useWheelSteps`) listen for wheel
 * events on their own element and call `preventDefault()` to take over a
 * gesture. Those listeners run before Lenis's window listener, and Lenis is
 * told to ignore any event that has already been prevented.
 */
export class ScrollController {
  private lenis: Lenis | null = null;
  private unsubscribeFrame: (() => void) | null = null;

  /** True while a programmatic tween owns the scroll position. */
  tweening = false;
  /** Shared wheel-gesture bookkeeping for step-snapping sections. */
  lastWheelAt = 0;
  gestureConsumed = false;

  /**
   * Start smooth scrolling. With `smooth: false` (reduced motion) the
   * browser's native scrolling is left untouched and tweens jump.
   */
  attach({ smooth }: { smooth: boolean }) {
    if (!smooth) return;

    this.lenis = new Lenis({
      lerp: 0.1,
      autoRaf: false,
      virtualScroll: ({ event }) => !event.defaultPrevented,
    });
    // Drive Lenis from the shared ticker, ahead of the scroll scenes, so they
    // read the updated position in the same frame.
    this.unsubscribeFrame = subscribeFrame((time) => this.lenis?.raf(time), { early: true });
    document.addEventListener("click", this.onClick);
  }

  detach() {
    document.removeEventListener("click", this.onClick);
    this.unsubscribeFrame?.();
    this.unsubscribeFrame = null;
    this.lenis?.destroy();
    this.lenis = null;
    this.tweening = false;
  }

  /** Eased scroll to an absolute Y position. */
  tweenTo(to: number) {
    if (!this.lenis) {
      window.scrollTo(0, to);
      return;
    }
    this.tweening = true;
    this.lenis.scrollTo(to, {
      duration: TWEEN_SECONDS,
      easing: easeInOutCubic,
      lock: true,
      force: true,
      onComplete: () => {
        this.tweening = false;
        this.lastWheelAt = performance.now();
      },
    });
  }

  /**
   * Gate for step-snapping sections: returns true when this wheel event
   * belongs to a gesture that already advanced a step (trackpads fire many
   * events per swipe) and should just be swallowed.
   */
  shouldSwallowWheel(now: number) {
    const quiet = now - this.lastWheelAt > WHEEL_QUIET_MS;
    this.lastWheelAt = now;
    if (this.tweening || (!quiet && this.gestureConsumed)) return true;
    this.gestureConsumed = false;
    return false;
  }

  /** Smooth-scroll same-page `#hash` links instead of jumping. */
  private onClick = (e: MouseEvent) => {
    const anchor = (e.target as Element | null)?.closest?.('a[href^="#"]');
    if (!anchor || e.defaultPrevented || !this.lenis) return;

    const id = anchor.getAttribute("href")!.slice(1);
    const el = id ? document.getElementById(id) : null;
    if (!el) return;

    e.preventDefault();
    this.lenis.scrollTo(el, { offset: id === "top" ? 0 : -ANCHOR_OFFSET });
    history.replaceState(null, "", `#${id}`);
  };
}
