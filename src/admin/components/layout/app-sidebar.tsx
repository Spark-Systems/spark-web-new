"use client";

import { ChevronRight } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AdaptiveLogo, LogoMark } from "@admin/components/logo";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@admin/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@admin/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@admin/components/ui/sidebar";
import { enquiriesQueries } from "@admin/lib/api/services/records";
import { useAuth } from "@admin/lib/auth/auth-provider";
import { HOME_PATH } from "@admin/lib/auth/constants";
import { cn } from "@admin/lib/utils";
import {
  isItemActive,
  isPathActive,
  navFor,
  type NavBadge,
  type NavItem,
} from "./nav-config";

/** The live count behind a menu badge (0 hides it). */
function useNavBadge(badge: NavBadge | undefined) {
  const { data } = useQuery({ ...enquiriesQueries.stats(), enabled: badge === "newEnquiries" });
  return badge === "newEnquiries" ? (data?.new ?? 0) : 0;
}

const menuButtonClass =
  "text-muted-foreground hover:text-foreground h-10 gap-3 rounded-lg px-3 data-active:bg-accent data-active:text-accent-foreground data-active:hover:bg-accent data-active:hover:text-accent-foreground [&[data-active]>svg]:text-primary";

const subButtonClass =
  "text-muted-foreground hover:text-foreground h-8 data-active:bg-accent data-active:text-accent-foreground data-active:font-medium";

// Base UI exposes the panel's measured height, so open/close can animate.
const panelClass =
  "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0";

/**
 * Open state for a collapsible section: starts open when it contains the
 * current page, opens again whenever you navigate into it, and otherwise
 * stays however the user left it.
 */
function useSectionOpen(active: boolean) {
  const [open, setOpen] = useState(active);
  const [wasActive, setWasActive] = useState(active);
  // Adjusting state during render when a prop changes (no effect needed).
  if (active !== wasActive) {
    setWasActive(active);
    if (active) setOpen(true);
  }
  return [open, setOpen] as const;
}

/**
 * On phones the sidebar is a sheet over the page; following a link should close
 * it so the new page is visible. On larger screens this does nothing.
 */
function useCloseOnNavigate() {
  const { isMobile, setOpenMobile } = useSidebar();
  return () => {
    if (isMobile) setOpenMobile(false);
  };
}

/** Points toward reading-end when closed, down when open. */
function Chevron() {
  return (
    <ChevronRight className="ms-auto size-4 shrink-0 transition-transform duration-200 group-data-open/collapsible:rotate-90 rtl:rotate-180 rtl:group-data-open/collapsible:rotate-90" />
  );
}

function NavSubSection({ item, items }: { item: NavItem; items: NavItem[] }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useSectionOpen(isItemActive(item, pathname));

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuSubItem />}
    >
      {/* Sub-buttons default to <a>; a toggle must be a real button. */}
      <CollapsibleTrigger
        render={
          <SidebarMenuSubButton
            className={cn(subButtonClass, "w-full")}
            render={<button type="button" />}
          />
        }
      >
        <span>{t(item.labelKey)}</span>
        <Chevron />
      </CollapsibleTrigger>
      <CollapsibleContent className={panelClass}>
        <NavSubItems items={items} />
      </CollapsibleContent>
    </Collapsible>
  );
}

function NavSubItems({ items }: { items: NavItem[] }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const closeOnNavigate = useCloseOnNavigate();

  return (
    <SidebarMenuSub>
      {items.map((item) =>
        item.children ? (
          <NavSubSection
            key={item.labelKey}
            item={item}
            items={item.children}
          />
        ) : (
          <SidebarMenuSubItem key={item.labelKey}>
            <SidebarMenuSubButton
              isActive={!!item.href && isPathActive(item.href, pathname)}
              className={subButtonClass}
              render={<Link href={item.href ?? "#"} onClick={closeOnNavigate} />}
            >
              <span>{t(item.labelKey)}</span>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        ),
      )}
    </SidebarMenuSub>
  );
}

