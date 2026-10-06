"use client"

import { Minus, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

export interface NumberInputProps {
  /** null while the field is empty. */
  value: number | null
  onChange: (value: number | null) => void
  onBlur?: () => void
  min?: number
  max?: number
  step?: number
  /** Allow decimals; off by default (whole numbers only). */
  allowDecimals?: boolean
  id?: string
  name?: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
  "aria-describedby"?: string
}

const clamp = (n: number, min?: number, max?: number) =>
  Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, n))

/**
 * Number field with − / + steppers. Arrow Up/Down also step. Typing allows
 * transitional text such as "-" or "", and the value is clamped to min/max.
 */
export function NumberInput({
  value,
  onChange,
  onBlur,
  min,
  max,
  step = 1,
  allowDecimals = false,
  id,
  name,
  placeholder,
  disabled,
  invalid,
  className,
  "aria-describedby": describedBy,
}: NumberInputProps) {
  const t = useTranslations("Inputs")
  // Local text so "-" or "1." can be typed before they form a number.
  const [text, setText] = useState(value === null ? "" : String(value))
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setText(value === null ? "" : String(value))
  }

  const pattern = allowDecimals ? /^-?\d*\.?\d*$/ : /^-?\d*$/

  const stepBy = (direction: 1 | -1) => {
    const next = clamp((value ?? 0) + direction * step, min, max)
    onChange(allowDecimals ? next : Math.round(next))
  }

  return (
    <InputGroup className={cn("w-full", className)} data-disabled={disabled || undefined}>
      <InputGroupAddon>
        <InputGroupButton
          size="icon-xs"
          onClick={() => stepBy(-1)}
          disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
          aria-label={t("decrement")}
          tabIndex={-1}
        >
          <Minus />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        name={name}
        role="spinbutton"
        inputMode={allowDecimals ? "decimal" : "numeric"}
        dir="ltr"
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-valuenow={value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        className="text-center tabular-nums"
        onChange={(event) => {
          const next = event.target.value.trim()
          if (!pattern.test(next)) return
          setText(next)
          const parsed = Number(next)
          if (next === "") onChange(null)
          else if (next !== "-" && next !== "." && !Number.isNaN(parsed)) onChange(parsed)
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault()
            stepBy(event.key === "ArrowUp" ? 1 : -1)
          }
        }}
        onBlur={() => {
          // Settle half-typed text ("-", out of range) into a valid value.
          if (value !== null) {
            const settled = clamp(value, min, max)
            if (settled !== value) onChange(settled)
            setText(String(settled))
          } else {
            setText("")
          }
          onBlur?.()
        }}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          onClick={() => stepBy(1)}
          disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
          aria-label={t("increment")}
          tabIndex={-1}
        >
          <Plus />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
