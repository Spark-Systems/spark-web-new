"use client"

import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@admin/components/ui/button"
import { Input } from "@admin/components/ui/input"
import { cn } from "@admin/lib/utils"

/** Password field with a show/hide toggle. Accepts every shadcn Input prop except `type`. */
export function PasswordInput({ className, disabled, ...props }: Omit<React.ComponentProps<typeof Input>, "type">) {
  const t = useTranslations("Inputs")
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        disabled={disabled}
        type={visible ? "text" : "password"}
        // Passwords and keys are Latin; keep them LTR in the Arabic UI too.
        dir="ltr"
        className={cn("pe-9", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        aria-pressed={visible}
        className="text-muted-foreground absolute end-0.5 top-1/2 -translate-y-1/2"
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  )
}
