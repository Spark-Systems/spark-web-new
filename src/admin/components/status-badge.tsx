import { cn } from "@admin/lib/utils"

export type StatusTone = "success" | "neutral" | "warning" | "danger"

// Status colors are reserved for state (never reused as decoration) and always
// carry a text label beside the dot, so meaning never rests on color alone.
const tones: Record<StatusTone, { badge: string; dot: string }> = {
  success: {
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  neutral: { badge: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/60" },
  warning: {
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  danger: { badge: "bg-destructive/10 text-destructive dark:bg-destructive/20", dot: "bg-destructive" },
}

/**
 * Pill with a colored dot and label, for row states such as Active / Hidden.
 *
 * @example <StatusBadge tone="success">Visible</StatusBadge>
 */
export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        tones[tone].badge,
        className
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", tones[tone].dot)} />
      {children}
    </span>
  )
}
