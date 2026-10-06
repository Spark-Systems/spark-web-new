"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { useWatch, type UseFormReturn } from "react-hook-form"

import { HeroFields, IconField, ImageAssetFields, IntroFields, looseControl, SeoFields, StatsField } from "@admin/components/cms/content-fields"
import { FormRepeater } from "@admin/components/cms/form-repeater"
import { PageEditor } from "@admin/components/cms/page-editor"
import { FormCheckbox } from "@admin/components/form/form-checkbox"
import { FormInput } from "@admin/components/form/form-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormSelect } from "@admin/components/form/form-select"
import { FormTextarea } from "@admin/components/form/form-textarea"
import type { PageContentMap } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"

type Form = UseFormReturn<PageContentMap["about"]>

/** A step is either a statement or a list of values; switching kind gives the new one its field. */
function StepKindSync({ form, index }: { form: Form; index: number }) {
  const kind = useWatch({ control: form.control, name: `mvv.steps.${index}.kind` })
  useEffect(() => {
    const step = form.getValues(`mvv.steps.${index}`) as Record<string, unknown>
    if (kind === "statement" && typeof step.text !== "string") form.setValue(`mvv.steps.${index}` as never, { ...step, text: "" } as never)
    if (kind === "values" && !Array.isArray(step.values)) form.setValue(`mvv.steps.${index}` as never, { ...step, values: [] } as never)
  }, [kind, form, index])
  return null
}

function MvvTab({ form }: { form: Form }) {
  const t = useTranslations("AboutEditor")
  const tf = useTranslations("Fields")
  const control = looseControl(form.control)
  const steps = useWatch({ control, name: "mvv.steps" }) ?? []
  const kinds = [
    { value: "statement", label: t("kindStatement") },
    { value: "values", label: t("kindValues") },
  ]
  return (
    <FormSection title={t("mvvTitle")} description={t("mvvHint")}>
      <FormInput control={control} name="mvv.title" label={tf("title")} required maxLength={200} className="lg:col-span-2" />
      <FormRepeater
        control={control}
        name="mvv.steps"
        label={t("steps")}
        addLabel={t("addStep")}
        min={1}
        max={5}
        newItem={() => ({ id: "", kind: "statement", label: "", eyebrow: "", text: "", image: { src: null, alt: "" } })}
        itemTitle={(item) => String(item.label ?? "")}
      >
        {(path, index) => (
          <>
            <StepKindSync form={form} index={index} />
            <FormInput control={control} name={`${path}.label`} label={tf("label")} description={t("stepLabelHint")} required maxLength={40} />
            <FormInput control={control} name={`${path}.eyebrow`} label={tf("eyebrow")} required maxLength={80} />
            <FormInput control={control} name={`${path}.id`} label={t("stepKey")} description={t("stepKeyHint")} required dir="ltr" maxLength={40} />
            <FormSelect control={control} name={`${path}.kind`} label={t("kind")} options={kinds} required />
            {steps[index]?.kind === "values" ? (
              <FormRepeater
                control={control}
                name={`mvv.steps.${index}.values` as "mvv.steps"}
                label={t("values")}
                addLabel={t("addValue")}
                min={1}
                max={6}
                newItem={() => ({ title: "", body: "" })}
                itemTitle={(item) => String(item.title ?? "")}
              >
                {(valuePath) => (
                  <>
                    <FormInput control={control} name={`${valuePath}.title`} label={tf("title")} required maxLength={80} />
                    <FormTextarea control={control} name={`${valuePath}.body`} label={tf("body")} required rows={2} maxLength={300} />
                  </>
                )}
              </FormRepeater>
            ) : (
              <FormTextarea control={control} name={`${path}.text`} label={t("statement")} required rows={2} maxLength={400} className="lg:col-span-2" />
            )}
            <ImageAssetFields control={control} name={`${path}.image`} label={tf("image")} />
          </>
        )}
      </FormRepeater>
    </FormSection>
  )
}

function StoryTab({ form }: { form: Form }) {
  const control = looseControl(form.control)
  const t = useTranslations("AboutEditor")
  const tf = useTranslations("Fields")
  return (
    <FormSection title={t("storyTitle")} description={t("storyHint")}>
      <IntroFields control={control} name="story" />
      <FormRepeater
        control={control}
        name="story.milestones"
        label={t("milestones")}
        addLabel={t("addMilestone")}
        min={1}
        max={20}
        newItem={() => ({ year: "", tbc: false, icon: "flag", title: "", body: "" })}
        itemTitle={(item) => [item.year, item.title].filter(Boolean).join(" · ")}
      >
        {(path) => (
          <>
            <FormInput control={control} name={`${path}.year`} label={t("year")} required maxLength={10} />
            <IconField control={control} name={`${path}.icon`} />
            <FormInput control={control} name={`${path}.title`} label={tf("title")} required maxLength={120} className="lg:col-span-2" />
            <FormTextarea control={control} name={`${path}.body`} label={tf("body")} required rows={2} maxLength={500} className="lg:col-span-2" />
            <FormCheckbox control={control} name={`${path}.tbc`} label={t("yearTbc")} description={t("yearTbcHint")} className="lg:col-span-2" />
          </>
        )}
      </FormRepeater>
    </FormSection>
  )
}

function ClientsTab({ form }: { form: Form }) {
  const control = looseControl(form.control)
  const t = useTranslations("AboutEditor")
  return (
    <div className="flex flex-col gap-4">
      <FormSection title={t("clientsTitle")} description={t("clientsHint")}>
        <IntroFields control={control} name="clients" />
        <p className="text-muted-foreground text-sm lg:col-span-2">
          {t.rich("clientsNote", { link: (chunks) => <Link className="text-primary underline" href={adminPaths.clients}>{chunks}</Link> })}
        </p>
      </FormSection>
      <FormSection title={t("partnershipsTitle")} description={t("partnershipsHint")}>
        <IntroFields control={control} name="partnerships" />
        <FormInput control={control} name="partnerships.label" label={t("partnerCaption")} description={t("partnerCaptionHint")} required maxLength={40} />
        <p className="text-muted-foreground text-sm lg:col-span-2">
          {t.rich("partnersNote", { link: (chunks) => <Link className="text-primary underline" href={adminPaths.partners}>{chunks}</Link> })}
        </p>
      </FormSection>
    </div>
  )
}

export function AboutEditor() {
  const t = useTranslations("AboutEditor")
  return (
    <PageEditor
      page="about"
      previewPath="/about"
      tabs={(form) => [
        {
          value: "top",
          label: t("tabs.top"),
          keys: ["seo", "hero"],
          content: (
            <div className="flex flex-col gap-4">
              <SeoFields control={looseControl(form.control)} name="seo" />
              <HeroFields control={looseControl(form.control)} name="hero" />
            </div>
          ),
        },
        {
          value: "intro",
          label: t("tabs.intro"),
          keys: ["intro"],
          content: (
            <FormSection title={t("introTitle")} description={t("introHint")}>
              <FormTextarea control={looseControl(form.control)} name="intro.statement" label={t("statement")} description={t("statementHint")} required rows={3} maxLength={600} className="lg:col-span-2" />
              <StatsField control={looseControl(form.control)} name="intro.stats" />
            </FormSection>
          ),
        },
        { value: "mvv", label: t("tabs.mvv"), keys: ["mvv"], content: <MvvTab form={form} /> },
        { value: "story", label: t("tabs.story"), keys: ["story"], content: <StoryTab form={form} /> },
        { value: "clients", label: t("tabs.clients"), keys: ["clients", "partnerships"], content: <ClientsTab form={form} /> },
      ]}
    />
  )
}
