"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import { useWatch, type UseFormReturn } from "react-hook-form"

import { CollectionEditor, EditCollectionItem } from "@admin/components/cms/collection-editor"
import { FormRepeater } from "@admin/components/cms/form-repeater"
import { FormCheckbox } from "@admin/components/form/form-checkbox"
import { FormInput } from "@admin/components/form/form-input"
import { FormNumberInput } from "@admin/components/form/form-number-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormSelect } from "@admin/components/form/form-select"
import { FormTextarea } from "@admin/components/form/form-textarea"
import { officesResource } from "@admin/lib/api/services/site-content"
import type { CollectionRow, OfficeRecord } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"
import { officeSchema } from "@/lib/cms/schemas"

const defaults = (): OfficeRecord => ({
  city: "",
  country: "",
  hq: false,
  time_zone: "",
  address: "",
  map_url: "",
  lines: [],
  order: 100,
})

/** Builds a line's link from what's typed: "+20 (2) 641 7015" → "tel:+2026417015". */
function lineHref(type: string, value: string) {
  if (type === "email") return value.trim() ? `mailto:${value.trim()}` : ""
  const digits = value.replace(/[^\d+]/g, "")
  return digits ? `tel:${digits}` : ""
}

/**
 * Rebuilds a contact line's link when its type or value is edited. Stored
 * links are left alone on load (they may carry a country code the displayed
 * number omits), and the link stays editable.
 */
function LineHref({ form, path }: { form: UseFormReturn<OfficeRecord>; path: `lines.${number}` }) {
  const [type, value] = useWatch({ control: form.control, name: [`${path}.type`, `${path}.value`] })
  const previous = useRef({ type, value })
  useEffect(() => {
    if (previous.current.type === type && previous.current.value === value) return
    previous.current = { type, value }
    form.setValue(`${path}.href`, lineHref(type, value ?? ""), { shouldDirty: true, shouldValidate: form.formState.isSubmitted })
  }, [type, value, form, path])
  return null
}

function OfficeFields({ form }: { form: UseFormReturn<OfficeRecord> }) {
  const t = useTranslations("Offices.form")
  const tf = useTranslations("Fields")
  const { control } = form
  const lineTypes = (["phone", "mobile", "email"] as const).map((value) => ({ value, label: t(`lineType.${value}`) }))

  return (
    <div className="flex flex-col gap-4">
      <FormSection title={t("detailsTitle")} description={t("detailsHint")}>
        <FormInput control={control} name="city" label={t("city")} required maxLength={80} autoFocus />
        <FormInput control={control} name="country" label={t("country")} required maxLength={80} />
        <FormInput control={control} name="time_zone" label={t("timeZone")} description={t("timeZoneHint")} required dir="ltr" placeholder="Africa/Cairo" />
        <FormNumberInput control={control} name="order" label={tf("order")} description={tf("orderHint")} required min={-9999} max={9999} />
        <FormCheckbox control={control} name="hq" label={t("hq")} description={t("hqHint")} className="lg:col-span-2" />
      </FormSection>
      <FormSection title={t("locationTitle")} description={t("locationHint")}>
        <FormTextarea control={control} name="address" label={t("address")} description={t("addressHint")} required rows={2} maxLength={300} />
        <FormInput control={control} name="map_url" label={t("mapUrl")} description={t("mapUrlHint")} required type="url" dir="ltr" placeholder="https://maps.app.goo.gl/…" />
      </FormSection>
      <FormSection title={t("linesTitle")} description={t("linesHint")}>
        <FormRepeater
          control={control}
          name="lines"
          label={t("lines")}
          addLabel={t("addLine")}
          max={8}
          newItem={() => ({ type: "phone", label: "Tel", value: "", href: "" })}
          itemTitle={(item) => [item.label, item.value].filter(Boolean).join(": ")}
        >
          {(_path, index) => (
            <>
              <LineHref form={form} path={`lines.${index}`} />
              <FormSelect control={control} name={`lines.${index}.type`} label={t("lineKind")} options={lineTypes} required />
              <FormInput control={control} name={`lines.${index}.label`} label={tf("label")} description={t("lineLabelHint")} required maxLength={40} />
              <FormInput control={control} name={`lines.${index}.value`} label={t("lineValue")} required dir="ltr" maxLength={120} />
              <FormInput control={control} name={`lines.${index}.href`} label={t("lineHref")} description={t("lineHrefHint")} required dir="ltr" maxLength={200} />
            </>
          )}
        </FormRepeater>
      </FormSection>
    </div>
  )
}

/** Create form when `row` is omitted, edit form when it's given. */
export function OfficeEditor({ row }: { row?: CollectionRow<OfficeRecord> }) {
  const t = useTranslations("Offices")
  return (
    <CollectionEditor
      resource={officesResource}
      row={row}
      schema={officeSchema}
      defaults={defaults}
      folder="offices"
      listPath={adminPaths.offices}
      previewPath={() => "/contact"}
      title={(values) => values.city}
      tabs={(form) => [
        {
          value: "general",
          label: t("form.detailsTitle"),
          keys: ["city", "country", "hq", "time_zone", "address", "map_url", "lines", "order"],
          content: <OfficeFields form={form} />,
        },
      ]}
    />
  )
}

export function EditOffice({ id }: { id: string }) {
  return <EditCollectionItem resource={officesResource} id={id}>{(row) => <OfficeEditor row={row} />}</EditCollectionItem>
}