/** Flyout used for parent items while the sidebar is collapsed to icons. */
function NavDropdownItems({ items }: { items: NavItem[] }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return items.map((item) =>
    item.children ? (
      <DropdownMenuSub key={item.labelKey}>
        <DropdownMenuSubTrigger>{t(item.labelKey)}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <NavDropdownItems items={item.children} />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    ) : (
      <DropdownMenuItem
        key={item.labelKey}
        className={cn(
          item.href &&
            isPathActive(item.href, pathname) &&
            "text-primary font-medium",
        )}
        render={<Link href={item.href ?? "#"} />}
      >
        {t(item.labelKey)}
      </DropdownMenuItem>
    ),
  );
}

function NavTopItem({
  item,
  tooltipSide,
}: {
  item: NavItem;
  tooltipSide: "left" | "right";
}) {
  const t = useTranslations("Nav");
  const format = useFormatter();
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const label = t(item.labelKey);
  const active = isItemActive(item, pathname);
  const [open, setOpen] = useSectionOpen(active);
  const closeOnNavigate = useCloseOnNavigate();
  const badge = useNavBadge(item.badge);
  const Icon = item.icon;

  if (!item.children) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={active}
          tooltip={{ children: label, side: tooltipSide }}
          render={<Link href={item.href ?? "#"} onClick={closeOnNavigate} />}
          className={menuButtonClass}
        >
          {Icon && <Icon />}
          <span>{label}</span>
        </SidebarMenuButton>
        {badge ? (
          <SidebarMenuBadge className="bg-primary text-primary-foreground peer-hover/menu-button:text-primary-foreground peer-data-active/menu-button:text-primary-foreground end-2 top-2.5! rounded-full">
            {format.number(badge)}
          </SidebarMenuBadge>
        ) : null}
      </SidebarMenuItem>
    );
  }

  // Collapsed to icons: sub-links can't be shown inline, so open them in a flyout.
  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                isActive={active}
                className={menuButtonClass}
                aria-label={label}
              />
            }
          >
            {Icon && <Icon />}
            <span>{label}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="inline-end"
            align="start"
            sideOffset={8}
            className="w-52"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>{label}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <NavDropdownItems items={item.children} />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            className={cn(
              menuButtonClass,
              active && "text-foreground [&>svg:first-child]:text-primary",
            )}
          />
        }
      >
        {Icon && <Icon />}
        <span>{label}</span>
        <Chevron />
      </CollapsibleTrigger>
      <CollapsibleContent className={panelClass}>
        <NavSubItems items={item.children} />
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AppSidebar({ dir }: { dir: "ltr" | "rtl" }) {
  const t = useTranslations("Nav");
  // The sidebar sits on the reading-start edge: left in English, right in Arabic.
  const side = dir === "rtl" ? "right" : "left";
  const tooltipSide = dir === "rtl" ? "left" : "right";
  const closeOnNavigate = useCloseOnNavigate();
  const { user } = useAuth();

  return (
    <Sidebar side={side} dir={dir} collapsible="icon">
      {/* Collapsed to icons the rail is 3rem wide, so the padding shrinks to fit the badge. */}
      <SidebarHeader className="h-16 justify-center px-4 transition-[padding] group-data-[collapsible=icon]:px-2">
        <Link
          href={HOME_PATH}
          onClick={closeOnNavigate}
          aria-label="Spark Systems"
          className="flex min-w-0 items-center group-data-[collapsible=icon]:justify-center"
        >
          {/* The wrapper does the hiding: the logos' own light/dark display classes
              would otherwise win over it and keep the full logo showing. */}
          <span className="flex min-w-0 shrink-0 group-data-[collapsible=icon]:hidden">
            <AdaptiveLogo priority className="h-7 w-auto max-w-none" />
          </span>
          <span className="bg-primary hidden size-8 shrink-0 items-center justify-center rounded-lg group-data-[collapsible=icon]:flex">
            <LogoMark variant="white" className="size-4.5" />
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navFor(user?.role).map((item) => (
                <NavTopItem
                  key={item.labelKey}
                  item={item}
                  tooltipSide={tooltipSide}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail aria-label={t("toggleSidebar")} title={t("toggleSidebar")} />
    </Sidebar>
  );
}
