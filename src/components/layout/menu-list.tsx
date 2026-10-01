import { SmartLink } from "@/components/ui/smart-link";
import { MonoLabel } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types/content";

const sizes = {
  lg: { link: "gap-4 py-3.5 text-[clamp(24px,2.4cqw,36px)]", index: "text-xs" },
  md: { link: "gap-3 py-3 text-[clamp(20px,1.8cqw,26px)]", index: "text-[11px]" },
} as const;

interface MenuListProps {
  items: NavLink[];
  size?: keyof typeof sizes;
  onNavigate?: () => void;
}

/** Numbered menu entries ("01 Home", "02 Solutions", …). The parent sets the grid. */
export function MenuList({ items, size = "lg", onNavigate }: MenuListProps) {
  const s = sizes[size];
  return items.map((item, i) => (
    <SmartLink
      key={item.label}
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-baseline border-b border-white/8 font-medium tracking-[-0.02em] text-snow transition-colors hover:text-brand-bright",
        s.link,
      )}
    >
      <MonoLabel className={cn("text-fog-600", s.index)}>{String(i + 1).padStart(2, "0")}</MonoLabel>
      {item.label}
    </SmartLink>
  ));
}
