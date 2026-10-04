import Image from "next/image";
import type { CSSProperties, Ref } from "react";
import { cn } from "@/lib/utils";
import type { Service } from "@/types/content";

interface ServiceCardProps {
  service: Service;
  style?: CSSProperties;
  ref?: Ref<HTMLAnchorElement>;
  /** Smaller type and padding, for the narrow two-column layout. */
  compact?: boolean;
}

/**
 * Service card with two layers, `[data-card-media]` (image) and
 * `[data-card-content]` (text), so the parent scene can reveal them in sequence.
 * The card takes its image's aspect ratio; the image is greyscale until hovered.
 */
export function ServiceCard({ service, style, ref, compact = false }: ServiceCardProps) {
  return (
    <a
      ref={ref}
      href="#"
      className="group absolute left-0 overflow-hidden rounded-card bg-cloud text-ink shadow-[0_18px_50px_-24px_rgba(11,11,11,0.35)] ring-1 ring-ink/6 will-change-transform"
      style={{ aspectRatio: `${service.image.width} / ${service.image.height}`, ...style }}
    >
      <div
        data-card-media=""
        className="absolute inset-0 grayscale transition-[filter] duration-500 will-change-[opacity,transform] group-hover:grayscale-0"
      >
        <Image src={service.image} alt="" fill sizes={compact ? "48vw" : "(min-width: 760px) 32vw, 78vw"} className="object-cover" />
        <div className="absolute inset-0 bg-[rgba(236,236,236,0.45)]" />
      </div>
      <div
        data-card-content=""
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center text-center will-change-[opacity,transform]",
          compact ? "gap-1.5 p-[6%]" : "gap-3 p-[8%]",
        )}
      >
        <span
          className={cn(
            "font-medium leading-[1.02] tracking-[-0.03em]",
            compact ? "text-[clamp(17px,3.6vw,30px)]" : "text-[clamp(26px,2.6cqw,44px)]",
          )}
        >
          {service.name}
        </span>
        <span
          className={cn(
            "max-w-[22em] text-balance text-ink-800",
            compact ? "text-[clamp(12px,2vw,16px)] leading-[1.35]" : "text-[clamp(15px,1.15cqw,19px)] leading-[1.45]",
          )}
        >
          {service.description}
        </span>
      </div>
    </a>
  );
}
