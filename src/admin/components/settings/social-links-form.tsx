"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import type { IconType } from "react-icons"
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormDropzone } from "@admin/components/form/form-dropzone"
import { FormInput } from "@admin/components/form/form-input"
import { FormSaveBar } from "@admin/components/form/form-save-bar"
import type { DropzoneItem } from "@admin/components/inputs/file-dropzone"
import { QueryError } from "@admin/components/query-error"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@admin/components/ui/card"
import { Skeleton } from "@admin/components/ui/skeleton"
import { settingsApi, settingsQueries } from "@admin/lib/api/services/settings"
import { uploadsApi } from "@admin/lib/api/services/uploads"
import { socialPlatforms, type SocialLinks, type SocialPlatform } from "@admin/lib/api/types"
import { cn } from "@admin/lib/utils"

const ICON_MAX_BYTES = 200 * 1024

// Brand logos (react-icons, Font Awesome 6) in each brand's color. X is black
// in its brand guide, so it follows the text color to stay visible in dark mode.
const platformIcons: Record<SocialPlatform, { icon: IconType; className: string }> = {
  facebook: { icon: FaFacebookF, className: "text-[#1877F2]" },
  instagram: { icon: FaInstagram, className: "text-[#E4405F]" },
  x: { icon: FaXTwitter, className: "text-foreground" },
  linkedin: { icon: FaLinkedinIn, className: "text-[#0A66C2]" },
  youtube: { icon: FaYoutube, className: "text-[#FF0000]" },
}

const placeholders: Record<SocialPlatform, string> = {
  facebook: "https://www.facebook.com/…",
  instagram: "https://www.instagram.com/…",
  x: "https://x.com/…",
  linkedin: "https://www.linkedin.com/company/…",
  youtube: "https://www.youtube.com/@…",
}

const isHttpUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function useSocialSchema() {
  const t = useTranslations("Configuration.social")
  return useMemo(() => {
    const link = z.object({
      url: z
        .string()
        .trim()
        .refine((value) => value === "" || isHttpUrl(value), t("invalidUrl")),
      icon: z.array(z.custom<DropzoneItem>()).max(1),
    })
    return z.object(Object.fromEntries(socialPlatforms.map((p) => [p, link])) as Record<SocialPlatform, typeof link>)
  }, [t])
}

type SocialFormValues = z.infer<ReturnType<typeof useSocialSchema>>

const toForm = (links: SocialLinks): SocialFormValues =>
  Object.fromEntries(
    socialPlatforms.map((platform) => {
      const { url, icon_url } = links[platform]
      const icon: DropzoneItem[] = icon_url
        ? [{ id: `${platform}-icon`, url: icon_url, name: `${platform}.svg`, type: "image/svg+xml" }]
        : []
      return [platform, { url, icon }]
    })
  ) as SocialFormValues

/** Uploads any newly picked icons, then returns the payload with stored URLs. */
async function toApi(values: SocialFormValues): Promise<SocialLinks> {
  const entries = await Promise.all(
    socialPlatforms.map(async (platform) => {
      const { url, icon } = values[platform]
      const item = icon[0]
      const iconUrl = item?.file ? (await uploadsApi.upload(item.file, "social")).url : (item?.url ?? null)
      return [platform, { url, icon_url: iconUrl }] as const
    })
  )
  return Object.fromEntries(entries) as SocialLinks
}

export function SocialLinksForm() {
  const t = useTranslations("Configuration")
  const queryClient = useQueryClient()
  const schema = useSocialSchema()
  const { data, isPending, isError, refetch } = useQuery(settingsQueries.social())

  const form = useForm<SocialFormValues>({
    resolver: zodResolver(schema),
    values: data ? toForm(data) : undefined,
  })

  const save = useMutation({
    mutationFn: async (values: SocialFormValues) => settingsApi.updateSocial(await toApi(values)),
    onSuccess: (saved) => {
      queryClient.setQueryData(settingsQueries.social().queryKey, saved)
      form.reset(toForm(saved))
      toast.success(t("saved"))
    },
    onError: () => toast.error(t("saveError")),
  })

  if (isError) return <QueryError message={t("loadError")} onRetry={() => refetch()} />
  if (isPending) return <Skeleton className="h-[640px] rounded-xl" />

  const control = form.control

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("social.title")}</CardTitle>
          <CardDescription>{t("social.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {socialPlatforms.map((platform) => {
            const { icon: Icon, className: iconColor } = platformIcons[platform]
            return (
              <section
                key={platform}
                aria-labelledby={`social-${platform}`}
                className="flex flex-col gap-4 rounded-lg border p-4"
              >
                <h3 id={`social-${platform}`} className="font-heading flex items-center gap-2.5 text-sm font-semibold">
                  <span className="bg-muted flex size-8 items-center justify-center rounded-lg">
                    <Icon aria-hidden className={cn("size-4", iconColor)} />
                  </span>
                  {t(`social.platforms.${platform}`)}
                </h3>
                <FormInput
                  control={control}
                  name={`${platform}.url`}
                  label={t("social.link")}
                  type="url"
                  inputMode="url"
                  dir="ltr"
                  placeholder={placeholders[platform]}
                />
                <FormDropzone
                  control={control}
                  name={`${platform}.icon`}
                  label={t("social.icon")}
                  formats={["svg"]}
                  maxSize={ICON_MAX_BYTES}
                />
              </section>
            )
          })}
        </CardContent>
      </Card>

      <FormSaveBar
        isDirty={form.formState.isDirty}
        isSaving={save.isPending}
        onDiscard={() => data && form.reset(toForm(data))}
      />
    </form>
  )
}
