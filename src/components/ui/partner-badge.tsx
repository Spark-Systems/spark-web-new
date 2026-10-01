import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Partner } from "@/types/content";

const sizes = {
  md: { root: "h-11 gap-3 px-[18px]", logo: "h-[18px]", name: "text-[15px] -ml-1", label: "text-[13px]", rule: "my-3" },
  sm: { root: "h-8 gap-2 px-3", logo: "h-[13px]", name: "text-xs -ml-[3px]", label: "text-[11px]", rule: "my-2" },
} as const;

interface PartnerBadgeProps {
  partner: Partner;
  size?: keyof typeof sizes;
}

/** "<logo> | Partner" pill used in the clients strip and the footer. */
export function PartnerBadge({ partner, size = "md" }: PartnerBadgeProps) {
  const s = sizes[size];
  return (
    <span className={cn("flex items-center rounded-full border border-white/16", s.root)}>
      <Image
        src={partner.logo}
        alt={partner.name}
        unoptimized
        className={cn("block w-auto", s.logo, partner.invert && "opacity-90 brightness-0 invert")}
      />
      {partner.showName && (
        <span className={cn("font-semibold tracking-[-0.01em] text-snow", s.name)}>{partner.name}</span>
      )}
      <span className={cn("w-px self-stretch bg-white/18", s.rule)} />
      <span className={cn("whitespace-nowrap font-medium text-fog-200", s.label)}>Partner</span>
    </span>
  );
}
