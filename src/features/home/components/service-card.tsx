import Image from "next/image";
import type { CSSProperties, Ref } from "react";
import type { Service } from "@/types/content";

interface ServiceCardProps {
  service: Service;
  style?: CSSProperties;
  ref?: Ref<HTMLAnchorElement>;
}

/**
 * Service card with two layers, `[data-card-media]` (image) and
 * `[data-card-content]` (text), so the parent scene can reveal them in sequence.
 */
export function ServiceCard({ service, style, ref }: ServiceCardProps) {
  return (
    <a
      ref={ref}
      href="#"
      className="absolute left-0 aspect-16/10 overflow-hidden rounded-card bg-cloud text-ink shadow-[0_18px_50px_-24px_rgba(11,11,11,0.35)] ring-1 ring-ink/6 will-change-transform"
      style={style}
    >
      <div data-card-media="" className="absolute inset-0 will-change-[opacity,transform]">
        <Image src={service.image} alt="" fill sizes="(min-width: 760px) 32vw, 78vw" className="object-cover" />
        <div className="absolute inset-0 bg-[rgba(236,236,236,0.45)]" />
      </div>
      <div
        data-card-content=""
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-[8%] text-center will-change-[opacity,transform]"
      >
        <span className="text-[clamp(26px,2.6cqw,44px)] font-medium leading-[1.02] tracking-[-0.03em]">
          {service.name}
        </span>
        <span className="max-w-[22em] text-balance text-[clamp(15px,1.15cqw,19px)] leading-[1.45] text-ink-800">
          {service.description}
        </span>
      </div>
    </a>
  );
}
