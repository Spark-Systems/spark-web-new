"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormCheckbox } from "@/components/form/form-checkbox"
import { FormDropzone } from "@/components/form/form-dropzone"
import { FormInput } from "@/components/form/form-input"
import { FormLinkTarget } from "@/components/form/form-link-target"
import { FormRichText } from "@/components/form/form-rich-text"
import { FormSaveBar } from "@/components/form/form-save-bar"
import { FormSection } from "@/components/form/form-section"
import type { DropzoneItem } from "@/components/inputs/file-dropzone"
import { QueryError } from "@/components/query-error"
import { Skeleton } from "@/components/ui/skeleton"
import { isApiError } from "@/lib/api/errors"
import { homeApi, homeQueries } from "@/lib/api/services/home"
import { uploadsApi } from "@/lib/api/services/uploads"
import type { WelcomeMessage } from "@/lib/api/types"
import { isLinkTarget, isValidLink } from "@/lib/links"

const NAME_MAX = 150
const PICTURE_MAX_BYTES = 2 * 1024 * 1024

/** Images added inside the content are uploaded right away; the returned URL goes in the HTML. */
const uploadContentImage = async (file: File) => (await uploadsApi.upload(file, "home/welcome")).url

function useWelcomeSchema() {
  const t = useTranslations("WelcomeMessage.validation")
  return useMemo(() => {
    const name = z
      .string()
      .trim()
      .min(1, t("required"))
      .max(NAME_MAX, t("maxLength", { max: NAME_MAX }))
    // The editor reports an empty document as "", so whitespace-only HTML is the only other empty case.
    const content = z.string().refine((v): boolean => v.trim() !== "", t("required"))
    return z.object({
      nameEn: name,
      nameAr: name,
      contentEn: content,
      contentAr: content,
      picture: z.array(z.custom<DropzoneItem>()).min(1, t("pictureRequired")).max(1),
      link: z
        .string()
        .trim()
        .refine((v): boolean => isValidLink(v), t("invalidLink")),
      // Explicit boolean: a type-guard predicate would narrow the output type.
      linkTarget: z.string().refine((v): boolean => isLinkTarget(v)),
      hidden: z.boolean(),
    })
  }, [t])
}

type WelcomeFormValues = z.infer<ReturnType<typeof useWelcomeSchema>>

const toForm = (welcome: WelcomeMessage): WelcomeFormValues => ({
  nameEn: welcome.name_en,
  nameAr: welcome.name_ar,
  contentEn: welcome.content_en,
  contentAr: welcome.content_ar,
  picture: welcome.image_url ? [{ id: "welcome-picture", url: welcome.image_url, name: welcome.name_en, type: "image/*" }] : [],
  link: welcome.link,
  linkTarget: welcome.link_target,
  hidden: welcome.hidden,
})

/** Uploads a newly picked picture, then builds the API payload. */
async function toApi(values: WelcomeFormValues): Promise<WelcomeMessage> {
  const item = values.picture[0]
  return {
    name_en: values.nameEn,
    name_ar: values.nameAr,
    content_en: values.contentEn,
    content_ar: values.contentAr,
    image_url: item.file ? (await uploadsApi.upload(item.file, "home/welcome")).url : item.url,
    link: values.link,
    link_target: isLinkTarget(values.linkTarget) ? values.linkTarget : "_self",
    hidden: values.hidden,
  }
}

const emptyForm: WelcomeFormValues = {
  nameEn: "",
  nameAr: "",
  contentEn: "",
  contentAr: "",
  picture: [],
  link: "",
  linkTarget: "_self",
  hidden: false,
}

/** The home page's welcome block: one record, edited in place. */
export function WelcomeMessageForm() {
  const t = useTranslations("WelcomeMessage")
  const queryClient = useQueryClient()
  const schema = useWelcomeSchema()
  const { data, isPending, isError, refetch } = useQuery(homeQueries.welcome())

  const form = useForm<WelcomeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyForm,
    // Re-syncs the form whenever fresh data arrives from the server.
    values: data ? toForm(data) : undefined,
  })

  const save = useMutation({
    mutationFn: async (values: WelcomeFormValues) => homeApi.updateWelcome(await toApi(values)),
    onSuccess: (saved) => {
      queryClient.setQueryData(homeQueries.welcome().queryKey, saved)
      form.reset(toForm(saved))
      toast.success(t("saved"))
    },
    onError: (error) => {
      toast.error(isApiError(error) && error.status === 422 ? error.message : t("saveError"))
    },
  })

  if (isError) return <QueryError message={t("loadError")} onRetry={() => refetch()} />
  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  const { isDirty } = form.formState
  const control = form.control

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate className="flex flex-col gap-4">
      <FormSection title={t("form.titleSection")} description={t("form.titleDescription")}>
        <FormInput control={control} name="nameEn" label={t("form.nameEn")} required dir="ltr" maxLength={NAME_MAX} />
        <FormInput control={control} name="nameAr" label={t("form.nameAr")} required dir="rtl" maxLength={NAME_MAX} />
      </FormSection>

      <FormSection title={t("form.contentTitle")} description={t("form.contentDescription")}>
        <FormRichText
          control={control}
          name="contentEn"
          label={t("form.contentEn")}
          required
          dir="ltr"
          sourceEditing
          colors
          headings
          fontSizes
          embeds
          onImageUpload={uploadContentImage}
          imageMaxSize={PICTURE_MAX_BYTES}
          className="lg:col-span-2"
        />
        <FormRichText
          control={control}
          name="contentAr"
          label={t("form.contentAr")}
          required
          dir="rtl"
          sourceEditing
          colors
          headings
          fontSizes
          embeds
          onImageUpload={uploadContentImage}
          imageMaxSize={PICTURE_MAX_BYTES}
          className="lg:col-span-2"
        />
      </FormSection>

      <FormSection title={t("form.pictureTitle")} description={t("form.pictureDescription")}>
        <FormDropzone
          control={control}
          name="picture"
          label={t("form.picture")}
          formats={["jpeg", "jpg", "png"]}
          maxSize={PICTURE_MAX_BYTES}
          required
          className="lg:col-span-2"
        />
      </FormSection>

      <FormSection title={t("form.linkTitle")} description={t("form.linkDescription")}>
        <FormInput control={control} name="link" label={t("form.link")} dir="ltr" placeholder="https:// or /page" />
        <FormLinkTarget control={control} name="linkTarget" />
        <FormCheckbox
          control={control}
          name="hidden"
          label={t("form.hidden")}
          description={t("form.hiddenHint")}
          className="lg:col-span-2"
        />
      </FormSection>

      <FormSaveBar
        isDirty={isDirty}
        isSaving={save.isPending}
        onDiscard={() => form.reset(data ? toForm(data) : emptyForm)}
      />
    </form>
  )
}
