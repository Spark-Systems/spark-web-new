"use client";

import { CalendarDays, ChevronLeft, Menu } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { LocaleSwitcher } from "@admin/components/locale-switcher";
import { AdaptiveLogo } from "@admin/components/logo";
import { ThemeToggle } from "@admin/components/theme-toggle";
import { Button } from "@admin/components/ui/button";
import { useSidebar } from "@admin/components/ui/sidebar";
import { Skeleton } from "@admin/components/ui/skeleton";
import { useHour, useToday } from "@admin/hooks/use-client-date";
import { toLocalDate } from "@admin/lib/analytics/date-range";
import { useAuth } from "@admin/lib/auth/auth-provider";
import { cn } from "@admin/lib/utils";
import { headerIconButton } from "./header-styles";
import { NotificationsMenu } from "./notifications-menu";
import { UserMenu } from "./user-menu";

/**
 * Collapse button. On desktop it straddles the sidebar's edge; on mobile it
 * opens the sidebar sheet.
 */
function SidebarToggle() {
  const t = useTranslations("Nav");
  const { toggleSidebar, isMobile, state } = useSidebar();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleSidebar}
      aria-label={t("toggleSidebar")}
      className={cn(
        "bg-card shrink-0 rounded-full shadow-xs",
        isMobile ? "size-9" : "size-7 -ms-[2.375rem]",
      )}
    >
      {isMobile ? (
        <Menu />
      ) : (
        <ChevronLeft
          className={cn(
            "transition-transform rtl:rotate-180",
            state === "collapsed" && "rotate-180 rtl:rotate-0",
          )}
        />
      )}
    </Button>
  );
}

function Greeting() {
  const t = useTranslations("Header");
  const { user } = useAuth();
  const hour = useHour();

  if (!user || hour === null) {
    return (
      <div className="hidden flex-col gap-1.5 sm:flex">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3.5 w-64" />
      </div>
    );
  }

  const period = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  // Isolate the name so a Latin name doesn't reorder the punctuation around it in Arabic.
  const firstName = `\u2068${user.name.split(/\s+/)[0]}\u2069`;

  return (
    <div className="hidden min-w-0 sm:block">
      <p className="font-heading truncate text-lg leading-tight font-semibold">
        {t(`greeting.${period}`, { name: firstName })}
      </p>
      <p className="text-muted-foreground truncate text-sm">
        {t("greetingSubtitle")}
      </p>
    </div>
  );
}

function TodayPill() {
  const t = useTranslations("Header");
  const format = useFormatter();
  const today = useToday();

  return (
    <div
      aria-label={t("today")}
      className="bg-card hidden h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium lg:flex"
    >
      <CalendarDays className="text-muted-foreground size-4" />
      {today ? (
        format.dateTime(toLocalDate(today), {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      ) : (
        <Skeleton className="h-4 w-20" />
      )}
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="bg-background/80 sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b px-4 backdrop-blur md:px-6">
      <SidebarToggle />
      {/* Phones have no room for the greeting; show the brand instead. */}
      <span className="sm:hidden">
        <AdaptiveLogo className="h-6" />
      </span>
      <Greeting />
      <div className="ms-auto flex items-center gap-2">
        {/* <LocaleSwitcher className={headerIconButton} /> */}
        <ThemeToggle className={headerIconButton} />
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}
