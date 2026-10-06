import { cn } from "@/lib/utils";

const tones = {
  dark: "border-white/16 text-fog-200",
  light: "border-ink/16 text-ink-700",
} as const;

/** Row of outlined, rounded tags ("Sports clubs", "Venues", …). */
export function TagPills({
  tags,
  tone = "dark",
  className,
}: {
  tags: string[];
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <span key={tag} className={cn("rounded-full border px-3.5 py-2 text-[13px]", tones[tone])}>
          {tag}
        </span>
      ))}
    </div>
  );
}
