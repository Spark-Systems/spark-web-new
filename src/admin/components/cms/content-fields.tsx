"use client"

/* eslint-disable @typescript-eslint/no-explicit-any -- these groups bind to any form at a dotted path (`name`), so they take Control<any> */

import { useTranslations } from "next-intl"
import type { Control, FieldValues } from "react-hook-form"

import { FormIconSelect } from "@admin/components/form/form-icon-select"
import { FormInput } from "@admin/components/form/form-input"
import { FormNumberInput } from "@admin/components/form/form-number-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormTextarea } from "@admin/components/form/form-textarea"
import { FormImage } from "./form-image"
import { FormRepeater } from "./form-repeater"
import { FormStringList } from "./form-string-list"

/**
 * Field groups for the content blocks pages share (SEO, hero, section intros,
 * pictures with alt text, links, figures, steps). Each binds to a dotted
 * `name` prefix, e.g. <HeroFields name="hero" /> or name="detail.hero".
 */

export type AnyControl = Control<any, any, any>

/** Lets a field group take any form's control (it addresses fields by dotted path). */
export const looseControl = <T extends FieldValues>(control: Control<T>) => control as unknown as AnyControl

interface GroupProps<T extends FieldValues> {
  control: Control<T>
  /** Dotted path of the block in the form values. */
  name: string
}

const at = (name: string, field: string) => (name ? `${name}.${field}` : field)

/** Search engine title and description. */
export function SeoFields<T extends FieldValues>({ control: typedControl, name }: GroupProps<T>) {
  const control = looseControl(typedControl)
  const t = useTranslations("Fields")
  return (
    <FormSection title={t("seoSection")} description={t("seoSectionHint")}>
      <FormInput control={control} name={at(name, "title")} label={t("seoTitle")} description={t("seoTitleHint")} required maxLength={120} />
      <FormTextarea
        control={control}
        name={at(name, "description")}
        label={t("seoDescription")}
        description={t("seoDescriptionHint")}
        required
        rows={3}
        maxLength={320}
        className="lg:col-span-2"
      />
    </FormSection>
  )
}

/** A picture plus its alt text. */
export function ImageAssetFields<T extends FieldValues>({
  control: typedControl,
  name,
  label,
  required = true,
  className,
}: GroupProps<T> & { label: string; required?: boolean; className?: string }) {
  const control = looseControl(typedControl)
  const t = useTranslations("Fields")
  return (
    <div className={className ?? "flex flex-col gap-4 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-6"}>
      <FormImage control={control} name={at(name, "src")} label={label} required={required} />
      <FormInput control={control} name={at(name, "alt")} label={t("imageAlt")} description={t("imageAltHint")} maxLength={300} />
    </div>
  )
}

/** The full-screen hero that opens inner pages: eyebrow, headline lines, background picture. */
export function HeroFields<T extends FieldValues>({ control: typedControl, name }: GroupProps<T>) {
  const control = looseControl(typedControl)
  const t = useTranslations("Fields")
  return (
    <FormSection title={t("heroSection")} description={t("heroSectionHint")}>
      <FormInput control={control} name={at(name, "eyebrow")} label={t("eyebrow")} required maxLength={120} />
      <FormStringList
        control={control}
        name={at(name, "titleLines")}
        label={t("titleLines")}
        description={t("titleLinesHint")}
        addLabel={t("addLine")}
        required
        min={1}
        max={6}
        maxLength={80}
      />
      <ImageAssetFields control={control} name={at(name, "image")} label={t("backgroundImage")} />
    </FormSection>
  )
}

/** Eyebrow and title that open a section (optionally with a lead paragraph). */
export function IntroFields<T extends FieldValues>({ control: typedControl, name, lead = false }: GroupProps<T> & { lead?: boolean }) {
  const control = looseControl(typedControl)
  const t = useTranslations("Fields")
  return (
    <>
      <FormInput control={control} name={at(name, "eyebrow")} label={t("eyebrow")} required maxLength={80} />
      <FormInput control={control} name={at(name, "title")} label={t("title")} required maxLength={240} />
      {lead && (
        <FormTextarea control={control} name={at(name, "lead")} label={t("lead")} required rows={2} maxLength={400} className="lg:col-span-2" />
      )}
    </>
  )
}

