import { FloatingNav } from "@/components/layout/floating-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/**
 * Chrome shared by all marketing pages. The wrapper is the size container
 * for the `cqw`-based fluid type, and the parent the floating nav sticks in.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="@container relative overflow-clip bg-ink text-snow">
      <SiteHeader />
      {/* <FloatingNav /> */}
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
