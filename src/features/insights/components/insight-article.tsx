import Image from "next/image";
import { routes } from "@/config/site";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SmartLink } from "@/components/ui/smart-link";
import { Eyebrow, MonoLabel } from "@/components/ui/typography";
import type { InsightArticle as Article } from "@/types/insights";
import { formatInsightDate } from "../format";
import { sanitizeArticleHtml } from "../sanitize";
import { InsightCard } from "./insight-card";

/** An article: header, cover picture, body, then a few more articles. */
export function InsightArticle({ article }: { article: Article }) {
  return (
    <>
      <article className="bg-texture px-gutter pb-[clamp(72px,9cqw,144px)] pt-[clamp(140px,14cqw,220px)] text-snow">
        <header className="mx-auto flex max-w-[900px] flex-col gap-6">
          <Reveal>
            <SmartLink href={routes.insights} className="inline-flex items-center gap-2 text-sm text-fog-400 transition-colors hover:text-brand-bright">
              <Icon name="arrow-left" size={16} />
              All insights
            </SmartLink>
          </Reveal>
          <Reveal delay={60} className="flex flex-wrap items-center gap-4">
            <Eyebrow className="text-brand-bright">{article.category}</Eyebrow>
            <MonoLabel className="text-[13px] text-fog-500">{formatInsightDate(article.date)}</MonoLabel>
          </Reveal>
          <Reveal
            as="h1"
            delay={120}
            className="m-0 text-balance text-[clamp(38px,5.4cqw,84px)] font-medium leading-[1.02] tracking-[-0.045em]"
          >
            {article.title}
          </Reveal>
          {article.summary && (
            <Reveal as="p" delay={180} className="m-0 max-w-[46ch] text-[clamp(18px,1.6cqw,23px)] leading-normal text-fog-400">
              {article.summary}
            </Reveal>
          )}
        </header>

        <Reveal delay={240} className="relative mx-auto mt-[clamp(40px,5cqw,72px)] aspect-[16/9] max-w-[1180px] overflow-hidden rounded-card bg-[#141416]">
          <Image src={article.image.src} alt={article.image.alt} fill priority sizes="(min-width: 1280px) 1180px, 100vw" className="object-cover" />
        </Reveal>

        {article.body && (
          <div
            className="insight-prose mx-auto mt-[clamp(48px,6cqw,96px)] max-w-[720px]"
            dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.body) }}
          />
        )}
      </article>

      {article.more.length > 0 && (
        <section className="bg-[#F4F3F1] px-gutter py-[clamp(80px,9cqw,144px)] text-ink">
          <Reveal className="mb-[clamp(28px,3.5cqw,48px)] flex flex-wrap items-end justify-between gap-6">
            <h2 className="m-0 text-[clamp(32px,3.6cqw,56px)] font-medium leading-[1.05] tracking-[-0.04em]">Keep reading.</h2>
            <SmartLink href={routes.insights} className="inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-brand">
              All insights
              <Icon name="arrow-right" size={16} />
            </SmartLink>
          </Reveal>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-x-[clamp(16px,2cqw,28px)] gap-y-[clamp(28px,3cqw,44px)]">
            {article.more.map((post) => (
              <InsightCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
