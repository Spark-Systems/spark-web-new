"use client"

import { useTranslations } from "next-intl"
import type { UseFormReturn } from "react-hook-form"

import { CaseStudyFields, emptyCaseStudy } from "@admin/components/cms/case-study-fields"
import { CollectionEditor, EditCollectionItem } from "@admin/components/cms/collection-editor"
import { DetailTab } from "@admin/components/cms/detail-tab"
import { FormImage } from "@admin/components/cms/form-image"
import { FormInput } from "@admin/components/form/form-input"
import { FormNumberInput } from "@admin/components/form/form-number-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormTextarea } from "@admin/components/form/form-textarea"
import { projectsResource } from "@admin/lib/api/services/site-content"
import type { CollectionRow, ProjectRecord, UploadedImage } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"
import { SLUG_MAX } from "@/lib/cms/fields"
import { projectSchema } from "@/lib/cms/schemas"
import { projectPreviewPath } from "./projects-table"

const defaults = (): ProjectRecord => ({
  slug: "",
  name: "",
  category: "",
  summary: "",
  image: null as unknown as UploadedImage,
  has_detail: false,
  detail: null,
  order: 100,
})

function GeneralFields({ form }: { form: UseFormReturn<ProjectRecord> }) {
  const t = useTranslations("Projects.form")
  const tf = useTranslations("Fields")
  const { control } = form
  return (
    <FormSection title={t("detailsTitle")} description={t("detailsHint")}>
      <FormInput control={control} name="name" label={tf("name")} required maxLength={120} autoFocus />
      <FormInput control={control} name="slug" label={tf("slug")} description={t("slugHint")} required dir="ltr" maxLength={SLUG_MAX} />
      <FormInput control={control} name="category" label={t("category")} description={t("categoryHint")} required maxLength={60} />
      <FormNumberInput control={control} name="order" label={tf("order")} description={tf("orderHint")} required min={-9999} max={9999} />
      <FormTextarea control={control} name="summary" label={t("summary")} description={t("summaryHint")} required rows={2} maxLength={300} className="lg:col-span-2" />
      <FormImage control={control} name="image" label={tf("image")} description={t("imageHint")} required className="lg:col-span-2" />
    </FormSection>
  )
}

/** Create form when `row` is omitted, edit form when it's given. */
export function ProjectEditor({ row }: { row?: CollectionRow<ProjectRecord> }) {
  const t = useTranslations("Projects")
  return (
    <CollectionEditor
      resource={projectsResource}
      row={row}
      schema={projectSchema}
      defaults={defaults}
      folder="work"
      listPath={adminPaths.work}
      previewPath={projectPreviewPath}
      slug={{ from: "name", to: "slug" }}
      title={(values) => values.name}
      tabs={(form) => [
        {
          value: "general",
          label: t("tabs.general"),
          keys: ["name", "slug", "category", "order", "summary", "image"],
          content: <GeneralFields form={form} />,
        },
        {
          value: "detail",
          label: t("tabs.caseStudy"),
          keys: ["has_detail", "detail"],
          content: (
            <DetailTab
              form={form}
              label={t("form.hasDetail")}
              description={t("form.hasDetailHint")}
              emptyMessage={t("form.noDetail")}
              template={emptyCaseStudy}
            >
              <CaseStudyFields control={form.control} />
            </DetailTab>
          ),
        },
      ]}
    />
  )
}

export function EditProject({ id }: { id: string }) {
  return <EditCollectionItem resource={projectsResource} id={id}>{(row) => <ProjectEditor row={row} />}</EditCollectionItem>
}
