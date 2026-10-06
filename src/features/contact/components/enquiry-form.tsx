"use client";

import { useActionState, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { EnquiryFormCopy, FormPrompt } from "@/types/contact";
import { submitContact } from "../actions";
import { Honeypot } from "./honeypot";
import type { ContactField, ContactFormState } from "../validation";

const initialState: ContactFormState = { status: "idle" };

/**
 * The contact page's enquiry form, written as sentences ("Hi Spark, my name
 * is ___"). Submits through the same server action and validation as the
 * standard contact form. After a successful send it shows a thank-you with a
 * link to start over (which remounts a fresh form).
 */
export function EnquiryForm({ copy }: { copy: EnquiryFormCopy }) {
  const [round, setRound] = useState(0);
  return <EnquiryFormRound key={round} copy={copy} onReset={() => setRound((r) => r + 1)} />;
}

function EnquiryFormRound({ copy, onReset }: { copy: EnquiryFormCopy; onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const { errors, values } = state;

  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-4 border-t border-white/12 pt-[clamp(14px,2vh,22px)]">
        <p aria-live="polite" className="m-0 text-[clamp(26px,3cqw,44px)] font-medium leading-[1.3] tracking-[-0.025em]">
          {copy.successMessage}
        </p>
        <button type="button" onClick={onReset} className="self-start text-[15px] font-medium text-brand-bright hover:text-snow">
          {copy.resetLabel}
        </button>
      </div>
    );
  }

  const field = (name: ContactField, prompt: FormPrompt, control: (props: ControlProps) => ReactNode, first = false) => (
    <label
      className={cn(
        "flex flex-col gap-1.5 border-b border-white/12 py-[clamp(14px,2vh,22px)] transition-colors focus-within:border-brand",
        first && "border-t",
      )}
    >
      <span className="text-[15px] font-medium tracking-normal text-fog-600">{prompt.prompt}</span>
      {control({
        name,
        placeholder: prompt.placeholder,
        defaultValue: values?.[name],
        "aria-invalid": !!errors?.[name],
        className:
          "w-full min-w-0 border-0 bg-transparent p-0 font-[inherit] tracking-[inherit] text-snow outline-none placeholder:text-fog-700",
      })}
      {errors?.[name] && <span className="text-sm font-normal tracking-normal text-brand-bright">{errors[name]}</span>}
    </label>
  );

  return (
    <form
      action={formAction}
      noValidate
      className="relative flex flex-col text-[clamp(22px,2.2cqw,34px)] font-medium leading-[1.35] tracking-[-0.02em] text-snow"
    >
      <Honeypot />
      {field("name", copy.name, (p) => <input type="text" autoComplete="name" {...p} />, true)}
      {field("company", copy.company, (p) => <input type="text" autoComplete="organization" {...p} />)}
      {field("email", copy.email, (p) => <input type="email" autoComplete="email" {...p} />)}
      {field("message", copy.message, (p) => <textarea rows={3} {...p} className={cn(p.className, "resize-none")} />)}

      <button
        type="submit"
        disabled={pending}
        className="mt-[clamp(28px,4vh,44px)] flex min-h-[52px] items-center gap-2.5 self-start rounded-full bg-brand px-7 py-3.5 text-left text-base font-semibold leading-[1.3] tracking-normal text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
      >
        {pending ? "Sending…" : copy.submitLabel}
        <Icon name="arrow-right" />
      </button>
      {state.message && (
        <p aria-live="polite" className="m-0 mt-4 text-sm font-normal tracking-normal text-brand-bright">
          {state.message}
        </p>
      )}
    </form>
  );
}

interface ControlProps {
  name: ContactField;
  placeholder: string;
  defaultValue?: string;
  "aria-invalid": boolean;
  className: string;
}
