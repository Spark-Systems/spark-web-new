import Image from "next/image"

import { cn } from "@/lib/utils"

const LOGO_WIDTH = 206
const LOGO_HEIGHT = 54

export function Logo({
  variant,
  className,
  priority,
}: {
  variant: "colored" | "white"
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src={`/pattern/logo-${variant}.svg`}
      alt="Spark Systems"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      className={cn("h-7 w-auto", className)}
    />
  )
}

/** Colored logo on light backgrounds, white logo in dark mode. */
export function AdaptiveLogo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <>
      <Logo variant="colored" priority={priority} className={cn("dark:hidden", className)} />
      <Logo variant="white" priority={priority} className={cn("hidden dark:block", className)} />
    </>
  )
}

/** Just the "S" from the logo, for small badges: the wordmark cropped to its first letter. */
export function LogoMark({ variant, className }: { variant: "colored" | "white"; className?: string }) {
  // The "S" sits in the top-left 33.5 × 33.5 of the 206 × 54 wordmark; the viewBox
  // crops to it the same way whatever the page direction.
  return (
    <svg aria-hidden viewBox="0 0 33.5 33.5" className={cn("h-7 w-auto", className)}>
      <image href={`/pattern/logo-${variant}.svg`} width={LOGO_WIDTH} height={LOGO_HEIGHT} />
    </svg>
  )
}
