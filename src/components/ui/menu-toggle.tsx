import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type MenuToggleProps = ComponentPropsWithoutRef<"button"> & { open: boolean };

/** Round two-line "hamburger" button. */
export function MenuToggle({ open, className, ...props }: MenuToggleProps) {
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className={cn(
        "flex size-11 flex-none flex-col items-center justify-center gap-1.5 rounded-full border border-white/16 p-0 transition-colors hover:border-white/50",
        className,
      )}
      {...props}
    >
      <span className="block h-[1.5px] w-4 bg-snow" />
      <span className="block h-[1.5px] w-4 bg-snow" />
    </button>
  );
}
