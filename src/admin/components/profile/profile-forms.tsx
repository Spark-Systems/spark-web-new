"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { applyApiErrors } from "@admin/components/cms/editor-shell"
import { FormInput } from "@admin/components/form/form-input"
import { FormSection } from "@admin/components/form/form-section"
import { Button } from "@admin/components/ui/button"
import { isApiError } from "@admin/lib/api/errors"
import { authApi, authQueries } from "@admin/lib/api/services/auth"
import { useAuth } from "@admin/lib/auth/auth-provider"
import { tokenStorage } from "@admin/lib/auth/token-storage"
import { PASSWORD_MIN, passwordChangeSchema, profileSchema } from "@/lib/cms/schemas"

function ProfileForm() {
  const t = useTranslations("Profile")
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const form = useForm<z.input<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  })

  const save = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(authQueries.me().queryKey, updated)
      form.reset({ name: updated.name, email: updated.email })
      toast.success(t("profileSaved"))
    },
    onError: (error) => {
      if (!applyApiErrors(form, error)) toast.error(t("saveError"))
    },
  })

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate>
      <FormSection title={t("profileTitle")} description={t("profileHint")}>
        <FormInput control={form.control} name="name" label={t("name")} required maxLength={120} />
        <FormInput control={form.control} name="email" label={t("email")} required type="email" dir="ltr" />
        <div className="lg:col-span-2">
          <Button type="submit" disabled={save.isPending || !form.formState.isDirty}>
            {save.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />}
            {t("saveProfile")}
          </Button>
        </div>
      </FormSection>
    </form>
  )
}

const passwordFormSchema = (mismatch: string) =>
  passwordChangeSchema
    .extend({ confirm: z.string() })
    .refine((v) => v.confirm === v.new_password, { path: ["confirm"], message: mismatch })

type PasswordValues = z.input<ReturnType<typeof passwordFormSchema>>

function PasswordForm() {
  const t = useTranslations("Profile")
  const schema = useMemo(() => passwordFormSchema(t("mismatch")), [t])
  const form = useForm<PasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: "", new_password: "", confirm: "" },
  })

  const save = useMutation({
    mutationFn: ({ current_password, new_password }: PasswordValues) =>
      authApi.changePassword({ current_password, new_password }),
    onSuccess: (tokens) => {
      // Other sessions are signed out; this one continues with the new tokens.
      tokenStorage.setTokens(tokens)
      form.reset()
      toast.success(t("passwordChanged"))
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 403) {
        form.setError("current_password", { message: t("wrongPassword") }, { shouldFocus: true })
      } else if (!applyApiErrors(form, error)) {
        toast.error(t("saveError"))
      }
    },
  })

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate>
      <FormSection title={t("passwordTitle")} description={t("passwordHint")}>
        <FormInput control={form.control} name="current_password" type="password" label={t("currentPassword")} required autoComplete="current-password" dir="ltr" className="lg:col-span-2" />
        <FormInput
          control={form.control}
          name="new_password"
          type="password"
          label={t("newPassword")}
          description={t("newPasswordHint", { min: PASSWORD_MIN })}
          required
          autoComplete="new-password"
          dir="ltr"
        />
        <FormInput control={form.control} name="confirm" type="password" label={t("confirmPassword")} required autoComplete="new-password" dir="ltr" />
        <div className="lg:col-span-2">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />}
            {t("changePassword")}
          </Button>
        </div>
      </FormSection>
    </form>
  )
}

/** Your own account: name, email and password. */
export function ProfileForms() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <div className="flex flex-col gap-4">
      <ProfileForm />
      <PasswordForm />
    </div>
  )
}
