import Lenis from "lenis";
import { easeInOutCubic } from "@/lib/motion/math";
import { subscribeFrame } from "@/lib/motion/ticker";

const ANCHOR_OFFSET = 60;
const GLIDE_SECONDS = 0.8;

/**
 * Owns window scrolling. Smooth (inertial) scrolling is delegated to Lenis;
 * this class adapts it to the app: in-page anchor links and eased,
 * interruptible programmatic glides (used e.g. to settle a pinned scene on
 * its nearest slide).
 */
export class ScrollController {
  private lenis: Lenis | null = null;
  private unsubscribeFrame: (() => void) | null = null;
  /** Set by Back/Forward, whose scroll position the browser restores. */
  private historyNavigation = false;

  /** True while a programmatic glide is running. */
  gliding = false;

  /**
   * Start smooth scrolling. With `smooth: false` (reduced motion) the
   * browser's native scrolling is left untouched and glides jump.
   */
  attach({ smooth }: { smooth: boolean }) {
    window.addEventListener("popstate", this.onPopState);
    if (!smooth) return;

    this.lenis = new Lenis({ lerp: 0.1, autoRaf: false });
    // User input interrupts a glide without firing its onComplete.
    this.lenis.on("virtual-scroll", () => {
      this.gliding = false;
    });
    // Drive Lenis from the shared ticker, ahead of the scroll scenes, so they
    // read the updated position in the same frame.
    this.unsubscribeFrame = subscribeFrame((time) => this.lenis?.raf(time), { early: true });
    document.addEventListener("click", this.onClick);
  }

  detach() {
    window.removeEventListener("popstate", this.onPopState);
    document.removeEventListener("click", this.onClick);
    this.unsubscribeFrame?.();
    this.unsubscribeFrame = null;
    this.lenis?.destroy();
    this.lenis = null;
    this.gliding = false;
  }

  /** Freeze page scrolling (e.g. while a full-screen menu is open). */
  lock() {
    if (this.lenis) this.lenis.stop();
    else document.documentElement.style.overflow = "hidden";
  }

  /** Undo `lock()`. */
  unlock() {
    if (this.lenis) this.lenis.start();
    else document.documentElement.style.overflow = "";
  }

  /** True while a finger is on the screen (touch devices). */
  get touching() {
    return this.lenis?.isTouching ?? false;
  }

  /**
   * Eased scroll to an absolute Y position. Any wheel or touch input from the
   * user takes over immediately, unless `lock` is set (used for stepped scenes
   * that must finish their move before accepting input again).
   */
  glideTo(to: number, duration = GLIDE_SECONDS, { lock = false } = {}) {
    if (!this.lenis) {
      window.scrollTo(0, to);
      return;
    }
    this.gliding = true;
    this.lenis.scrollTo(to, {
      duration,
      lock,
      easing: easeInOutCubic,
      onComplete: () => {
        this.gliding = false;
      },
    });
  }

  /**
   * Call after the route changes. A new page opens at the top: Lenis keeps
   * easing toward its own target, so without this it would drag the new page
   * back to where the old one was scrolled. Back/Forward keep the position
   * the browser restored, and `#hash` links are left to scroll to their target.
   */
  routeChanged() {
    const restore = this.historyNavigation;
    this.historyNavigation = false;
    this.gliding = false;
    if (!restore && location.hash) return;
    const y = restore ? window.scrollY : 0;
    if (!restore) window.scrollTo(0, 0);
    this.lenis?.scrollTo(y, { immediate: true, force: true });
  }

  private onPopState = () => {
    this.historyNavigation = true;
  };

  /** Smooth-scroll same-page `#hash` links instead of jumping. */
  private onClick = (e: MouseEvent) => {
    const anchor = (e.target as Element | null)?.closest?.('a[href^="#"]');
    if (!anchor || e.defaultPrevented || !this.lenis) return;

    const id = anchor.getAttribute("href")!.slice(1);
    const el = id ? document.getElementById(id) : null;
    if (!el) return;

    e.preventDefault();
    // Flag it as a glide so pinned scenes passed on the way don't react to it.
    this.gliding = true;
    this.lenis.scrollTo(el, {
      offset: id === "top" ? 0 : -ANCHOR_OFFSET,
      onComplete: () => {
        this.gliding = false;
      },
    });
    history.replaceState(null, "", `#${id}`);
  };
}
