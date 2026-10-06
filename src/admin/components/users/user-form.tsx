"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { applyApiErrors } from "@admin/components/cms/editor-shell"
import { FormActionBar } from "@admin/components/form/form-action-bar"
import { FormInput } from "@admin/components/form/form-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormSelect } from "@admin/components/form/form-select"
import { QueryError } from "@admin/components/query-error"
import { Button } from "@admin/components/ui/button"
import { Skeleton } from "@admin/components/ui/skeleton"
import { usersApi, usersQueries } from "@admin/lib/api/services/records"
import type { User, UserInput } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"
import { PASSWORD_MIN, userCreateSchema, userUpdateSchema } from "@/lib/cms/schemas"

/** Create form when `user` is omitted, edit form when it's given. */
export function UserForm({ user }: { user?: User }) {
  const t = useTranslations("Users")
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEdit = Boolean(user)

  const form = useForm<UserInput>({
    resolver: zodResolver(isEdit ? userUpdateSchema : userCreateSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "", role: user?.role ?? "editor", password: "" },
  })

  const save = useMutation({
    mutationFn: (values: UserInput) => (user ? usersApi.update(user.id, values) : usersApi.create(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueries.all })
      toast.success(isEdit ? t("updated") : t("created"))
      router.push(adminPaths.users)
    },
    onError: (error) => {
      if (!applyApiErrors(form, error)) toast.error(t("saveError"))
    },
  })

  const roles = (["admin", "editor", "viewer"] as const).map((value) => ({ value, label: t(`roles.${value}`) }))
  const { control } = form

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate className="flex flex-col gap-4">
      <FormSection title={t("form.detailsTitle")} description={t("form.detailsHint")}>
        <FormInput control={control} name="name" label={t("form.name")} required maxLength={120} autoFocus />
        <FormInput control={control} name="email" label={t("form.email")} required type="email" dir="ltr" autoComplete="off" />
        <FormSelect control={control} name="role" label={t("form.role")} description={t("form.roleHint")} options={roles} required />
        <FormInput
          control={control}
          name="password"
          type="password"
          label={isEdit ? t("form.newPassword") : t("form.password")}
          description={isEdit ? t("form.newPasswordHint", { min: PASSWORD_MIN }) : t("form.passwordHint", { min: PASSWORD_MIN })}
          required={!isEdit}
          autoComplete="new-password"
          dir="ltr"
        />
      </FormSection>
      <FormActionBar status={form.formState.isDirty && t("form.unsaved")}>
        <Button variant="ghost" nativeButton={false} render={<Link href={adminPaths.users} />}>
          {t("form.cancel")}
        </Button>
        <Button type="submit" disabled={save.isPending || (isEdit && !form.formState.isDirty)}>
          {save.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />}
          {isEdit ? t("form.save") : t("form.create")}
        </Button>
      </FormActionBar>
    </form>
  )
}

export function EditUser({ id }: { id: string }) {
  const t = useTranslations("Users")
  const { data, isPending, isError, refetch } = useQuery(usersQueries.detail(id))
  if (isPending) return <Skeleton className="h-[320px] rounded-xl" />
  if (isError) return <QueryError message={t("loadError")} onRetry={() => refetch()} />
  return <UserForm user={data} />
}
