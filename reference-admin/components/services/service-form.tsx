"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormActionBar } from "@/components/form/form-action-bar";
import { FormCheckbox } from "@/components/form/form-checkbox";
import { FormDropzone } from "@/components/form/form-dropzone";
import { FormInput } from "@/components/form/form-input";
import { FormNumberInput } from "@/components/form/form-number-input";
import { FormRichText } from "@/components/form/form-rich-text";
import { FormSection } from "@/components/form/form-section";
import { FormTextarea } from "@/components/form/form-textarea";
import type { DropzoneItem } from "@/components/inputs/file-dropzone";
import { Button } from "@/components/ui/button";
import {
  siteServicesApi,
  siteServicesQueries,
} from "@/lib/api/services/site-services";
import { uploadsApi } from "@/lib/api/services/uploads";
import type { Service, ServiceInput } from "@/lib/api/types";

export const SERVICES_PATH = "/services";
const NAME_MAX = 150;
const SUMMARY_MAX = 500;
const ICON_MAX_BYTES = 200 * 1024;
const PICTURE_MAX_BYTES = 2 * 1024 * 1024;
/** Order given to new services. */
const DEFAULT_ORDER = -10;

/** Images added inside the content are uploaded right away; the returned URL goes in the HTML. */
const uploadContentImage = async (file: File) =>
  (await uploadsApi.upload(file, "services/content")).url;

function useServiceSchema() {
  const t = useTranslations("Services.validation");
  return useMemo(() => {
    const name = z
      .string()
      .trim()
      .min(1, t("required"))
      .max(NAME_MAX, t("maxLength", { max: NAME_MAX }));
    const summary = z
      .string()
      .trim()
      .min(1, t("required"))
      .max(SUMMARY_MAX, t("maxLength", { max: SUMMARY_MAX }));
    // The editor reports an empty document as "", so whitespace-only HTML is the only other empty case.
    const content = z
      .string()
      .refine((v): boolean => v.trim() !== "", t("required"));
    return z.object({
      nameEn: name,
      nameAr: name,
      summaryEn: summary,
      summaryAr: summary,
      contentEn: content,
      contentAr: content,
      icon: z.array(z.custom<DropzoneItem>()).min(1, t("iconRequired")).max(1),
      picture: z
        .array(z.custom<DropzoneItem>())
        .min(1, t("pictureRequired"))
        .max(1),
      showInHome: z.boolean(),
      // Explicit boolean return: a type-guard predicate would narrow the output to
      // `number` and no longer match the form's `number | null` values.
      order: z
        .number({ error: t("required") })
        .int(t("integer"))
        .nullable()
        .refine((v): boolean => v !== null, t("required")),
      hidden: z.boolean(),
    });
  }, [t]);
}

type ServiceFormValues = z.infer<ReturnType<typeof useServiceSchema>>;

const stored = (
  id: string,
  url: string,
  name: string,
  type: string,
): DropzoneItem[] => (url ? [{ id, url, name, type }] : []);

const toForm = (service?: Service): ServiceFormValues => ({
  nameEn: service?.name_en ?? "",
  nameAr: service?.name_ar ?? "",
  summaryEn: service?.summary_en ?? "",
  summaryAr: service?.summary_ar ?? "",
  contentEn: service?.content_en ?? "",
  contentAr: service?.content_ar ?? "",
  icon: service
    ? stored(
        `${service.id}-icon`,
        service.icon_url,
        `${service.name_en}.svg`,
        "image/svg+xml",
      )
    : [],
  picture: service
    ? stored(
        `${service.id}-picture`,
        service.image_url,
        service.name_en,
        "image/*",
      )
    : [],
  showInHome: service?.show_in_home ?? false,
  order: service?.order ?? DEFAULT_ORDER,
  hidden: service?.hidden ?? false,
});

const uploadIfNew = async (item: DropzoneItem, folder: string) =>
  item.file ? (await uploadsApi.upload(item.file, folder)).url : item.url;

/** Uploads newly picked files, then builds the API payload. */
async function toApi(values: ServiceFormValues): Promise<ServiceInput> {
  const [iconUrl, imageUrl] = await Promise.all([
    uploadIfNew(values.icon[0], "services/icons"),
    uploadIfNew(values.picture[0], "services"),
  ]);
  return {
    name_en: values.nameEn,
    name_ar: values.nameAr,
    summary_en: values.summaryEn,
    summary_ar: values.summaryAr,
    content_en: values.contentEn,
    content_ar: values.contentAr,
    icon_url: iconUrl,
    image_url: imageUrl,
    show_in_home: values.showInHome,
    order: values.order ?? DEFAULT_ORDER,
    hidden: values.hidden,
  };
}

