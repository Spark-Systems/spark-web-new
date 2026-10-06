"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@admin/lib/utils"

/**
 * Link tabs between the screens of one section, e.g. Solutions: the list and
 * the page copy around it. Styled like SegmentedTabs.
 */
export function SectionNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname()
  // The longest matching href wins, so "/admin/solutions/page" beats "/admin/solutions".
  const active = items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  return (
    <nav className="bg-card inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border p-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.href === active ? "page" : undefined}
          className={cn(
            "text-muted-foreground hover:text-foreground rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
            item.href === active && "bg-accent text-accent-foreground hover:text-accent-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
