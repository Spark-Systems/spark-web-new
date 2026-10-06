"use client"

import { ChevronDown, LogOut, UserRound } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@admin/components/ui/avatar"
import { Button } from "@admin/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@admin/components/ui/dropdown-menu"
import { Skeleton } from "@admin/components/ui/skeleton"
import { useAuth } from "@admin/lib/auth/auth-provider"
import { adminPaths } from "@admin/lib/paths"
import { getInitials } from "@admin/lib/utils"

export function UserMenu() {
  const t = useTranslations("UserMenu")
  const { user, logout } = useAuth()

  if (!user) return <Skeleton className="h-10 w-16 rounded-full" />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="bg-card border-border h-10 gap-1.5 rounded-full border ps-1 pe-2"
            aria-label={t("account")}
          />
        }
      >
        <Avatar>
          {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="text-muted-foreground size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span className="text-foreground text-sm">{user.name}</span>
            <span className="truncate">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={adminPaths.profile} />}>
          <UserRound />
          {t("profile")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={logout}>
          <LogOut />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
