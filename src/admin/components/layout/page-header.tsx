import { AppBreadcrumb, type Crumb } from "./app-breadcrumb"

/**
 * Standard top of every admin page: breadcrumb, title, optional description
 * and an actions slot (e.g. an "Add" button) on the reading-end side.
 */
export function PageHeader({
  title,
  description,
  crumbs,
  actions,
}: {
  title: string
  description?: string
  /** Extra crumbs past the menu item, e.g. [{ label: "Edit album" }]. */
  crumbs?: Crumb[]
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <AppBreadcrumb extra={crumbs} />
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold">{title}</h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        {actions && <div className="flex max-w-full min-w-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
