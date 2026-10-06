import type { LucideIcon } from "lucide-react"

/** Brand-tinted icon tile shown at the start of every dashboard card. */
export function CardIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="bg-accent text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
      <Icon className="size-4.5" />
    </span>
  )
}
