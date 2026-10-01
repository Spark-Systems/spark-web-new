import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

const controlClass =
  "border-0 border-b border-white/22 bg-transparent pb-3 pt-2 text-lg text-snow outline-none transition-colors focus:border-brand aria-invalid:border-brand-bright";

interface FieldProps {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

/** Label + control + error message wrapper for form controls. */
export function Field({ label, error, className, children }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-2.5 text-[13px] text-fog-500", className)}>
      {label}
      {children}
      {error && <span className="text-xs text-brand-bright">{error}</span>}
    </label>
  );
}

export function Input({ className, ...props }: ComponentPropsWithoutRef<"input">) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentPropsWithoutRef<"textarea">) {
  return <textarea className={cn(controlClass, "resize-y", className)} {...props} />;
}
