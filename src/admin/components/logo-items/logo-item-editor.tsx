"use client"

import { useTranslations } from "next-intl"

import { CollectionEditor, EditCollectionItem } from "@admin/components/cms/collection-editor"
import { FormImage } from "@admin/components/cms/form-image"
import { FormCheckbox } from "@admin/components/form/form-checkbox"
import { FormInput } from "@admin/components/form/form-input"
import { FormNumberInput } from "@admin/components/form/form-number-input"
import { FormSection } from "@admin/components/form/form-section"
import type { Resource } from "@admin/lib/api/resource"
import type { CollectionRow, LogoRecord, UploadedImage } from "@admin/lib/api/types"
import { logoSchema } from "@/lib/cms/schemas"
import { logoItemsConfigs, useLogoItemsT, type LogoItemsKind } from "./config"

const defaults = (): LogoRecord => ({
  name: "",
  logo: null as unknown as UploadedImage,
  link: "",
  show_name: false,
  invert: false,
  order: 100,
})

/** Create form when `row` is omitted, edit form when it's given. */
export function LogoItemEditor({ kind, row }: { kind: LogoItemsKind; row?: CollectionRow<LogoRecord> }) {
  const config = logoItemsConfigs[kind]
  const t = useLogoItemsT(config)
  const tf = useTranslations("Fields")

  return (
    <CollectionEditor
      resource={config.resource as Resource<"clients">}
      row={row}
      schema={logoSchema}
      defaults={defaults}
      folder={config.uploadFolder}
      listPath={config.path}
      previewPath={() => (kind === "clients" ? "/about" : "/")}
      title={(values) => values.name}
      tabs={({ control }) => [
        {
          value: "general",
          label: t("form.detailsTitle"),
          keys: ["name", "logo", "link", "show_name", "invert", "order"],
          content: (
            <FormSection title={t("form.detailsTitle")} description={t("form.detailsHint")}>
              <FormInput control={control} name="name" label={tf("name")} required maxLength={160} autoFocus />
              <FormInput
                control={control}
                name="link"
                label={t("form.link")}
                description={t("form.linkHint")}
                type="url"
                dir="ltr"
                placeholder="https://"
                maxLength={500}
              />
              <FormImage control={control} name="logo" label={t("form.logo")} description={t("form.logoHint")} required svg className="lg:col-span-2" />
              <div className="flex flex-col gap-4 lg:col-span-2 lg:flex-row lg:gap-8">
                <FormCheckbox control={control} name="invert" label={t("form.invert")} description={t("form.invertHint")} />
                {config.showNameOption && (
                  <FormCheckbox control={control} name="show_name" label={t("form.showName")} description={t("form.showNameHint")} />
                )}
              </div>
              <FormNumberInput control={control} name="order" label={tf("order")} description={tf("orderHint")} required min={-9999} max={9999} />
            </FormSection>
          ),
        },
      ]}
    />
  )
}

export function EditLogoItem({ kind, id }: { kind: LogoItemsKind; id: string }) {
  const config = logoItemsConfigs[kind]
  return (
    <EditCollectionItem resource={config.resource as Resource<"clients">} id={id}>
      {(row) => <LogoItemEditor kind={kind} row={row} />}
    </EditCollectionItem>
  )
}
