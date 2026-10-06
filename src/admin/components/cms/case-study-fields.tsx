"use client"

import { useTranslations } from "next-intl"
import type { Control, FieldValues } from "react-hook-form"

import { FormCheckbox } from "@admin/components/form/form-checkbox"
import { FormInput } from "@admin/components/form/form-input"
import { FormNumberInput } from "@admin/components/form/form-number-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormSelect } from "@admin/components/form/form-select"
import { FormTextarea } from "@admin/components/form/form-textarea"
import type { CaseStudyContent } from "@admin/lib/api/types"
import { HeroFields, ImageAssetFields, IntroFields, LinkFields, SeoFields, StatFields, looseControl } from "./content-fields"
import { FormRepeater } from "./form-repeater"
import { OptionalGroup } from "./optional-group"

/** A blank case study, used when a project first gets one. */
export const emptyCaseStudy = (name = ""): CaseStudyContent => ({
  seo: { title: name, description: "" },
  hero: { eyebrow: "Case study", titleLines: [name], image: { src: "", alt: "" } },
  facts: [{ label: "Client", value: "" }],
  statement: "",
  showcase: { src: "", alt: "" },
  story: [
    { title: "Challenge", body: "" },
    { title: "Approach", body: "" },
    { title: "Outcome", body: "" },
  ],
  features: { eyebrow: "Key features", title: "", items: [] },
  gallery: { title: "", items: [] },
  devices: { eyebrow: "Across devices", title: "", items: [] },
  results: { eyebrow: "Results", headline: { value: 0, suffix: "", label: "" }, figures: [] },
})

const blankImage = () => ({ src: null, alt: "" })

