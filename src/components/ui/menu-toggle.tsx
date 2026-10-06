import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type MenuToggleProps = ComponentProps<"button"> & { open: boolean };

/** Round two-line "hamburger" button; the lower line is shorter and right-aligned. */
export function MenuToggle({ open, className, ...props }: MenuToggleProps) {
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className={cn(
        "flex size-11 flex-none flex-col justify-center gap-[7px] rounded-full border border-white/18 px-2.5 py-0 transition-colors hover:border-white/50",
        className,
      )}
      {...props}
    >
      <span className="block h-[1.5px] bg-snow" />
      <span className="block h-[1.5px] w-[60%] self-end bg-snow" />
    </button>
  );
}
