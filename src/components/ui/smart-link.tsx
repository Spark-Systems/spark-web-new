"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";

type SmartLinkProps = ComponentPropsWithoutRef<"a"> & { href: string };

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

/**
 * Routes internal paths through next/link, and renders in-page anchors and
 * external URLs as plain <a> so the ScrollController can smooth-scroll
 * hash links (next/link would intercept them first).
 *
 * Section links are written page-qualified ("/#work") so they work from any
 * page; on the page they point at, they collapse to a plain "#work" anchor.
 */
export function SmartLink({ href, ...props }: SmartLinkProps) {
  const pathname = usePathname();
  const hash = href.indexOf("#");
  const samePage = hash > 0 && href.slice(0, hash) === pathname;

  if (href.startsWith("#") || samePage) return <a href={samePage ? href.slice(hash) : href} {...props} />;
  if (isExternal(href)) {
    const newTab = href.startsWith("http");
    return <a href={href} {...(newTab && { target: "_blank", rel: "noopener noreferrer" })} {...props} />;
  }
  return <Link href={href} {...props} />;
}
