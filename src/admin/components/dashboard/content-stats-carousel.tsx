"use client"

import {
  ArrowUpRight,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Handshake,
  Layers,
  MapPin,
  Newspaper,
  UserRoundSearch,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { useFormatter, useLocale, useTranslations } from "next-intl"

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@admin/components/ui/carousel"
import type { Overview } from "@admin/lib/api/services/records"
import { cn } from "@admin/lib/utils"

export type StatKey = "solutions" | "services" | "projects" | "clients" | "partners" | "offices" | "jobs" | "insights"

/** Icon and colour of each content type's card (class names spelled out so Tailwind sees them). */
const looks: Record<StatKey, { icon: LucideIcon; tile: string; bar: string; glow: string }> = {
  solutions: { icon: Boxes, tile: "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400", bar: "bg-rose-500", glow: "bg-rose-500/15" },
  services: { icon: Layers, tile: "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400", bar: "bg-violet-500", glow: "bg-violet-500/15" },
  projects: { icon: BriefcaseBusiness, tile: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400", bar: "bg-amber-500", glow: "bg-amber-500/15" },
  clients: { icon: Building2, tile: "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400", bar: "bg-sky-500", glow: "bg-sky-500/15" },
  partners: { icon: Handshake, tile: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400", bar: "bg-emerald-500", glow: "bg-emerald-500/15" },
  offices: { icon: MapPin, tile: "bg-orange-500/10 text-orange-600 ring-orange-500/20 dark:text-orange-400", bar: "bg-orange-500", glow: "bg-orange-500/15" },
  jobs: { icon: UserRoundSearch, tile: "bg-indigo-500/10 text-indigo-600 ring-indigo-500/20 dark:text-indigo-400", bar: "bg-indigo-500", glow: "bg-indigo-500/15" },
  insights: { icon: Newspaper, tile: "bg-teal-500/10 text-teal-600 ring-teal-500/20 dark:text-teal-400", bar: "bg-teal-500", glow: "bg-teal-500/15" },
}

function StatCard({ statKey, label, href, count }: { statKey: StatKey; label: string; href: string; count: Overview["counts"][string] }) {
  const t = useTranslations("Overview")
  const format = useFormatter()
  const look = looks[statKey]
  const Icon = look.icon
  const share = count.total ? count.published / count.total : 0

  return (
    <Link
      href={href}
      className={cn(
        "group bg-card relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border p-5 outline-none",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        "focus-visible:ring-ring focus-visible:ring-2"
      )}
    >
      {/* Decoration: a soft colour glow and the icon, oversized and faded, in the corner. */}
      <span aria-hidden className={cn("pointer-events-none absolute -end-10 -top-10 size-32 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-70", look.glow)} />
      <Icon aria-hidden className="text-foreground/[0.04] pointer-events-none absolute -end-4 -bottom-5 size-28 -rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" />

      <div className="relative flex items-start justify-between gap-2">
        <span className={cn("flex size-11 items-center justify-center rounded-xl ring-1 ring-inset", look.tile)}>
          <Icon className="size-5" />
        </span>
        <span className="bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground flex size-7 items-center justify-center rounded-full transition-colors">
          <ArrowUpRight className="size-3.5 transition-transform group-hover:rotate-45 rtl:-scale-x-100" />
        </span>
      </div>

      <div className="relative flex flex-col gap-0.5">
        <span className="text-muted-foreground text-sm font-medium">{label}</span>
        <span className="font-heading text-3xl font-semibold tracking-tight tabular-nums">{format.number(count.total)}</span>
      </div>

      <div className="relative mt-auto flex flex-col gap-1.5">
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div className={cn("h-full rounded-full transition-[width] duration-700", look.bar)} style={{ width: `${share * 100}%` }} />
        </div>
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>{t("published", { count: count.published })}</span>
          <span className="tabular-nums">{format.number(share, { style: "percent" })}</span>
        </div>
      </div>
    </Link>
  )
}

/** The dashboard's top row: one card per content list, in a swipeable carousel. */
export function ContentStatsCarousel({
  counts,
  hrefs,
  label,
}: {
  counts: Overview["counts"]
  hrefs: Record<string, string>
  label: (key: StatKey) => string
}) {
  const t = useTranslations("Overview")
  const format = useFormatter()
  const rtl = useLocale() === "ar"
  const entries = Object.entries(counts).filter(([key]) => key in looks) as [StatKey, Overview["counts"][string]][]
  const total = entries.reduce((sum, [, count]) => sum + count.total, 0)

  return (
    <Carousel opts={{ align: "start", slidesToScroll: "auto", direction: rtl ? "rtl" : "ltr" }} aria-label={t("contentTitle")} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="font-heading text-base font-semibold">{t("contentTitle")}</h2>
          <span className="text-muted-foreground text-sm">{t("contentTotal", { count: total, formatted: format.number(total) })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CarouselPrevious aria-label={t("previous")} />
          <CarouselNext aria-label={t("next")} />
        </div>
      </div>
      <CarouselContent className="py-2">
        {entries.map(([key, count]) => (
          <CarouselItem key={key} className="basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
            <StatCard statKey={key} label={label(key)} href={hrefs[key]} count={count} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselDots label={(index) => t("goTo", { number: index + 1 })} />
    </Carousel>
  )
}
