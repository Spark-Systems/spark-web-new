import { cookies } from "next/headers"
import { getLocale } from "next-intl/server"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getDirection } from "@/i18n/config"

// Routes in this group are protected by proxy.ts.
export default async function AdminLayout({ children }: LayoutProps<"/">) {
  const dir = getDirection(await getLocale())
  // Written by SidebarProvider so the collapsed/expanded state survives reloads.
  const sidebarOpen = (await cookies()).get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider
      defaultOpen={sidebarOpen}
      // A wider icon rail leaves room for the collapse button on the sidebar's edge.
      style={{ "--sidebar-width-icon": "4rem" } as React.CSSProperties}
    >
      <AppSidebar dir={dir} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
