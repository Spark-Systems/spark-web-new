import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Small JetBrains Mono label (indices, captions, counters). */
export function MonoLabel({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return <span className={cn("font-mono text-xs tracking-normal", className)} {...props} />;
}

/** Uppercase, widely tracked section kicker. */
export function Eyebrow({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return (
    <span className={cn("text-xs font-semibold uppercase tracking-[0.16em] text-brand", className)} {...props} />
  );
}

/**
 * Copy that is still awaiting confirmation from the client. Outlined when
 * NEXT_PUBLIC_HIGHLIGHT_TBC=true so it is easy to spot during review.
 */
export function Tbc({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return <span data-tbc="" className={className} {...props} />;
}

/** Row of uppercase tags, each led by a small brand dot. */
export function TagList({ tags, className }: { tags: string[]; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-fog-500",
        className,
      )}
    >
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-[7px]">
          <span className="block size-1 rounded-full bg-brand" />
          {tag}
        </span>
      ))}
    </div>
  );
}
