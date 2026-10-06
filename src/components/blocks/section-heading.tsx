import { Reveal } from "@/components/ui/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { SectionIntro } from "@/types/content";

const sizes = {
  xl: "text-[clamp(40px,5cqw,80px)] leading-[1.02] tracking-[-0.04em]",
  lg: "text-[clamp(36px,4.4cqw,68px)] leading-none tracking-[-0.04em]",
  md: "text-[clamp(30px,3.4cqw,54px)] leading-[1.1] tracking-[-0.035em]",
} as const;

type SectionHeadingProps = SectionIntro & {
  size?: keyof typeof sizes;
  align?: "start" | "center";
  /** Background the heading sits on; sets the eyebrow's red. */
  tone?: "dark" | "light";
  /** Max line length of the title, e.g. "16ch". */
  maxWidth?: string;
  className?: string;
};

/** Brand eyebrow over a section title; both fade up on scroll. */
export function SectionHeading({
  eyebrow,
  title,
  size = "lg",
  align = "start",
  tone = "dark",
  maxWidth,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4", align === "center" && "items-center text-center", className)}>
      <Reveal as="div">
        <Eyebrow className={tone === "dark" ? "text-brand-bright" : "text-brand"}>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal
        as="h2"
        delay={80}
        className={cn("m-0 text-balance font-medium", sizes[size])}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {title}
      </Reveal>
    </div>
  );
}
