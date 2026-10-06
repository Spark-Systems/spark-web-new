"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/components/providers/motion-provider";
import { useFrame } from "@/hooks/use-frame";
import { useMediaQuery } from "@/hooks/use-media-query";

/** Elements the dot grows over. Add `data-cursor="hover"` to opt any other element in. */
const HOVER = 'a,button,select,summary,label,[role="button"],[role="tab"],[data-cursor="hover"]';
/** Text fields, where the dot shrinks out of the way of the caret. */
const TEXT = 'input,textarea,[contenteditable="true"]';
/** Elements that swap the dot for the labelled ring, e.g. images that open a viewer. */
const VIEW = '[data-cursor="view"]';

/** Dot scale at rest, over interactive elements, over text fields; and how much it squeezes while pressed. */
const SCALE = { rest: 0.18, hover: 1, text: 0.08, pressed: 0.8 };
/** Ring scale when hidden / shown. */
const RING = { hidden: 0.4, shown: 1, pressed: 0.9 };
/** How quickly the cursor follows the pointer, and how quickly it resizes (0–1 per frame). */
const FOLLOW = 0.28;
const RESIZE = 0.18;
/** Class on <html> that hides the system cursor (see globals.css). */
const ACTIVE_CLASS = "has-custom-cursor";

/**
 * Custom cursor for mouse and trackpad users: a white dot that inverts what is
 * under it and trails the pointer. It grows over links and buttons, shrinks
 * over text fields and squeezes while pressed. Over `[data-cursor="view"]`
 * elements it turns into a ring labelled `label`. Touch devices keep the
 * system cursor; under reduced motion it follows the pointer exactly.
 */
export function CustomCursor({ label = "Click me" }: { label?: string }) {
  const finePointer = useMediaQuery("(pointer: fine)");
  const motion = useMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const s = useRef({ x: -100, y: -100, cx: -100, cy: -100, dot: SCALE.rest, dotTarget: SCALE.rest, ring: RING.hidden, ringTarget: RING.hidden, down: false, shown: false });

  useEffect(() => {
    if (!finePointer) return;
    const root = document.documentElement;
    root.classList.add(ACTIVE_CLASS);
    const state = s.current;

    const onMove = (e: MouseEvent) => {
      state.x = e.clientX;
      state.y = e.clientY;
      if (!state.shown) {
        state.shown = true;
        state.cx = state.x;
        state.cy = state.y;
        if (dotRef.current) dotRef.current.style.opacity = "1";
      }
      const target = e.target instanceof Element ? e.target : null;
      const view = !!target?.closest(VIEW);
      state.dotTarget = view ? 0 : target?.closest(TEXT) ? SCALE.text : target?.closest(HOVER) ? SCALE.hover : SCALE.rest;
      state.ringTarget = view ? RING.shown : RING.hidden;
      if (ringRef.current) ringRef.current.style.opacity = view ? "1" : "0";
    };
    const onLeave = () => {
      state.shown = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };
    const onDown = () => void (state.down = true);
    const onUp = () => void (state.down = false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      root.classList.remove(ACTIVE_CLASS);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [finePointer]);

  useFrame(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    const st = s.current;
    const follow = motion ? FOLLOW : 1;
    const resize = motion ? RESIZE : 1;
    st.cx += (st.x - st.cx) * follow;
    st.cy += (st.y - st.cy) * follow;
    st.dot += (st.dotTarget * (st.down ? SCALE.pressed : 1) - st.dot) * resize;
    st.ring += (st.ringTarget * (st.down ? RING.pressed : 1) - st.ring) * resize;
    const at = `translate3d(${st.cx.toFixed(1)}px,${st.cy.toFixed(1)}px,0)`;
    dot.style.transform = `${at} scale(${st.dot.toFixed(3)})`;
    ring.style.transform = `${at} scale(${st.ring.toFixed(3)})`;
  }, finePointer);

  if (!finePointer) return null;

  const layer = "pointer-events-none fixed left-0 top-0 z-[2147483647] rounded-full mix-blend-difference will-change-transform";
  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`${layer} -ml-7 -mt-7 size-14 bg-white opacity-0 transition-opacity duration-[250ms]`}
        style={{ transform: `translate3d(-100px,-100px,0) scale(${SCALE.rest})` }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`${layer} -ml-[52px] -mt-[52px] box-border flex size-[104px] items-center justify-center whitespace-nowrap border-[1.5px] border-white text-[11px] font-semibold uppercase leading-none tracking-[0.16em] text-white opacity-0 transition-opacity duration-300`}
        style={{ transform: `translate3d(-100px,-100px,0) scale(${RING.hidden})` }}
      >
        {label}
      </div>
    </>
  );
}
