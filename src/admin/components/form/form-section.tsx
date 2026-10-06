import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@admin/components/ui/card"
import { cn } from "@admin/lib/utils"

/**
 * Card that groups related form fields under a title. Fields flow into two
 * columns on wide screens; give a field `lg:col-span-2` to span both.
 */
export function FormSection({
  title,
  description,
  className,
  children,
}: {
  title: string
  description?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn("grid gap-6 lg:grid-cols-2")}>{children}</CardContent>
    </Card>
  )
}
