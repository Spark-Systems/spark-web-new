import {
  Boxes,
  BriefcaseBusiness,
  Globe,
  House,
  Info,
  Layers,
  LayoutDashboard,
  Mail,
  type LucideIcon,
} from "lucide-react"
import type { Messages } from "next-intl"

import type { UserRole } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"

/** Key under the `Nav` namespace in messages/*.json. */
export type NavLabelKey = Exclude<keyof Messages["Nav"], "main" | "toggleSidebar" | "breadcrumb">

/** Live counts a menu item can show as a pill (see useNavBadge). */
export type NavBadge = "newEnquiries"

export interface NavItem {
  labelKey: NavLabelKey
  /** Leaf links have an href; parents have children instead. */
  href?: string
  /** Shown on top-level items only. */
  icon?: LucideIcon
  /** Live count shown as a red pill, e.g. unread enquiries. */
  badge?: NavBadge
  /** Hidden from users below this role. */
  role?: UserRole
  children?: NavItem[]
}

// The sidebar renders this tree in order; nesting can go as deep as needed.
// Organised like the website: one group per page with everything shown on it,
// then the site-wide parts and admin tools.
export const mainNav: NavItem[] = [
  { labelKey: "dashboard", href: adminPaths.dashboard, icon: LayoutDashboard },
  {
    labelKey: "home",
    icon: House,
    children: [
      { labelKey: "pageSections", href: adminPaths.home },
      { labelKey: "clients", href: adminPaths.clients },
      { labelKey: "partners", href: adminPaths.partners },
    ],
  },
  { labelKey: "about", href: adminPaths.about, icon: Info },
  {
    labelKey: "solutions",
    icon: Boxes,
    children: [
      { labelKey: "allSolutions", href: adminPaths.solutions },
      { labelKey: "pageText", href: adminPaths.solutionsPage },
    ],
  },
  {
    labelKey: "services",
    icon: Layers,
    children: [
      { labelKey: "allServices", href: adminPaths.services },
      { labelKey: "pageText", href: adminPaths.servicesPage },
    ],
  },
  {
    labelKey: "work",
    icon: BriefcaseBusiness,
    children: [
      { labelKey: "projects", href: adminPaths.work },
      { labelKey: "pageText", href: adminPaths.workPage },
    ],
  },
  {
    labelKey: "contact",
    icon: Mail,
    badge: "newEnquiries",
    children: [
      { labelKey: "pageText", href: adminPaths.contact },
      { labelKey: "offices", href: adminPaths.offices },
      { labelKey: "enquiries", href: adminPaths.enquiries, badge: "newEnquiries" },
    ],
  },
  {
    labelKey: "site",
    icon: Globe,
    children: [
      { labelKey: "layout", href: adminPaths.layout },
      { labelKey: "configuration", href: adminPaths.configuration },
      { labelKey: "users", href: adminPaths.users, role: "admin" },
      { labelKey: "activity", href: adminPaths.activity },
    ],
  },
]

const RANK: Record<UserRole, number> = { viewer: 0, editor: 1, admin: 2 }

/** The menu as `role` sees it (items needing a higher role removed). */
export function navFor(role: UserRole | undefined, items: NavItem[] = mainNav): NavItem[] {
  return items
    .filter((item) => !item.role || (role !== undefined && RANK[role] >= RANK[item.role]))
    .map((item) => (item.children ? { ...item, children: navFor(role, item.children) } : item))
}

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
