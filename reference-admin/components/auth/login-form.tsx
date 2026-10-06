"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { isApiError } from "@/lib/api/errors"
import { useAuth } from "@/lib/auth/auth-provider"

// Soft filled fields: tinted background, no border until focus or error.
const fieldClass =
  "h-12 rounded-xl border-transparent bg-muted/70 dark:bg-input/30 has-[[data-slot=input-group-control]:focus-visible]:bg-background"

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const t = useTranslations("Auth")
  const tInputs = useTranslations("Inputs")
  const tCommon = useTranslations("Common")
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().trim().min(1, t("emailRequired")).pipe(z.email(t("emailInvalid"))),
        password: z.string().min(1, t("passwordRequired")),
      }),
    [t]
  )

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      await login(values)
      router.replace(callbackUrl)
    } catch (error) {
      form.setError("root", {
        message:
          isApiError(error) && (error.status === 401 || error.status === 400)
            ? t("invalidCredentials")
            : tCommon("genericError"),
      })
    }
  }

  const { isSubmitting, errors } = form.formState

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-4">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              {/* The icon and placeholder carry the label visually; screen readers still get one. */}
              <FieldLabel htmlFor="email" className="sr-only">
                {t("email")}
              </FieldLabel>
              <InputGroup className={fieldClass}>
                <InputGroupAddon className="ps-3.5">
                  <Mail />
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  id="email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  aria-invalid={fieldState.invalid}
                  // Emails are typed left-to-right; the Arabic placeholder still sits on the right.
                  className="rtl:placeholder:text-right"
                />
              </InputGroup>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password" className="sr-only">
                {t("password")}
              </FieldLabel>
              <InputGroup className={fieldClass}>
                <InputGroupAddon className="ps-3.5">
                  <LockKeyhole />
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  autoComplete="current-password"
                  placeholder={t("password")}
                  aria-invalid={fieldState.invalid}
                  className="rtl:placeholder:text-right"
                />
                <InputGroupAddon align="inline-end" className="pe-2">
                  <InputGroupButton
                    size="icon-sm"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? tInputs("hidePassword") : tInputs("showPassword")}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        {errors.root && (
          <p role="alert" className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-2 h-12 w-full rounded-xl text-base" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </FieldGroup>
    </form>
  )
}
