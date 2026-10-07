"use client"

import { useTranslations } from "next-intl"

import { CollectionEditor, EditCollectionItem } from "@admin/components/cms/collection-editor"
import { looseControl } from "@admin/components/cms/content-fields"
import { FormRepeater } from "@admin/components/cms/form-repeater"
import { FormStringList } from "@admin/components/cms/form-string-list"
import { FormInput } from "@admin/components/form/form-input"
import { FormNumberInput } from "@admin/components/form/form-number-input"
import { FormSection } from "@admin/components/form/form-section"
import { jobsResource } from "@admin/lib/api/services/site-content"
import type { CollectionRow, JobRecord } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"
import { jobSchema } from "@/lib/cms/schemas"

const defaults = (): JobRecord => ({
  title: "",
  location: "",
  groups: [
    { heading: "Requirements", items: [""] },
    { heading: "Responsibilities", items: [""] },
  ],
  order: 100,
})

/** Create form when `row` is omitted, edit form when it's given. */
export function JobEditor({ row }: { row?: CollectionRow<JobRecord> }) {
  const t = useTranslations("Jobs")
  const tf = useTranslations("Fields")
  return (
    <CollectionEditor
      resource={jobsResource}
      row={row}
      schema={jobSchema}
      defaults={defaults}
      folder="careers"
      listPath={adminPaths.careers}
      previewPath={() => "/careers"}
      title={(values) => values.title}
      tabs={(form) => {
        const control = looseControl(form.control)
        return [
          {
            value: "general",
            label: t("form.detailsTitle"),
            keys: ["title", "location", "groups", "order"],
            content: (
              <div className="flex flex-col gap-4">
                <FormSection title={t("form.detailsTitle")} description={t("form.detailsHint")}>
                  <FormInput control={control} name="title" label={t("form.title")} required maxLength={120} autoFocus />
                  <FormInput control={control} name="location" label={t("form.location")} description={t("form.locationHint")} required maxLength={120} />
                  <FormNumberInput control={control} name="order" label={tf("order")} description={tf("orderHint")} required min={-9999} max={9999} />
                </FormSection>
                <FormSection title={t("form.groupsTitle")} description={t("form.groupsHint")}>
                  <FormRepeater
                    control={control}
                    name="groups"
                    label={t("form.groups")}
                    addLabel={t("form.addGroup")}
                    min={1}
                    max={6}
                    newItem={() => ({ heading: "", items: [""] })}
                    itemTitle={(item) => String(item.heading ?? "")}
                  >
                    {(path) => (
                      <>
                        <FormInput control={control} name={`${path}.heading`} label={t("form.groupHeading")} description={t("form.groupHeadingHint")} required maxLength={80} className="lg:col-span-2" />
                        <FormStringList
                          control={control}
                          name={`${path}.items`}
                          label={t("form.points")}
                          addLabel={t("form.addPoint")}
                          required
                          min={1}
                          max={20}
                          maxLength={400}
                          className="lg:col-span-2"
                        />
                      </>
                    )}
                  </FormRepeater>
                </FormSection>
              </div>
            ),
          },
        ]
      }}
    />
  )
}

export function EditJob({ id }: { id: string }) {
  return <EditCollectionItem resource={jobsResource} id={id}>{(row) => <JobEditor row={row} />}</EditCollectionItem>
}
