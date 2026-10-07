import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { SmartLink } from "@/components/ui/smart-link";
import { MonoLabel } from "@/components/ui/typography";
import type { InsightSummary } from "@/types/insights";
import { formatInsightDate, insightHref } from "../format";

/**
 * Article card on the light "All posts" grid. On hover the picture comes into
 * colour and zooms, a red wash sweeps up through it, an arrow pops in, the
 * title turns red and the card lifts.
 */
export function InsightCard({ post }: { post: InsightSummary }) {
  return (
    <SmartLink
      href={insightHref(post.slug)}
      className="group flex flex-col gap-4 text-ink transition-transform duration-600 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1.5 hover:text-ink motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-[#E6E5E2]">
        <Image
          src={post.image.src}
          alt={post.image.alt}
          fill
          sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
          className="scale-[1.04] object-cover grayscale transition-[transform,filter] duration-[1100ms,600ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.12] group-hover:grayscale-0 motion-reduce:group-hover:scale-[1.04]"
        />
        {/* Red wash: sweeps up on hover in, gone on hover out. */}
        <span
          aria-hidden
          className="absolute inset-0 bg-brand/22 [clip-path:inset(100%_0_0_0)] group-hover:animate-[insight-wipe_0.9s_cubic-bezier(.65,0,.35,1)_forwards]"
        />
        <span className="absolute left-3.5 top-3.5 flex h-7 items-center rounded-full bg-[#F4F3F1]/92 px-3 text-xs font-medium text-ink">
          {post.category}
        </span>
        <span
          aria-hidden
          className="absolute bottom-3.5 right-3.5 flex size-11 scale-60 items-center justify-center rounded-full bg-brand text-white opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:rotate-45 group-hover:scale-100 group-hover:opacity-100"
        >
          <Icon name="arrow-up-right" size={20} className="-rotate-45" />
        </span>
      </div>
      <MonoLabel className="text-[13px] text-[#77777C]">{formatInsightDate(post.date)}</MonoLabel>
      <span className="text-balance text-[clamp(20px,1.7cqw,26px)] font-medium leading-[1.2] tracking-[-0.02em] transition-colors group-hover:text-brand">
        {post.title}
      </span>
      {post.summary && <span className="line-clamp-2 text-[15px] leading-normal text-[#55555A]">{post.summary}</span>}
    </SmartLink>
  );
}