/** Create form when `service` is omitted, edit form when it's given. */
export function ServiceForm({ service }: { service?: Service }) {
  const t = useTranslations("Services");
  const router = useRouter();
  const queryClient = useQueryClient();
  const schema = useServiceSchema();
  const isEdit = Boolean(service);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toForm(service),
  });
  const { isDirty } = form.formState;

  const save = useMutation({
    mutationFn: async (values: ServiceFormValues) => {
      const input = await toApi(values);
      return service
        ? siteServicesApi.update(service.id, input)
        : siteServicesApi.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteServicesQueries.all });
      toast.success(isEdit ? t("updated") : t("created"));
      router.push(SERVICES_PATH);
    },
    onError: () => toast.error(t("saveError")),
  });

  const control = form.control;

  return (
    <form
      onSubmit={form.handleSubmit((values) => save.mutate(values))}
      noValidate
      className="flex flex-col gap-4"
    >
      <FormSection
        title={t("form.detailsTitle")}
        description={t("form.detailsDescription")}
      >
        <FormInput
          control={control}
          name="nameEn"
          label={t("form.nameEn")}
          required
          dir="ltr"
          maxLength={NAME_MAX}
          autoFocus
        />
        <FormInput
          control={control}
          name="nameAr"
          label={t("form.nameAr")}
          required
          dir="rtl"
          maxLength={NAME_MAX}
        />
        <FormTextarea
          control={control}
          name="summaryEn"
          label={t("form.summaryEn")}
          required
          dir="ltr"
          maxLength={SUMMARY_MAX}
        />
        <FormTextarea
          control={control}
          name="summaryAr"
          label={t("form.summaryAr")}
          required
          dir="rtl"
          maxLength={SUMMARY_MAX}
        />
      </FormSection>

      <FormSection
        title={t("form.contentTitle")}
        description={t("form.contentDescription")}
      >
        {(["contentEn", "contentAr"] as const).map((name) => (
          <FormRichText
            key={name}
            control={control}
            name={name}
            label={t(`form.${name}`)}
            required
            dir={name === "contentEn" ? "ltr" : "rtl"}
            sourceEditing
            colors
            headings
            fontSizes
            embeds
            onImageUpload={uploadContentImage}
            imageMaxSize={PICTURE_MAX_BYTES}
            className="lg:col-span-2"
          />
        ))}
      </FormSection>

      <FormSection
        title={t("form.mediaTitle")}
        description={t("form.mediaDescription")}
      >
        <FormDropzone
          control={control}
          name="icon"
          label={t("form.icon")}
          // description={t("form.iconHint")}
          formats={["svg"]}
          maxSize={ICON_MAX_BYTES}
          required
        />
        <FormDropzone
          control={control}
          name="picture"
          label={t("form.picture")}
          formats={["jpeg", "jpg", "png"]}
          maxSize={PICTURE_MAX_BYTES}
          required
        />
      </FormSection>

      <FormSection
        title={t("form.displayTitle")}
        description={t("form.displayDescription")}
      >
        {/* Order stays narrow; the checkbox sits right beside it, lined up with its input. */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8 lg:col-span-2">
          <FormNumberInput
            control={control}
            name="order"
            label={t("form.order")}
            description={t("form.orderHint")}
            required
            min={-9999}
            max={9999}
            className="w-full sm:max-w-[200px]"
          />
          <div className="flex flex-col gap-4 sm:pt-8.5">
            <FormCheckbox
              control={control}
              name="showInHome"
              label={t("form.showInHome")}
              description={t("form.showInHomeHint")}
            />
            <FormCheckbox
              control={control}
              name="hidden"
              label={t("form.hidden")}
              description={t("form.hiddenHint")}
            />
          </div>
        </div>
      </FormSection>

      <FormActionBar status={isDirty && t("form.unsaved")}>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href={SERVICES_PATH} />}
        >
          {t("form.cancel")}
        </Button>
        <Button type="submit" disabled={save.isPending || (isEdit && !isDirty)}>
          {save.isPending && (
            <Loader2 className="animate-spin" data-icon="inline-start" />
          )}
          {isEdit
            ? save.isPending
              ? t("form.saving")
              : t("form.save")
            : save.isPending
              ? t("form.creating")
              : t("form.create")}
        </Button>
      </FormActionBar>
    </form>
  );
}
