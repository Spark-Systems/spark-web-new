"use client"

import { useTranslations } from "next-intl"
import type { Control, FieldValues } from "react-hook-form"

import { FormInput } from "@admin/components/form/form-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormTagInput } from "@admin/components/form/form-tag-input"
import { FormTextarea } from "@admin/components/form/form-textarea"
import type { OfferingContent } from "@admin/lib/api/types"
import { HeroFields, IconField, ImageAssetFields, IntroFields, ProcessStepsField, SeoFields, StatFields, looseControl } from "./content-fields"
import { FormRepeater } from "./form-repeater"
import { OptionalGroup } from "./optional-group"

/** A blank detail page, used when a solution or service first gets one. */
export const emptyOffering = (name = ""): OfferingContent => ({
  seo: { title: name, description: "" },
  hero: { eyebrow: name, titleLines: [""], image: { src: "", alt: "" } },
  overview: { tags: [], statement: "" },
  features: { eyebrow: "What it does", title: "", items: [] },
  process: { eyebrow: "How it works", title: "", steps: [] },
  inUse: { eyebrow: "In use", title: "", cases: [] },
})

/**
 * Fields of a solution or service detail page (/solutions/[slug],
 * /services/[slug]): SEO, hero, overview, features, process and "in use".
 */
export function OfferingFields<T extends FieldValues>({
  control: typedControl,
  name = "detail",
}: {
  control: Control<T>
  name?: string
}) {
  const control = looseControl(typedControl)
  const t = useTranslations("Offering")
  const tf = useTranslations("Fields")
  const p = (field: string) => `${name}.${field}`

  return (
    <div className="flex flex-col gap-4">
      <SeoFields control={control} name={p("seo")} />
      <HeroFields control={control} name={p("hero")} />

      <FormSection title={t("overviewTitle")} description={t("overviewHint")}>
        <FormTextarea control={control} name={p("overview.statement")} label={t("statement")} description={t("statementHint")} required rows={3} maxLength={600} className="lg:col-span-2" />
        <FormTagInput control={control} name={p("overview.tags")} label={t("tags")} maxTags={10} maxTagLength={60} className="lg:col-span-2" />
      </FormSection>

      <FormSection title={t("featuresTitle")} description={t("featuresHint")}>
        <IntroFields control={control} name={p("features")} />
        <FormRepeater
          control={control}
          name={p("features.items")}
          label={t("features")}
          addLabel={t("addFeature")}
          min={1}
          max={12}
          newItem={() => ({ icon: "sparkle", title: "", body: "", image: { src: null, alt: "" } })}
          itemTitle={(item) => String(item.title ?? "")}
        >
          {(path) => (
            <>
              <IconField control={control} name={`${path}.icon`} />
              <FormInput control={control} name={`${path}.title`} label={tf("title")} required maxLength={120} />
              <FormTextarea control={control} name={`${path}.body`} label={tf("body")} required rows={2} maxLength={600} className="lg:col-span-2" />
              <ImageAssetFields control={control} name={`${path}.image`} label={tf("image")} />
            </>
          )}
        </FormRepeater>
      </FormSection>

      <FormSection title={t("processTitle")} description={t("processHint")}>
        <IntroFields control={control} name={p("process")} />
        <ProcessStepsField control={control} name={p("process.steps")} />
      </FormSection>

      <FormSection title={t("inUseTitle")} description={t("inUseHint")}>
        <IntroFields control={control} name={p("inUse")} />
        <OptionalGroup
          control={control}
          name={p("inUse.stat")}
          label={t("showStat")}
          description={t("showStatHint")}
          template={() => ({ value: 0, suffix: "", label: "" })}
        >
          <StatFields control={control} name={p("inUse.stat")} />
        </OptionalGroup>
        <FormRepeater
          control={control}
          name={p("inUse.cases")}
          label={t("cases")}
          description={t("casesHint")}
          addLabel={t("addCase")}
          max={12}
          newItem={() => ({ name: "", href: "/work", image: { src: null, alt: "" } })}
          itemTitle={(item) => String(item.name ?? "")}
        >
          {(path) => (
            <>
              <FormInput control={control} name={`${path}.name`} label={tf("name")} required maxLength={120} />
              <FormInput control={control} name={`${path}.href`} label={tf("linkHref")} description={tf("linkHrefHint")} required dir="ltr" maxLength={500} />
              <ImageAssetFields control={control} name={`${path}.image`} label={tf("image")} />
            </>
          )}
        </FormRepeater>
      </FormSection>
    </div>
  )
}
