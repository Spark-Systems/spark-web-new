import Image from "next/image";
import { BeforeAfterSlider } from "@/components/blocks/before-after-slider";
import { ClipRevealImage } from "@/components/blocks/clip-reveal-image";
import { HorizontalGallery } from "@/components/blocks/horizontal-gallery";
import { ScrollFillText } from "@/components/blocks/scroll-fill-text";
import { SectionHeading } from "@/components/blocks/section-heading";
import { StatCounter } from "@/components/blocks/stat-counter";
import { Icon } from "@/components/ui/icon";
import { PlaceholderBadge } from "@/components/ui/placeholder-badge";
import { Reveal } from "@/components/ui/reveal";
import { SmartLink } from "@/components/ui/smart-link";
import { Eyebrow } from "@/components/ui/typography";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";
import type { DeviceKind, ProjectDetail } from "@/types/work";
import { PinnedFeatureList } from "../components/pinned-feature-list";

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Key facts in a row: client, sector, services, launch year. */
export function CaseFacts({ facts }: { facts: ProjectDetail["facts"] }) {
  return (
    <section className="bg-texture px-gutter py-[clamp(56px,6cqw,96px)]">
      <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-[clamp(24px,3cqw,48px)]">
        {facts.map((fact, i) => (
          <Reveal key={fact.label} delay={i * 90} className="flex flex-col gap-2.5 border-t border-white/14 pt-5">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-fog-600">{fact.label}</dt>
            <dd className="m-0 text-[clamp(18px,1.5cqw,22px)] font-medium">{fact.value}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

/**
 * Light run of the overview statement (filling in on scroll), the wide
 * showcase image opening out, and the challenge / approach / outcome columns.
 */
export function CaseOverview({ statement, showcase, story }: Pick<ProjectDetail, "statement" | "showcase" | "story">) {
  return (
    <section className="bg-paper text-ink">
      <div className="px-gutter flex flex-col gap-7 py-[clamp(96px,11cqw,176px)]">
        <Reveal as="div">
          <SmartLink
            href={routes.work}
            className="flex items-center gap-2 self-start text-xs font-semibold uppercase tracking-[0.16em] text-brand transition-colors hover:text-brand-deep"
          >
            <Icon name="arrow-left" />
            All work
          </SmartLink>
        </Reveal>
        <ScrollFillText
          text={statement}
          className="m-0 max-w-[26ch] text-[clamp(30px,3.8cqw,60px)] font-medium leading-[1.12] tracking-[-0.03em]"
        />
      </div>

      <div className="pb-[clamp(96px,11cqw,176px)]">
        <ClipRevealImage image={showcase} />
      </div>

      <div className="px-gutter grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[clamp(32px,4cqw,72px)] pb-[clamp(96px,11cqw,176px)]">
        {story.map((block, i) => (
          <Reveal key={block.title} delay={i * 120} className="flex flex-col gap-4 border-t border-ink/14 pt-6">
            <span className="font-mono text-[13px] text-brand">{pad2(i + 1)}</span>
            <h3 className="m-0 text-[clamp(26px,2.4cqw,36px)] font-medium tracking-[-0.03em]">{block.title}</h3>
            <p className="m-0 text-[clamp(16px,1.3cqw,18px)] leading-[1.55] text-ink-700">{block.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Key features: pinned list beside crossfading screens (see <PinnedFeatureList />). */
export function CaseFeatures(props: ProjectDetail["features"]) {
  return <PinnedFeatureList {...props} />;
}

/** "Inside the platform": the sideways-scrolling gallery with a lightbox. */
export function CaseGallery({ title, items }: ProjectDetail["gallery"]) {
  return <HorizontalGallery title={title} items={items} />;
}

/** Frame shape and flex sizing for each kind of device, so mixed screens line up along their bottoms. */
const frames: Record<DeviceKind, { figure: string; frame: string; screen: string }> = {
  web: { figure: "flex-[2.6_1_300px]", frame: "aspect-16/10 rounded-[18px] p-2.5", screen: "rounded-[9px]" },
  mobile: { figure: "max-w-[220px] flex-[0.6_1_100px]", frame: "aspect-[9/19.5] rounded-[30px] p-2", screen: "rounded-[23px]" },
  tablet: { figure: "max-w-[420px] flex-[1.2_1_170px]", frame: "aspect-3/4 rounded-[22px] p-2.5", screen: "rounded-[13px]" },
  pos: { figure: "max-w-[300px] flex-[0.9_1_130px]", frame: "aspect-9/16 rounded-[14px] p-2.5", screen: "rounded-[6px]" },
};

/** "Across devices": the product's screens in web, phone, tablet and POS frames. */
export function CaseDevices({ eyebrow, title, items }: ProjectDetail["devices"]) {
  return (
    <section className="bg-texture px-gutter py-[clamp(96px,11cqw,176px)]">
      <SectionHeading eyebrow={eyebrow} title={title} size="xl" maxWidth="14ch" className="mb-[clamp(48px,6cqw,96px)]" />
      <div className="flex flex-wrap items-end gap-[clamp(16px,2cqw,32px)]">
        {items.map((device, i) => {
          const f = frames[device.kind];
          return (
            <Reveal as="figure" key={device.label} delay={i * 110} className={cn("m-0 flex flex-col gap-3.5", f.figure)}>
              <div className={cn("box-border border border-white/10 bg-surface", f.frame)}>
                <div className={cn("relative size-full overflow-hidden", f.screen)}>
                  <Image src={device.image.src} alt={device.image.alt} fill sizes="(min-width: 960px) 40vw, 90vw" className="object-cover object-top" />
                </div>
              </div>
              <figcaption className="flex gap-3.5 text-[15px] text-fog-400">
                <span className="font-mono text-[13px] text-brand-bright">{pad2(i + 1)}</span>
                {device.label}
              </figcaption>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/** "Before / after": the draggable comparison. */
export function CaseComparison({ eyebrow, title, hint, before, after }: NonNullable<ProjectDetail["comparison"]>) {
  return (
    <section className="bg-paper px-gutter py-[clamp(96px,11cqw,176px)] text-ink">
      <div className="mb-[clamp(40px,5cqw,72px)] flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow={eyebrow} title={title} size="xl" tone="light" maxWidth="14ch" />
        <Reveal as="span" delay={160} className="flex items-center gap-2.5 text-[15px] text-ink-600">
          <Icon name="arrows-left-right" size={18} className="text-brand" />
          {hint}
        </Reveal>
      </div>
      <Reveal>
        <BeforeAfterSlider before={before} after={after} />
      </Reveal>
    </section>
  );
}

/** Results: the headline figure, the solution it's built on, and supporting figures (placeholders until confirmed). */
export function CaseResults({ eyebrow, headline, builtOn, figures }: ProjectDetail["results"]) {
  return (
    <section className="bg-texture px-gutter py-[clamp(96px,11cqw,176px)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-[clamp(40px,6cqw,112px)]">
        <Reveal className="flex flex-col gap-5">
          <Eyebrow className="text-brand-bright">{eyebrow}</Eyebrow>
          <StatCounter {...headline} size="xl" />
        </Reveal>
        {builtOn && (
          <Reveal delay={120}>
            <SmartLink
              href={builtOn.href}
              className="flex flex-col gap-3.5 rounded-card border border-white/12 p-[clamp(24px,3cqw,40px)] text-snow transition-colors duration-[400ms] hover:border-brand hover:bg-brand/8 hover:text-snow"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-fog-600">{builtOn.eyebrow}</span>
              <span className="flex items-center justify-between text-[clamp(28px,2.8cqw,44px)] font-medium tracking-[-0.03em]">
                {builtOn.label}
                <Icon name="arrow-up-right" size={28} className="text-brand-bright" />
              </span>
            </SmartLink>
          </Reveal>
        )}
      </div>
      <div className="mt-[clamp(56px,7cqw,112px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-[clamp(24px,3cqw,48px)]">
        {figures.map((figure, i) => (
          <Reveal key={figure.label} delay={i * 110} className="flex flex-col gap-3 border-t border-white/14 pt-6">
            <span className="flex items-center justify-between gap-3 text-fog-600">
              <span className="font-mono text-[13px] text-brand-bright">{pad2(i + 2)}</span>
              {figure.value === undefined && <PlaceholderBadge />}
            </span>
            {figure.value === undefined ? (
              <>
                <span className="text-[clamp(56px,6.4cqw,104px)] font-medium leading-[0.95] tracking-[-0.05em]">00</span>
                <span className="text-[clamp(16px,1.3cqw,19px)] text-fog-400">{figure.label}</span>
              </>
            ) : (
              <StatCounter value={figure.value} suffix={figure.suffix} label={figure.label} size="lg" />
            )}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** A client quote (light section), marked as a placeholder until the real one arrives. */
export function CaseTestimonial({ eyebrow, quote, author, role, logo, placeholder }: NonNullable<ProjectDetail["testimonial"]>) {
  return (
    <section className="bg-paper px-gutter py-[clamp(96px,11cqw,176px)] text-ink">
      <Reveal as="figure" className="m-0 flex max-w-[1100px] flex-col gap-[clamp(32px,4cqw,56px)]">
        <span className="flex items-center gap-3.5 text-brand">
          <Eyebrow>{eyebrow}</Eyebrow>
          {placeholder && <PlaceholderBadge />}
        </span>
        <blockquote className="m-0 -indent-[0.42em] text-pretty text-[clamp(30px,3.6cqw,56px)] font-medium leading-[1.14] tracking-[-0.03em]">
          “{quote}”
        </blockquote>
        <figcaption className="flex flex-wrap items-center gap-5">
          {logo && (
            <div className="relative h-14 w-[120px] flex-none rounded-[10px] bg-ink">
              <Image src={logo.src} alt={logo.alt} fill sizes="120px" className="object-contain p-2" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-lg font-medium">{author}</span>
            <span className="text-[15px] text-ink-600">{role}</span>
          </div>
        </figcaption>
      </Reveal>
    </section>
  );
}
