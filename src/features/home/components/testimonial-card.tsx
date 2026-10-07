import Image from "next/image";
import type { Testimonial } from "@/types/content";

/** Dark glass quote card, designed to sit on the textured dark background. */
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { quote, author, role, company, logo } = testimonial;

  return (
    <figure className="m-0 flex flex-col gap-7 rounded-card border border-white/10 bg-white/4 p-[clamp(24px,2.4cqw,36px)] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)] transition-colors duration-300 hover:border-white/20 hover:bg-white/6">
      <span aria-hidden="true" className="block h-0.5 w-7 bg-brand" />
      <blockquote className="m-0 text-pretty text-[clamp(18px,1.5cqw,22px)] leading-[1.45] tracking-[-0.01em] text-snow">
        “{quote}”
      </blockquote>
      <figcaption className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-5">
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-medium text-snow">{author}</span>
          <span className="text-[13px] text-fog-500">
            {role ? `${role}, ${company}` : company}
          </span>
        </div>
        {logo && (
          <Image src={logo} alt={company} className="block h-[26px] w-auto opacity-85 brightness-0 invert" />
        )}
      </figcaption>
    </figure>
  );
}
