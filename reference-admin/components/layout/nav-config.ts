import {
  BellRing,
  BriefcaseBusiness,
  CircleHelp,
  Clapperboard,
  Handshake,
  House,
  Info,
  Layers,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  Package,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react"
import type { Messages } from "next-intl"

/** Key under the `Nav` namespace in messages/*.json. */
export type NavLabelKey = Exclude<keyof Messages["Nav"], "main" | "toggleSidebar" | "breadcrumb">

export interface NavItem {
  labelKey: NavLabelKey
  /** Leaf links have an href; parents have children instead. */
  href?: string
  /** Shown on top-level items only. */
  icon?: LucideIcon
  /** Optional count shown as a red pill, e.g. unread feedback. */
  badge?: number
  children?: NavItem[]
}

// The sidebar renders this tree in order; nesting can go as deep as needed.
export const mainNav: NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    labelKey: "settings",
    icon: Settings,
    children: [
      { labelKey: "configuration", href: "/settings/configuration" },
      { labelKey: "countries", href: "/settings/countries" },
      { labelKey: "internalBanners", href: "/settings/internal-banners" },
    ],
  },
  {
    labelKey: "home",
    icon: House,
    children: [
      { labelKey: "banner", href: "/home/banner" },
      { labelKey: "welcomeMessage", href: "/home/welcome-message" },
      { labelKey: "footerContact", href: "/home/footer-contact" },
    ],
  },
  { labelKey: "aboutUs", href: "/about-us", icon: Info },
  { labelKey: "services", href: "/services", icon: Layers },
  {
    labelKey: "products",
    icon: Package,
    children: [
      { labelKey: "categories", href: "/products/categories" },
      { labelKey: "productList", href: "/products/list" },
    ],
  },
  { labelKey: "clients", href: "/clients", icon: Users },
  { labelKey: "partners", href: "/partners", icon: Handshake },
  {
    labelKey: "mediaCenter",
    icon: Clapperboard,
    children: [
      { labelKey: "newsEvents", href: "/media-center/news-events" },
      {
        labelKey: "photoGallery",
        children: [
          { labelKey: "albums", href: "/media-center/photo-gallery/albums" },
          { labelKey: "photos", href: "/media-center/photo-gallery/photos" },
        ],
      },
      { labelKey: "videoGallery", href: "/media-center/video-gallery" },
      { labelKey: "downloadCenter", href: "/media-center/download-center" },
    ],
  },
  { labelKey: "faqs", href: "/faqs", icon: CircleHelp },
  {
    labelKey: "careers",
    icon: BriefcaseBusiness,
    children: [
      { labelKey: "jobOpportunities", href: "/careers/jobs" },
      { labelKey: "candidates", href: "/careers/candidates" },
    ],
  },
  { labelKey: "contact", href: "/contact", icon: Mail },
  { labelKey: "subscribers", href: "/subscribers", icon: BellRing },
  { labelKey: "feedbacks", href: "/feedbacks", icon: MessageSquareText },
]

export function isPathActive(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** True when the item, or anything nested under it, matches the current path. */
export function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.href && isPathActive(item.href, pathname)) return true
  return item.children?.some((child) => isItemActive(child, pathname)) ?? false
}

/**
 * Items from the top level down to the menu link that best matches `pathname`:
 * an exact match, or else the deepest link the path sits under (so a future
 * "/clients/42/edit" still resolves to Clients). Null when nothing matches.
 */
export function findNavPath(pathname: string, items: NavItem[] = mainNav): NavItem[] | null {
  let best: NavItem[] | null = null
  for (const item of items) {
    const nested = item.children && findNavPath(pathname, item.children)
    const candidate = nested
      ? [item, ...nested]
      : item.href && isPathActive(item.href, pathname)
        ? [item]
        : null
    const depth = (trail: NavItem[]) => trail.at(-1)?.href?.length ?? 0
    if (candidate && (!best || depth(candidate) > depth(best))) best = candidate
  }
  return best
}

/** Label trail for a path that exactly matches a menu link, e.g. ["mediaCenter", "photoGallery", "albums"]. */
export function findNavTrail(href: string): NavLabelKey[] | null {
  const trail = findNavPath(href)
  return trail && trail.at(-1)?.href === href ? trail.map((item) => item.labelKey) : null
}
