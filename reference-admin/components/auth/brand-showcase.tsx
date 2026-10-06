import {
  Bell,
  Box,
  Gauge,
  Info,
  Search,
  Settings,
  TrendingUp,
} from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { LogoMark } from "@/components/logo";
import { cn } from "@/lib/utils";

// A smooth traffic curve for the illustration (viewBox 0 0 300 110).
const LINE =
  "M0 78 C 20 70, 32 40, 52 46 S 84 92, 108 80 S 140 30, 162 36 S 196 84, 220 70 S 258 18, 280 28 L 300 22";
const SPARK_BARS = [6, 10, 7, 13, 9, 15, 11, 17, 12, 19];

/** Outline hexagon used as background decoration on the panel. */
function Hexagon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 115"
      aria-hidden
      className={cn("pointer-events-none absolute", className)}
    >
      <path
        d="M50 2 L97 29.5 L97 85.5 L50 113 L3 85.5 L3 29.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * The brand side of the login page: a stylised mini dashboard on the Spark red
 * panel, with the headline below. Purely decorative apart from the headline.
 */
export async function BrandShowcase({ className }: { className?: string }) {
  const t = await getTranslations("Auth.showcase");
  const tNav = await getTranslations("Nav");
  const format = await getFormatter();

  const menu = [
    { icon: Gauge, label: tNav("dashboard"), active: true },
    { icon: Info, label: tNav("aboutUs") },
    { icon: Box, label: tNav("products") },
    { icon: Settings, label: tNav("settings") },
  ];

  return (
    <aside
      className={cn(
        "bg-primary text-primary-foreground relative flex-col items-center justify-center gap-12 overflow-hidden rounded-3xl p-10",
        className,
      )}
    >
      <Hexagon className="-start-10 -top-12 w-44 text-white/10" />
      <Hexagon className="start-[30%] top-[12%] w-10 text-white/15" />
      <Hexagon className="-end-14 bottom-10 w-56 text-white/10" />
      <Hexagon className="start-[8%] bottom-[18%] w-16 text-white/10" />

      {/* Decorative: screen readers skip the illustration. */}
      <div aria-hidden className="relative w-full max-w-[520px] select-none">
        <div className="bg-background text-foreground rounded-2xl p-3 text-[10px] shadow-2xl ring-1 ring-black/5">
          <div className="mb-3 flex items-center gap-2">
            <LogoMark variant="colored" className="size-4 dark:hidden" />
            <LogoMark variant="white" className="hidden size-4 dark:block" />
            <div className="bg-muted text-muted-foreground ms-2 flex h-6 flex-1 items-center gap-1.5 rounded-md px-2">
              <Search className="size-3" />
              <span>{t("search")}</span>
            </div>
            <span className="relative">
              <Bell className="text-muted-foreground size-3.5" />
              <span className="bg-primary absolute -end-0.5 -top-0.5 size-1.5 rounded-full" />
            </span>
          </div>

          <div className="flex gap-3">
            <ul className="flex w-24 shrink-0 flex-col gap-1">
              {menu.map(({ icon: Icon, label, active }) => (
                <li
                  key={label}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2 py-1.5",
                    active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-3" />
                  <span className="truncate">{label}</span>
                </li>
              ))}
            </ul>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: t("visitors"), value: 12480, change: 8.2 },
                  { label: t("pageViews"), value: 48210, change: 5.4 },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border p-2">
                    <p className="text-muted-foreground">{stat.label}</p>
                    <p className="flex items-baseline justify-between gap-1">
                      <span className="text-sm font-semibold tabular-nums">
                        {format.number(stat.value)}
                      </span>
                      <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="size-2.5" />
                        <span dir="ltr">+{format.number(stat.change)}%</span>
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border p-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">{t("traffic")}</span>
                  <span className="bg-foreground text-background rounded px-1.5 py-0.5 tabular-nums">
                    {format.number(1284)}
                  </span>
                </div>
                {/* SVG drawing ignores page direction, so the curve reads left to right in Arabic too. */}
                <svg
                  viewBox="0 0 300 110"
                  className="h-28 w-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="showcase-fill"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="0"
                        stopColor="var(--primary)"
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="1"
                        stopColor="var(--primary)"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  {[22, 50, 78].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      x2="300"
                      y1={y}
                      y2={y}
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                    />
                  ))}
                  <path
                    d={`${LINE} L 300 110 L 0 110 Z`}
                    fill="url(#showcase-fill)"
                  />
                  <path
                    d={LINE}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="162"
                    cy="36"
                    r="4"
                    fill="var(--background)"
                    stroke="var(--primary)"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Floating "active now" card */}
        <div className="bg-background text-foreground absolute -start-8 -bottom-10 w-44 rounded-2xl p-3 text-[10px] shadow-2xl ring-1 ring-black/5">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full">
              <Gauge className="size-3.5" />
            </span>
            <div className="leading-tight">
              <p className="font-medium">{t("activeNow")}</p>
              <p className="text-muted-foreground">{t("lastMinutes")}</p>
            </div>
          </div>
          <div className="mt-2 flex h-8 items-end gap-0.5" dir="ltr">
            {SPARK_BARS.map((h, i) => (
              <span
                key={i}
                className={cn(
                  "flex-1 rounded-sm",
                  i === SPARK_BARS.length - 1 ? "bg-primary" : "bg-primary/25",
                )}
                style={{ height: `${h * 5}%` }}
              />
            ))}
          </div>
          <p className="mt-1.5 flex items-baseline justify-between">
            <span className="text-base font-semibold tabular-nums">
              {format.number(128)}
            </span>
            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-2.5" />
              <span dir="ltr">+12%</span>
            </span>
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-6 flex max-w-md flex-col items-center gap-2 text-center">
        <h2 className="font-heading text-3xl leading-tight font-semibold text-balance">
          {t("headline")}
        </h2>
        <p className="text-sm opacity-80">{t("body")}</p>
      </div>
    </aside>
  );
}
