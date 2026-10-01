import type { ComponentPropsWithoutRef, CSSProperties, ElementType } from "react";

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Transition delay in ms. */
  delay?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Fades and lifts its element in when it first scrolls into view.
 * Purely declarative — the shared <RevealObserver /> drives it — so it is
 * safe to use inside Server Components.
 */
export function Reveal<T extends ElementType = "div">({ as, delay = 0, style, ...props }: RevealProps<T>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      data-reveal=""
      style={delay ? ({ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties) : style}
      {...props}
    />
  );
}
