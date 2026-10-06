import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import type { Stat } from "@/types/content";
import { StatCounter } from "./stat-counter";

/** Row of large count-up figures, each under a thin rule; wraps to fewer columns on narrow screens. */
export function StatGrid({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-[clamp(16px,3cqw,48px)] gap-y-[clamp(28px,3cqw,48px)]",
        className,
      )}
    >
      {stats.map((stat, i) => (
        <Reveal key={stat.label} delay={i * 80} className="border-t border-white/14 pt-[clamp(20px,2cqw,28px)]">
          <StatCounter {...stat} size="lg" />
        </Reveal>
      ))}
    </div>
  );
}
