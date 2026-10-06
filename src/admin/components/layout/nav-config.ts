import {
  Activity,
  Boxes,
  BriefcaseBusiness,
  FileText,
  Handshake,
  Inbox,
  Layers,
  LayoutDashboard,
  MapPin,
  Settings,
  UserCog,
  Users,
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
// Mirrors the website: its pages, then the lists they show, then the inbox and admin tools.
export const mainNav: NavItem[] = [
  { labelKey: "dashboard", href: adminPaths.dashboard, icon: LayoutDashboard },
  {
    labelKey: "pages",
    icon: FileText,
    children: [
      { labelKey: "home", href: adminPaths.home },
      { labelKey: "about", href: adminPaths.about },
      { labelKey: "contact", href: adminPaths.contact },
      { labelKey: "layout", href: adminPaths.layout },
    ],
  },
  { labelKey: "solutions", href: adminPaths.solutions, icon: Boxes },
  { labelKey: "services", href: adminPaths.services, icon: Layers },
  { labelKey: "work", href: adminPaths.work, icon: BriefcaseBusiness },
  { labelKey: "clients", href: adminPaths.clients, icon: Users },
  { labelKey: "partners", href: adminPaths.partners, icon: Handshake },
  { labelKey: "offices", href: adminPaths.offices, icon: MapPin },
  { labelKey: "enquiries", href: adminPaths.enquiries, icon: Inbox, badge: "newEnquiries" },
  { labelKey: "activity", href: adminPaths.activity, icon: Activity },
  { labelKey: "users", href: adminPaths.users, icon: UserCog, role: "admin" },
  {
    labelKey: "settings",
    icon: Settings,
    children: [{ labelKey: "configuration", href: adminPaths.configuration }],
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
