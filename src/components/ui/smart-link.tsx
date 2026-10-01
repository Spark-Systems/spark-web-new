import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type SmartLinkProps = ComponentPropsWithoutRef<"a"> & { href: string };

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

/**
 * Routes internal paths through next/link, and renders in-page anchors and
 * external URLs as plain <a> so the ScrollController can smooth-scroll
 * hash links (next/link would intercept them first).
 */
export function SmartLink({ href, ...props }: SmartLinkProps) {
  if (href.startsWith("#")) return <a href={href} {...props} />;
  if (isExternal(href)) {
    const newTab = href.startsWith("http");
    return <a href={href} {...(newTab && { target: "_blank", rel: "noopener noreferrer" })} {...props} />;
  }
  return <Link href={href} {...props} />;
}
