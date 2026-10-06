"use client"

import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@admin/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@admin/components/ui/dropdown-menu"
import { cn } from "@admin/lib/utils"

export interface FacetOption {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Toolbar filter button ("Status ⌄") with checkbox options. Shows the number of
 * active choices on the button.
 *
 * @example
 * <DataTableFacetFilter title="Status" options={statusOptions}
 *   value={query.filters.status ?? []}
 *   onChange={(status) => setQuery({ filters: { ...query.filters, status }, page: 1 })} />
 */
export function DataTableFacetFilter({
  title,
  options,
  value,
  onChange,
}: {
  title: string
  options: FacetOption[]
  value: string[]
  onChange: (value: string[]) => void
}) {
  const t = useTranslations("DataTable")
  const selected = new Set(value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className={cn("gap-1.5 font-normal", selected.size > 0 && "border-primary/40 bg-accent text-accent-foreground")}
          />
        }
      >
        {title}
        {selected.size > 0 && (
          <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-[11px] leading-4 font-medium tabular-nums">
            {selected.size}
          </span>
        )}
        <ChevronDown className="text-muted-foreground size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{title}</DropdownMenuLabel>
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selected.has(option.value)}
              closeOnClick={false}
              onCheckedChange={(checked) => {
                const next = new Set(selected)
                if (checked) next.add(option.value)
                else next.delete(option.value)
                onChange(options.map((o) => o.value).filter((v) => next.has(v)))
              }}
            >
              {option.icon && <option.icon className="size-4" />}
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        {selected.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange([])} className="justify-center text-sm">
              {t("clearFilter")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
