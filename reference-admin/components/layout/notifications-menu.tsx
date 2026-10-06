"use client"

import { Bell, BellOff } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { headerIconButton } from "./header-styles"

// There's no notifications API yet, so this shows the empty state. When one
// exists, render the unread count as a badge on the trigger and list items here.
export function NotificationsMenu() {
  const t = useTranslations("Header")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={headerIconButton}
            aria-label={t("notifications")}
          />
        }
      >
        <Bell />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("notifications")}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="text-muted-foreground flex flex-col items-center gap-2 px-3 py-6 text-center text-sm">
          <BellOff className="size-5" />
          {t("noNotifications")}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
