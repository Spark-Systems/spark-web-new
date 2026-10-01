"use client";

import { useActionState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { Field, Input, Textarea } from "@/components/ui/text-field";
import { pillClassName } from "@/components/ui/pill";
import { cn } from "@/lib/utils";
import { submitContact } from "./actions";
import type { ContactFormState } from "./validation";

const initialState: ContactFormState = { status: "idle" };

export function ContactForm({ submitLabel }: { submitLabel: string }) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const { errors, values } = state;

  return (
    <Reveal as="form" delay={120} action={formAction} noValidate className="flex flex-col gap-7">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-7">
        <Field label="Name" error={errors?.name}>
          <Input name="name" type="text" autoComplete="name" defaultValue={values?.name} aria-invalid={!!errors?.name} />
        </Field>
        <Field label="Company">
          <Input name="company" type="text" autoComplete="organization" defaultValue={values?.company} />
        </Field>
      </div>
      <Field label="Email" error={errors?.email}>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={values?.email}
          aria-invalid={!!errors?.email}
        />
      </Field>
      <Field label="Message" error={errors?.message}>
        <Textarea name="message" rows={4} defaultValue={values?.message} aria-invalid={!!errors?.message} />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className={cn(
          pillClassName("brand"),
          "mt-2 h-auto min-h-[42px] self-start whitespace-normal bg-transparent py-2 text-left leading-[1.3] disabled:opacity-60",
        )}
      >
        {pending ? "Sending…" : submitLabel}
      </button>

      <p aria-live="polite" className="text-sm text-fog-400 empty:hidden">
        {state.status === "success" ? state.message : ""}
      </p>
    </Reveal>
  );
}