/** A link: its text and where it goes. */
export function LinkFields<T extends FieldValues>({ control: typedControl, name, label }: GroupProps<T> & { label?: string }) {
  const control = looseControl(typedControl)
  const t = useTranslations("Fields")
  return (
    <>
      <FormInput control={control} name={at(name, "label")} label={label ?? t("linkLabel")} required maxLength={120} />
      <FormInput control={control} name={at(name, "href")} label={t("linkHref")} description={t("linkHrefHint")} required dir="ltr" maxLength={500} />
    </>
  )
}

/** The fields of one figure ("600+ projects delivered"). */
export function StatFields<T extends FieldValues>({ control: typedControl, name, decimals = false }: GroupProps<T> & { decimals?: boolean }) {
  const control = looseControl(typedControl)
  const t = useTranslations("Fields")
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormNumberInput control={control} name={at(name, "value")} label={t("statValue")} required allowDecimals={decimals} />
        <FormInput control={control} name={at(name, "suffix")} label={t("statSuffix")} description={t("statSuffixHint")} maxLength={12} />
      </div>
      <FormInput control={control} name={at(name, "label")} label={t("statLabel")} required maxLength={160} />
    </>
  )
}

/** A list of figures. */
export function StatsField<T extends FieldValues>({ control: typedControl, name, label, max = 6 }: GroupProps<T> & { label?: string; max?: number }) {
  const control = looseControl(typedControl)
  const t = useTranslations("Fields")
  return (
    <FormRepeater
      control={control}
      name={name}
      label={label ?? t("stats")}
      addLabel={t("addStat")}
      max={max}
      newItem={() => ({ value: 0, suffix: "", label: "" })}
      itemTitle={(item) => [item.value, item.suffix, item.label].filter((v) => v !== undefined && v !== "").join(" ")}
    >
      {(path) => <StatFields control={control} name={path} />}
    </FormRepeater>
  )
}

/** Icon picker for content (features, steps, milestones). */
export function IconField<T extends FieldValues>({ control: typedControl, name, label }: GroupProps<T> & { label?: string }) {
  const control = looseControl(typedControl)
  const t = useTranslations("Fields")
  return <FormIconSelect control={control} name={name} label={label ?? t("icon")} placeholder={t("iconPlaceholder")} required />
}

/** Numbered steps, each with an icon, title and text. */
export function ProcessStepsField<T extends FieldValues>({ control: typedControl, name, label }: GroupProps<T> & { label?: string }) {
  const control = looseControl(typedControl)
  const t = useTranslations("Fields")
  return (
    <FormRepeater
      control={control}
      name={name}
      label={label ?? t("steps")}
      addLabel={t("addStep")}
      min={1}
      max={8}
      newItem={() => ({ icon: "sparkle", title: "", body: "" })}
      itemTitle={(item) => String(item.title ?? "")}
    >
      {(path) => (
        <>
          <IconField control={control} name={`${path}.icon`} />
          <FormInput control={control} name={`${path}.title`} label={t("title")} required maxLength={120} />
          <FormTextarea control={control} name={`${path}.body`} label={t("body")} required rows={2} maxLength={600} className="lg:col-span-2" />
        </>
      )}
    </FormRepeater>
  )
}

/** Copy of the enquiry section most pages end with. */
export function ContactCopyFields<T extends FieldValues>({ control: typedControl, name }: GroupProps<T>) {
  const control = looseControl(typedControl)
  const t = useTranslations("Fields")
  return (
    <FormSection title={t("contactSection")} description={t("contactSectionHint")}>
      <FormInput control={control} name={at(name, "title")} label={t("title")} required maxLength={240} className="lg:col-span-2" />
      <FormTextarea control={control} name={at(name, "lead")} label={t("lead")} required rows={2} maxLength={400} />
      <FormInput control={control} name={at(name, "submitLabel")} label={t("submitLabel")} required maxLength={120} />
    </FormSection>
  )
}
