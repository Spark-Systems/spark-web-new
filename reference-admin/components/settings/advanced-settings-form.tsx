"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormCheckbox } from "@/components/form/form-checkbox"
import { FormCodeEditor } from "@/components/form/form-code-editor"
import { FormInput } from "@/components/form/form-input"
import { FormSaveBar } from "@/components/form/form-save-bar"
import { FormSection } from "@/components/form/form-section"
import { FormTagInput } from "@/components/form/form-tag-input"
import { QueryError } from "@/components/query-error"
import { Skeleton } from "@/components/ui/skeleton"
import { settingsApi, settingsQueries } from "@/lib/api/services/settings"
import type { AdvancedSettings, AdvancedSettingsUpdate } from "@/lib/api/types"

const MAX_ANALYTICS_EMAILS = 10

const isHttpUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

const isEmail = (value: string) => z.email().safeParse(value).success

function useAdvancedSchema() {
  const t = useTranslations("Configuration.advanced")
  return useMemo(() => {
    const optionalEmail = z
      .string()
      .trim()
      .refine((v) => v === "" || isEmail(v), t("invalidEmail"))
    return z.object({
      websiteUrl: z
        .string()
        .trim()
        .refine((v) => v === "" || isHttpUrl(v), t("invalidUrl")),
      host: z.string().trim(),
      // Kept as text in the form (inputs give strings); converted on save.
      port: z
        .string()
        .trim()
        .refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 65535, t("invalidPort")),
      emailSender: z.string().trim(),
      emailPassword: z.string(),
      useSsl: z.boolean(),
      defaultEmailAddress: optionalEmail,
      defaultEmailName: z.string().trim(),
      notificationEmail: optionalEmail,
      recaptchaSiteKey: z.string().trim(),
      recaptchaSecretKey: z.string(),
      analyticsCode: z.string(),
      analyticsEmails: z.array(z.string().refine(isEmail, t("invalidEmail"))).max(MAX_ANALYTICS_EMAILS),
      seoScripts: z.string(),
    })
  }, [t])
}

type AdvancedFormValues = z.infer<ReturnType<typeof useAdvancedSchema>>

const toForm = (s: AdvancedSettings): AdvancedFormValues => ({
  websiteUrl: s.website_url,
  host: s.smtp_host,
  port: String(s.smtp_port),
  emailSender: s.smtp_username,
  emailPassword: "", // write-only; blank keeps the stored value
  useSsl: s.smtp_use_ssl,
  defaultEmailAddress: s.default_email_address,
  defaultEmailName: s.default_email_name,
  notificationEmail: s.notification_email,
  recaptchaSiteKey: s.recaptcha_site_key,
  recaptchaSecretKey: "",
  analyticsCode: s.google_analytics_code,
  analyticsEmails: s.google_analytics_emails,
  seoScripts: s.seo_scripts,
})

const toApi = (v: AdvancedFormValues): AdvancedSettingsUpdate => ({
  website_url: v.websiteUrl,
  smtp_host: v.host,
  smtp_port: Number(v.port),
  smtp_username: v.emailSender,
  smtp_password: v.emailPassword,
  smtp_use_ssl: v.useSsl,
  default_email_address: v.defaultEmailAddress,
  default_email_name: v.defaultEmailName,
  notification_email: v.notificationEmail,
  recaptcha_site_key: v.recaptchaSiteKey,
  recaptcha_secret_key: v.recaptchaSecretKey,
  google_analytics_code: v.analyticsCode,
  google_analytics_emails: v.analyticsEmails,
  seo_scripts: v.seoScripts,
})

