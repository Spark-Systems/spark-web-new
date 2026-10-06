"use client"

import type { LucideIcon } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface SegmentedTab<V extends string = string> {
  value: V
  label: React.ReactNode
  icon?: LucideIcon
  /** Panel shown when the tab is active. Omit to use the tabs as a pure switcher. */
  content?: React.ReactNode
  /** Small count or label after the text, e.g. unread items. */
  badge?: React.ReactNode
  disabled?: boolean
}

export interface SegmentedTabsProps<V extends string = string> {
  tabs: SegmentedTab<V>[]
  /** Controlled value; pair with onValueChange. */
  value?: V
  /** Initial value when uncontrolled. Defaults to the first tab. */
  defaultValue?: V
  onValueChange?: (value: V) => void
  /** Keep inactive panels mounted so their state (e.g. unsaved form edits) survives. Default true. */
  keepMounted?: boolean
  size?: "sm" | "default" | "lg"
  /** Stretch the bar to the container and share the width equally. */
  fullWidth?: boolean
  className?: string
  listClassName?: string
  contentClassName?: string
  "aria-label"?: string
  /**
   * Places the tab bar inside your own layout (e.g. a page header) instead of above
   * the panels. It still renders inside the Tabs root, so selection keeps working.
   */
  renderList?: (list: React.ReactNode) => React.ReactNode
}

const sizes = {
  sm: "group-data-[variant=segmented]/tabs-list:h-7 group-data-[variant=segmented]/tabs-list:px-2.5 text-xs",
  default: "",
  lg: "group-data-[variant=segmented]/tabs-list:h-11 group-data-[variant=segmented]/tabs-list:px-4 text-base [&_svg:not([class*='size-'])]:size-5",
}

/**
 * Segmented tab bar (white container, light brand-red pill on the active tab), with
 * optional icon, badge and panel per tab. Built on shadcn/Base UI Tabs, so
 * keyboard navigation, RTL and ARIA come for free.
 *
 * @example
 * <SegmentedTabs
 *   tabs={[
 *     { value: "telegram", label: "Telegram", icon: Send, content: <TelegramForm /> },
 *     { value: "instagram", label: "Instagram", icon: Instagram, content: <InstagramForm /> },
 *   ]}
 * />
 */
export function SegmentedTabs<V extends string = string>({
  tabs,
  value,
  defaultValue,
  onValueChange,
  keepMounted = true,
  size = "default",
  fullWidth,
  className,
  listClassName,
  contentClassName,
  "aria-label": ariaLabel,
  renderList,
}: SegmentedTabsProps<V>) {
  const panels = tabs.filter((tab) => tab.content !== undefined)

  const list = (
    <TabsList variant="segmented" aria-label={ariaLabel} className={cn(fullWidth && "w-full", listClassName)}>
      {tabs.map(({ value: tabValue, label, icon: Icon, badge, disabled }) => (
        <TabsTrigger
          key={tabValue}
          value={tabValue}
          disabled={disabled}
          className={cn(sizes[size], fullWidth && "group-data-[variant=segmented]/tabs-list:flex-1")}
        >
          {Icon && <Icon data-icon="inline-start" />}
          {label}
          {badge !== undefined && (
            <span className="bg-accent text-accent-foreground ms-0.5 rounded-full px-1.5 text-xs leading-5 tabular-nums">
              {badge}
            </span>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  )

  return (
    <Tabs
      value={value}
      defaultValue={value === undefined ? (defaultValue ?? tabs[0]?.value) : undefined}
      onValueChange={(next) => onValueChange?.(next as V)}
      className={cn("gap-4", className)}
    >
      {renderList ? renderList(list) : list}
      {panels.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} keepMounted={keepMounted} className={contentClassName}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
