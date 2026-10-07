"use client";

import { useActionState, useState } from "react";
import { Field, Input, Textarea } from "@/components/ui/text-field";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { Honeypot } from "@/features/contact/components/honeypot";
import { cn } from "@/lib/utils";
import type { ApplyContent } from "@/types/careers";
import { submitApplication, type ApplicationFormState } from "../actions";

const initialState: ApplicationFormState = { status: "idle" };

const selectClass =
  "cursor-pointer border-0 border-b border-white/22 bg-transparent pb-3 pt-2 text-lg text-snow outline-none transition-colors focus:border-brand [&>option]:bg-ink";

type ApplySectionProps = ApplyContent & {
  /** Role titles for the position list. */
  roles: string[];
  position: string;
  onPositionChange: (position: string) => void;
};

/** "Join us" form: details, position, CV (PDF or Word, up to 4 MB) and cover letter. */
export function ApplySection({ eyebrow, title, lead, countries, submitLabel, successMessage, roles, position, onPositionChange }: ApplySectionProps) {
  const [state, formAction, pending] = useActionState(submitApplication, initialState);
  const [cvName, setCvName] = useState("");
  const errors = state.errors;

  return (
    <section id="apply" className="bg-texture px-gutter py-[clamp(96px,11cqw,176px)] text-snow [color-scheme:dark]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(48px,7cqw,128px)]">
        <Reveal className="flex flex-col gap-6">
          <Eyebrow className="text-brand-bright">{eyebrow}</Eyebrow>
          <h2 className="m-0 max-w-[10ch] text-balance text-[clamp(40px,5cqw,80px)] font-medium leading-[1.02] tracking-[-0.04em]">
            {title}
          </h2>
          <p className="m-0 max-w-[32ch] text-[clamp(17px,1.4cqw,20px)] leading-normal text-fog-400">{lead}</p>
        </Reveal>

        {state.status === "success" ? (
          <Reveal className="flex flex-col gap-4 border-t border-white/12 pt-6">
            <p aria-live="polite" className="m-0 text-[clamp(22px,2.2cqw,32px)] font-medium leading-[1.3] tracking-[-0.02em]">
              {successMessage}
            </p>
          </Reveal>
        ) : (
          <Reveal as="form" delay={120} action={formAction} noValidate className="relative flex flex-col gap-7">
            <Honeypot />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-7">
              <Field label="Full name" error={errors?.name}>
                <Input name="name" type="text" autoComplete="name" required aria-invalid={!!errors?.name} />
              </Field>
              <Field label="Email" error={errors?.email}>
                <Input name="email" type="email" autoComplete="email" required aria-invalid={!!errors?.email} />
              </Field>
              <Field label="Mobile number" error={errors?.mobile}>
                <Input name="mobile" type="tel" autoComplete="tel" required aria-invalid={!!errors?.mobile} />
              </Field>
              <Field label="Country" error={errors?.country}>
                <select name="country" defaultValue={countries[0] ?? ""} className={selectClass}>
                  {countries.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Position" error={errors?.position}>
              <select name="position" value={position} onChange={(e) => onPositionChange(e.target.value)} className={selectClass}>
                <option value="">Select position</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>

            <div className="flex flex-col gap-2">
              <label
                className={cn(
                  "relative flex cursor-pointer items-center gap-4 rounded-[14px] border border-dashed border-white/28 p-[22px] text-[15px] text-fog-400 transition-colors hover:border-brand hover:bg-brand/8 focus-within:border-brand",
                  errors?.cv && "border-brand-bright",
                )}
              >
                <Icon name="arrow-up-right" size={26} className="-rotate-45 text-brand" />
                <span className="flex flex-col gap-1">
                  <span className="font-medium text-snow">{cvName || "Upload CV"}</span>
                  <span className="text-[13px] text-fog-600">PDF or Word, up to 4 MB. Drag a file here or click to browse.</span>
                </span>
                <input
                  type="file"
                  name="cv"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setCvName(e.target.files?.[0]?.name ?? "")}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
              {errors?.cv && <span className="text-xs text-brand-bright">{errors.cv}</span>}
            </div>

            <Field label="Cover letter" error={errors?.cover_letter}>
              <Textarea name="cover_letter" rows={4} />
            </Field>

            <button
              type="submit"
              disabled={pending}
              className="mt-2 flex min-h-[42px] items-center gap-2 self-start rounded-full border border-brand bg-transparent px-5 text-sm font-medium text-snow transition-colors hover:bg-brand hover:text-white disabled:opacity-60"
            >
              {pending ? "Sending…" : submitLabel}
              <Icon name="arrow-right" size={16} />
            </button>
            {state.message && (
              <p aria-live="polite" className="m-0 text-sm text-brand-bright">
                {state.message}
              </p>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
