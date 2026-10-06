import { cn } from "@/lib/utils"

/**
 * Bar pinned to the bottom of the viewport while the form scrolls, so the form's
 * buttons stay in reach on long pages. Put the buttons in `children`.
 *
 * @example <FormActionBar status={isDirty && "Unsaved changes"}><Button type="submit">Save</Button></FormActionBar>
 */
export function FormActionBar({
  status,
  children,
  className,
}: {
  /** Short text on the start side, e.g. "Unsaved changes". */
  status?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "bg-background/85 sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t px-4 py-3 backdrop-blur md:-mx-6 md:px-6",
        className
      )}
    >
      {status && <span className="text-muted-foreground me-auto text-sm">{status}</span>}
      {children}
    </div>
  )
}