/** Fields of a case study (/work/[slug]). */
export function CaseStudyFields<T extends FieldValues>({
  control: typedControl,
  name = "detail",
}: {
  control: Control<T>
  name?: string
}) {
  const control = looseControl(typedControl)
  const t = useTranslations("CaseStudy")
  const tf = useTranslations("Fields")
  const p = (field: string) => `${name}.${field}`
  const devices = (["web", "mobile", "tablet", "pos"] as const).map((value) => ({ value, label: t(`device.${value}`) }))

  return (
    <div className="flex flex-col gap-4">
      <SeoFields control={control} name={p("seo")} />
      <HeroFields control={control} name={p("hero")} />

      <FormSection title={t("overviewTitle")} description={t("overviewHint")}>
        <FormRepeater
          control={control}
          name={p("facts")}
          label={t("facts")}
          description={t("factsHint")}
          addLabel={t("addFact")}
          max={8}
          newItem={() => ({ label: "", value: "" })}
          itemTitle={(item) => [item.label, item.value].filter(Boolean).join(": ")}
        >
          {(path) => (
            <>
              <FormInput control={control} name={`${path}.label`} label={tf("label")} required maxLength={60} />
              <FormInput control={control} name={`${path}.value`} label={t("factValue")} required maxLength={160} />
            </>
          )}
        </FormRepeater>
        <FormTextarea control={control} name={p("statement")} label={t("statement")} description={t("statementHint")} required rows={3} maxLength={600} className="lg:col-span-2" />
        <ImageAssetFields control={control} name={p("showcase")} label={t("showcase")} />
        <FormRepeater
          control={control}
          name={p("story")}
          label={t("story")}
          description={t("storyHint")}
          addLabel={t("addStory")}
          max={6}
          newItem={() => ({ title: "", body: "" })}
          itemTitle={(item) => String(item.title ?? "")}
        >
          {(path) => (
            <>
              <FormInput control={control} name={`${path}.title`} label={tf("title")} required maxLength={120} className="lg:col-span-2" />
              <FormTextarea control={control} name={`${path}.body`} label={tf("body")} required rows={3} maxLength={1200} className="lg:col-span-2" />
            </>
          )}
        </FormRepeater>
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
          newItem={() => ({ title: "", body: "", image: blankImage() })}
          itemTitle={(item) => String(item.title ?? "")}
        >
          {(path) => (
            <>
              <FormInput control={control} name={`${path}.title`} label={tf("title")} required maxLength={120} className="lg:col-span-2" />
              <FormTextarea control={control} name={`${path}.body`} label={tf("body")} required rows={2} maxLength={600} className="lg:col-span-2" />
              <ImageAssetFields control={control} name={`${path}.image`} label={t("screen")} />
            </>
          )}
        </FormRepeater>
      </FormSection>

      <FormSection title={t("galleryTitle")} description={t("galleryHint")}>
        <FormInput control={control} name={p("gallery.title")} label={tf("title")} required maxLength={200} className="lg:col-span-2" />
        <FormRepeater
          control={control}
          name={p("gallery.items")}
          label={t("gallery")}
          addLabel={t("addPicture")}
          min={1}
          max={20}
          newItem={() => ({ caption: "", image: blankImage() })}
          itemTitle={(item) => String(item.caption ?? "")}
        >
          {(path) => (
            <>
              <ImageAssetFields control={control} name={`${path}.image`} label={tf("image")} />
              <FormInput control={control} name={`${path}.caption`} label={t("caption")} maxLength={200} className="lg:col-span-2" />
            </>
          )}
        </FormRepeater>
      </FormSection>

      <FormSection title={t("devicesTitle")} description={t("devicesHint")}>
        <IntroFields control={control} name={p("devices")} />
        <FormRepeater
          control={control}
          name={p("devices.items")}
          label={t("devices")}
          addLabel={t("addDevice")}
          min={1}
          max={8}
          newItem={() => ({ kind: "web", label: "", image: blankImage() })}
          itemTitle={(item) => String(item.label ?? "")}
        >
          {(path) => (
            <>
              <FormSelect control={control} name={`${path}.kind`} label={t("deviceKind")} options={devices} required />
              <FormInput control={control} name={`${path}.label`} label={tf("label")} required maxLength={60} />
              <ImageAssetFields control={control} name={`${path}.image`} label={t("screen")} />
            </>
          )}
        </FormRepeater>
      </FormSection>

      <FormSection title={t("comparisonTitle")} description={t("comparisonHint")}>
        <OptionalGroup
          control={control}
          name={p("comparison")}
          label={t("showComparison")}
          template={() => ({ eyebrow: "Before / after", title: "", hint: "Drag to compare", before: blankImage(), after: blankImage() })}
        >
          <IntroFields control={control} name={p("comparison")} />
          <FormInput control={control} name={p("comparison.hint")} label={t("comparisonDragHint")} required maxLength={80} />
          <ImageAssetFields control={control} name={p("comparison.before")} label={t("before")} className="flex flex-col gap-4" />
          <ImageAssetFields control={control} name={p("comparison.after")} label={t("after")} className="flex flex-col gap-4" />
        </OptionalGroup>
      </FormSection>

      <FormSection title={t("resultsTitle")} description={t("resultsHint")}>
        <FormInput control={control} name={p("results.eyebrow")} label={tf("eyebrow")} required maxLength={80} className="lg:col-span-2" />
        <div className="grid gap-6 lg:col-span-2 lg:grid-cols-2">
          <p className="text-sm font-medium lg:col-span-2">{t("headline")}</p>
          <StatFields control={control} name={p("results.headline")} />
        </div>
        <OptionalGroup
          control={control}
          name={p("results.builtOn")}
          label={t("showBuiltOn")}
          description={t("builtOnHint")}
          template={() => ({ eyebrow: "Built on", label: "", href: "/solutions" })}
        >
          <FormInput control={control} name={p("results.builtOn.eyebrow")} label={tf("eyebrow")} required maxLength={80} className="lg:col-span-2" />
          <LinkFields control={control} name={p("results.builtOn")} />
        </OptionalGroup>
        <FormRepeater
          control={control}
          name={p("results.figures")}
          label={t("figures")}
          description={t("figuresHint")}
          addLabel={t("addFigure")}
          max={8}
          newItem={() => ({ label: "", value: null, suffix: "" })}
          itemTitle={(item) => String(item.label ?? "")}
        >
          {(path) => (
            <>
              <FormNumberInput control={control} name={`${path}.value`} label={tf("statValue")} allowDecimals />
              <FormInput control={control} name={`${path}.suffix`} label={tf("statSuffix")} maxLength={12} />
              <FormInput control={control} name={`${path}.label`} label={tf("statLabel")} required maxLength={160} className="lg:col-span-2" />
            </>
          )}
        </FormRepeater>
      </FormSection>

      <FormSection title={t("testimonialTitle")} description={t("testimonialHint")}>
        <OptionalGroup
          control={control}
          name={p("testimonial")}
          label={t("showTestimonial")}
          template={() => ({ eyebrow: "Client words", quote: "", author: "", role: "", placeholder: false })}
        >
          <FormInput control={control} name={p("testimonial.eyebrow")} label={tf("eyebrow")} required maxLength={80} />
          <FormTextarea control={control} name={p("testimonial.quote")} label={tf("quote")} required rows={3} maxLength={1000} className="lg:col-span-2" />
          <FormInput control={control} name={p("testimonial.author")} label={tf("author")} required maxLength={120} />
          <FormInput control={control} name={p("testimonial.role")} label={tf("role")} required maxLength={160} />
          <FormCheckbox control={control} name={p("testimonial.placeholder")} label={t("placeholder")} description={t("placeholderHint")} />
        </OptionalGroup>
      </FormSection>
    </div>
  )
}
