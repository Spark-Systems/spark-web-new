import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { SmartLink } from "./smart-link";

/**
 * The rounded outline button used across the site.
 *
 * - `brand`:   brand border on dark backgrounds
 * - `onLight`: brand border on light backgrounds
 * - `inverse`: light border on brand-coloured backgrounds
 * - `glass`:   non-interactive badge floating over imagery
 */
const variants = {
  brand: "border-brand text-snow hover:bg-brand hover:text-white",
  onLight: "border-brand text-ink hover:bg-brand hover:text-white",
  inverse: "border-snow text-snow hover:bg-snow hover:text-brand",
  glass: "border-brand bg-ink/70 text-snow backdrop-blur-sm",
} as const;

export type PillVariant = keyof typeof variants;

export function pillClassName(variant: PillVariant = "brand", className?: string) {
  return cn(
    "inline-flex h-[42px] items-center gap-2 whitespace-nowrap rounded-full border px-5 text-sm font-medium transition-colors duration-200",
    variants[variant],
    className,
  );
}

type PillLinkProps = ComponentPropsWithoutRef<"a"> & { href: string; variant?: PillVariant };

export function PillLink({ variant, className, ...props }: PillLinkProps) {
  return <SmartLink className={pillClassName(variant, className)} {...props} />;
}

type PillButtonProps = ComponentPropsWithoutRef<"button"> & { variant?: PillVariant };

export function PillButton({ variant, className, type = "button", ...props }: PillButtonProps) {
  return <button type={type} className={cn(pillClassName(variant), "bg-transparent", className)} {...props} />;
}
