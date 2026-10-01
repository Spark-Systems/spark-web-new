import Image from "next/image";
import { MonoLabel, Tbc } from "@/components/ui/typography";
import type { Testimonial } from "@/types/content";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { quote, author, role, company, logo } = testimonial;

  return (
    <figure className="m-0 flex flex-col gap-7 rounded-card border border-ink/8 bg-white p-[clamp(24px,2.4cqw,36px)] shadow-[0_1px_2px_rgba(11,11,11,0.04)]">
      <blockquote className="m-0 text-pretty text-[clamp(18px,1.5cqw,22px)] leading-[1.45] tracking-[-0.01em] text-ink">
        “{quote}”
      </blockquote>
      <figcaption className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-medium text-ink">{author}</span>
          <span className="text-[13px] text-ink-600">
            {role ?? <Tbc className="text-ink-500">[title TBC]</Tbc>}, {company}
          </span>
        </div>
        {logo ? (
          <Image src={logo} alt={company} className="block h-[26px] w-auto opacity-85 brightness-0" />
        ) : (
          <Tbc>
            <MonoLabel className="rounded-md border border-dashed border-ink/22 px-3 py-2 text-[11px] text-ink-600">
              [{company} logo]
            </MonoLabel>
          </Tbc>
        )}
      </figcaption>
    </figure>
  );
}
