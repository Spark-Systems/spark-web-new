import {
  Boxes,
  BriefcaseBusiness,
  Handshake,
  House,
  Info,
  Layers,
  LayoutDashboard,
  Mail,
  MapPin,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react"
import type { Messages } from "next-intl"

import { ADMIN_BASE } from "@admin/lib/auth/constants"

/** Key under the `Nav` namespace in messages/*.json. */
export type NavLabelKey = Exclude<keyof Messages["Nav"], "main" | "toggleSidebar" | "breadcrumb">

export interface NavItem {
  labelKey: NavLabelKey
  /** Leaf links have an href; parents have children instead. */
  href?: string
  /** Shown on top-level items only. */
  icon?: LucideIcon
  /** Optional count shown as a red pill, e.g. unread enquiries. */
  badge?: number
  children?: NavItem[]
}

const at = (path: string) => `${ADMIN_BASE}${path}`

// The sidebar renders this tree in order; nesting can go as deep as needed.
// Mirrors the website: one entry per page or content type it shows.
export const mainNav: NavItem[] = [
  { labelKey: "dashboard", href: at("/dashboard"), icon: LayoutDashboard },
  {
    labelKey: "settings",
    icon: Settings,
    children: [{ labelKey: "configuration", href: at("/settings/configuration") }],
  },
  {
    labelKey: "home",
    icon: House,
    children: [
      { labelKey: "homeHero", href: at("/home/hero") },
      { labelKey: "homeAi", href: at("/home/ai") },
      { labelKey: "homeTestimonials", href: at("/home/testimonials") },
    ],
  },
  { labelKey: "about", href: at("/about"), icon: Info },
  { labelKey: "solutions", href: at("/solutions"), icon: Boxes },
  { labelKey: "services", href: at("/services"), icon: Layers },
  {
    labelKey: "work",
    icon: BriefcaseBusiness,
    children: [
      { labelKey: "projects", href: at("/work/projects") },
      { labelKey: "caseStudies", href: at("/work/case-studies") },
    ],
  },
  { labelKey: "clients", href: at("/clients"), icon: Users },
  { labelKey: "partners", href: at("/partners"), icon: Handshake },
  { labelKey: "offices", href: at("/offices"), icon: MapPin },
  { labelKey: "enquiries", href: at("/enquiries"), icon: Mail },
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
 * an exact match, or else the deepest link the path sits under (so
 * "/admin/solutions/42/edit" still resolves to Solutions). Null when nothing matches.
 */
export function findNavPath(pathname: string, items: NavItem[] = mainNav): NavItem[] | null {
  let best: NavItem[] | null = null
  for (const item of items) {
    const nested = item.children && findNavPath(pathname, item.children)
    const candidate = nested ? [item, ...nested] : item.href && isPathActive(item.href, pathname) ? [item] : null
    const depth = (trail: NavItem[]) => trail.at(-1)?.href?.length ?? 0
    if (candidate && (!best || depth(candidate) > depth(best))) best = candidate
  }
  return best
}

/** Label trail for a path that exactly matches a menu link, e.g. ["work", "projects"]. */
export function findNavTrail(href: string): NavLabelKey[] | null {
  const trail = findNavPath(href)
  return trail && trail.at(-1)?.href === href ? trail.map((item) => item.labelKey) : null
}
