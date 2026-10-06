import { cn } from "@/lib/utils";

/** Dashed "Placeholder" pill marking content that still needs real data. Inherits the text colour. */
export function PlaceholderBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex-none rounded-full border border-dashed border-current px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70",
        className,
      )}
    >
      Placeholder
    </span>
  );
}