export function AdvancedSettingsForm() {
  const t = useTranslations("Configuration")
  const tInputs = useTranslations("Inputs")
  const queryClient = useQueryClient()
  const schema = useAdvancedSchema()
  const { data, isPending, isError, refetch } = useQuery(settingsQueries.advanced())

  const form = useForm<AdvancedFormValues>({
    resolver: zodResolver(schema),
    values: data ? toForm(data) : undefined,
  })

  const save = useMutation({
    mutationFn: (values: AdvancedFormValues) => settingsApi.updateAdvanced(toApi(values)),
    onSuccess: (saved) => {
      queryClient.setQueryData(settingsQueries.advanced().queryKey, saved)
      form.reset(toForm(saved))
      toast.success(t("saved"))
    },
    onError: () => toast.error(t("saveError")),
  })

  if (isError) return <QueryError message={t("loadError")} onRetry={() => refetch()} />
  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    )
  }

  const control = form.control
  // Secrets come back blank; say whether one is stored so blank isn't mistaken for "none".
  const secretHint = (isSet: boolean) => (isSet ? t("advanced.secretSaved") : t("advanced.secretEmpty"))

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate className="flex flex-col gap-4">
      <FormSection title={t("advanced.generalTitle")} description={t("advanced.generalDescription")}>
        <FormInput
          control={control}
          name="websiteUrl"
          label={t("advanced.websiteUrl")}
          type="url"
          inputMode="url"
          dir="ltr"
          placeholder="https://www.example.com"
          className="lg:col-span-2"
        />
      </FormSection>

      <FormSection title={t("advanced.smtpTitle")} description={t("advanced.smtpDescription")}>
        <FormInput control={control} name="host" label={t("advanced.host")} dir="ltr" placeholder="smtp.example.com" />
        <FormInput
          control={control}
          name="port"
          label={t("advanced.port")}
          type="number"
          inputMode="numeric"
          min={1}
          max={65535}
          dir="ltr"
          placeholder="587"
        />
        <FormInput
          control={control}
          name="emailSender"
          label={t("advanced.emailSender")}
          description={t("advanced.emailSenderHint")}
          dir="ltr"
          autoComplete="off"
        />
        <FormInput
          control={control}
          name="emailPassword"
          label={t("advanced.emailPassword")}
          description={secretHint(data.smtp_password_set)}
          type="password"
          autoComplete="new-password"
          placeholder={data.smtp_password_set ? "••••••••" : undefined}
        />
        <FormCheckbox
          control={control}
          name="useSsl"
          label={t("advanced.useSsl")}
          description={t("advanced.useSslHint")}
          className="lg:col-span-2"
        />
      </FormSection>

      <FormSection title={t("advanced.emailsTitle")} description={t("advanced.emailsDescription")}>
        <FormInput
          control={control}
          name="defaultEmailAddress"
          label={t("advanced.defaultEmailAddress")}
          type="email"
          dir="ltr"
          placeholder="no-reply@example.com"
        />
        <FormInput control={control} name="defaultEmailName" label={t("advanced.defaultEmailName")} />
        <FormInput
          control={control}
          name="notificationEmail"
          label={t("advanced.notificationEmail")}
          type="email"
          dir="ltr"
          placeholder="info@example.com"
        />
      </FormSection>

      <FormSection title={t("advanced.recaptchaTitle")} description={t("advanced.recaptchaDescription")}>
        <FormInput control={control} name="recaptchaSiteKey" label={t("advanced.recaptchaSiteKey")} dir="ltr" autoComplete="off" />
        <FormInput
          control={control}
          name="recaptchaSecretKey"
          label={t("advanced.recaptchaSecretKey")}
          description={secretHint(data.recaptcha_secret_set)}
          type="password"
          autoComplete="new-password"
          placeholder={data.recaptcha_secret_set ? "••••••••" : undefined}
        />
      </FormSection>

      <FormSection title={t("advanced.analyticsTitle")} description={t("advanced.analyticsDescription")}>
        <FormCodeEditor
          control={control}
          name="analyticsCode"
          label={t("advanced.analyticsCode")}
          placeholder='<script async src="https://www.googletagmanager.com/gtag/js?id=G-…"></script>'
          className="lg:col-span-2"
        />
        <FormTagInput
          control={control}
          name="analyticsEmails"
          label={t("advanced.analyticsEmails")}
          dir="ltr"
          maxTags={MAX_ANALYTICS_EMAILS}
          validate={(value) => (isEmail(value) ? null : tInputs("invalidEmail", { value }))}
          className="lg:col-span-2"
        />
      </FormSection>

      <FormSection title={t("advanced.seoTitle")} description={t("advanced.seoDescription")}>
        <FormCodeEditor
          control={control}
          name="seoScripts"
          label={t("advanced.seoScripts")}
          placeholder='<meta name="google-site-verification" content="…" />'
          className="lg:col-span-2"
        />
      </FormSection>

      <FormSaveBar
        isDirty={form.formState.isDirty}
        isSaving={save.isPending}
        onDiscard={() => data && form.reset(toForm(data))}
      />
    </form>
  )
}
