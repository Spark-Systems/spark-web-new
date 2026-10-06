"use client"

import { subMonths } from "date-fns"
import { CalendarIcon, Check } from "lucide-react"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { ar, enUS } from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"
import { getDirection } from "@/i18n/config"
import {
  GA_MIN_DATE,
  MAX_RANGE_DAYS,
  matchPreset,
  presetRange,
  presets,
  toIsoDate,
  toLocalDate,
  type DateRangeValue,
  type Preset,
} from "@/lib/analytics/date-range"
import { cn } from "@/lib/utils"

const calendarLocales = { en: enUS, ar }

export function DateRangePicker({
  value,
  today,
  onChange,
}: {
  value: DateRangeValue
  /** The viewer's current date, YYYY-MM-DD. */
  today: string
  onChange: (range: DateRangeValue) => void
}) {
  const t = useTranslations("Dashboard")
  const format = useFormatter()
  const locale = useLocale()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>()

  const activePreset = matchPreset(value, today)
  const rangeLabel = format.dateTimeRange(toLocalDate(value.from), toLocalDate(value.to), {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const handleOpenChange = (next: boolean) => {
    // Start each visit from the applied range; edits only take effect on Apply.
    if (next) setDraft({ from: toLocalDate(value.from), to: toLocalDate(value.to) })
    setOpen(next)
  }

  const applyPreset = (preset: Preset) => {
    onChange(presetRange(preset, today))
    setOpen(false)
  }

  const applyDraft = () => {
    if (!draft?.from) return
    onChange({ from: toIsoDate(draft.from), to: toIsoDate(draft.to ?? draft.from) })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={<Button variant="outline" className="max-w-full justify-start font-normal" />}
      >
        <CalendarIcon data-icon="inline-start" />
        <span className="font-medium">{activePreset ? t(`presets.${activePreset}`) : t("customRange")}</span>
        <span className="text-muted-foreground hidden truncate sm:inline">{rangeLabel}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] gap-0 p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-wrap gap-1 border-b p-2 sm:w-40 sm:flex-col sm:flex-nowrap sm:border-e sm:border-b-0">
            {presets.map((preset) => (
              <Button
                key={preset}
                variant="ghost"
                size="sm"
                className={cn("justify-between", preset === activePreset && "font-semibold")}
                onClick={() => applyPreset(preset)}
              >
                {t(`presets.${preset}`)}
                {preset === activePreset && <Check className="size-4" strokeWidth={3} />}
              </Button>
            ))}
          </div>
          <div className="flex flex-col">
            <Calendar
              mode="range"
              selected={draft}
              onSelect={setDraft}
              resetOnSelect
              max={MAX_RANGE_DAYS}
              numberOfMonths={isMobile ? 1 : 2}
              defaultMonth={isMobile ? toLocalDate(value.to) : subMonths(toLocalDate(value.to), 1)}
              disabled={[{ after: toLocalDate(today) }, { before: toLocalDate(GA_MIN_DATE) }]}
              locale={calendarLocales[locale]}
              dir={getDirection(locale)}
            />
            <div className="flex justify-end gap-2 border-t p-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button size="sm" disabled={!draft?.from} onClick={applyDraft}>
                {t("apply")}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
