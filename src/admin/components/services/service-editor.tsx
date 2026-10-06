"use client"

import { useTranslations } from "next-intl"
import type { UseFormReturn } from "react-hook-form"

import { CollectionEditor, EditCollectionItem } from "@admin/components/cms/collection-editor"
import { IconField } from "@admin/components/cms/content-fields"
import { DetailTab } from "@admin/components/cms/detail-tab"
import { FormImage } from "@admin/components/cms/form-image"
import { emptyOffering, OfferingFields } from "@admin/components/cms/offering-fields"
import { FormInput } from "@admin/components/form/form-input"
import { FormNumberInput } from "@admin/components/form/form-number-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormTagInput } from "@admin/components/form/form-tag-input"
import { FormTextarea } from "@admin/components/form/form-textarea"
import { siteServicesResource } from "@admin/lib/api/services/site-content"
import type { CollectionRow, ServiceRecord, UploadedImage } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"
import { SLUG_MAX } from "@/lib/cms/fields"
import { serviceSchema } from "@/lib/cms/schemas"
import { servicePreviewPath } from "./services-table"

const defaults = (): ServiceRecord => ({
  slug: "",
  name: "",
  summary: "",
  description: "",
  capabilities: [],
  icon: "sparkle",
  image: null as unknown as UploadedImage,
  has_detail: false,
  detail: null,
  order: 100,
})

function GeneralFields({ form }: { form: UseFormReturn<ServiceRecord> }) {
  const t = useTranslations("Services.form")
  const tf = useTranslations("Fields")
  const { control } = form
  return (
    <div className="flex flex-col gap-4">
      <FormSection title={t("detailsTitle")} description={t("detailsHint")}>
        <FormInput control={control} name="name" label={tf("name")} required maxLength={120} autoFocus />
        <FormInput control={control} name="slug" label={tf("slug")} description={t("slugHint")} required dir="ltr" maxLength={SLUG_MAX} />
        <FormTextarea control={control} name="summary" label={t("summary")} description={t("summaryHint")} required rows={2} maxLength={240} />
        <FormTextarea control={control} name="description" label={tf("description")} required rows={3} maxLength={800} />
        <FormTagInput control={control} name="capabilities" label={t("capabilities")} maxTags={10} maxTagLength={60} className="lg:col-span-2" />
      </FormSection>
      <FormSection title={t("displayTitle")} description={t("displayHint")}>
        <IconField control={control} name="icon" />
        <FormNumberInput control={control} name="order" label={tf("order")} description={tf("orderHint")} required min={-9999} max={9999} />
        <FormImage control={control} name="image" label={tf("image")} description={t("imageHint")} required className="lg:col-span-2" />
      </FormSection>
    </div>
  )
}

/** Create form when `row` is omitted, edit form when it's given. */
export function ServiceEditor({ row }: { row?: CollectionRow<ServiceRecord> }) {
  const t = useTranslations("Services")
  return (
    <CollectionEditor
      resource={siteServicesResource}
      row={row}
      schema={serviceSchema}
      defaults={defaults}
      folder="services"
      listPath={adminPaths.services}
      previewPath={servicePreviewPath}
      slug={{ from: "name", to: "slug" }}
      title={(values) => values.name}
      tabs={(form) => [
        {
          value: "general",
          label: t("tabs.general"),
          keys: ["name", "slug", "summary", "description", "capabilities", "icon", "order", "image"],
          content: <GeneralFields form={form} />,
        },
        {
          value: "detail",
          label: t("tabs.detail"),
          keys: ["has_detail", "detail"],
          content: (
            <DetailTab
              form={form}
              label={t("form.hasDetail")}
              description={t("form.hasDetailHint")}
              emptyMessage={t("form.noDetail")}
              template={emptyOffering}
            >
              <OfferingFields control={form.control} />
            </DetailTab>
          ),
        },
      ]}
    />
  )
}

export function EditService({ id }: { id: string }) {
  return <EditCollectionItem resource={siteServicesResource} id={id}>{(row) => <ServiceEditor row={row} />}</EditCollectionItem>
}
