"use client"

import { useTranslations } from "next-intl"
import type { Control, FieldValues, Path } from "react-hook-form"

import { FormRichText } from "./form-rich-text"
import { FormSection } from "./form-section"
import { FormTagInput } from "./form-tag-input"

export const META_DESCRIPTION_MAX = 300
export const KEYWORDS_MAX = 20
export const KEYWORD_LENGTH_MAX = 50

/** The fields MetaFields edits; a form using it must have these. */
export interface MetaFieldValues {
  metaDescriptionEn: string
  metaDescriptionAr: string
  keywordsEn: string[]
  keywordsAr: string[]
}

/**
 * SEO meta descriptions and keywords in both languages, for a page's "Meta" tab.
 *
 * @example <MetaFields control={form.control} />
 */
export function MetaFields<T extends FieldValues & MetaFieldValues>({ control }: { control: Control<T> }) {
  const t = useTranslations("MetaFields")
  const field = (name: keyof MetaFieldValues) => name as Path<T>

  return (
    <div className="flex flex-col gap-4">
      <FormSection title={t("descriptionsTitle")} description={t("descriptionsDescription")}>
        <FormRichText control={control} name={field("metaDescriptionEn")} label={t("descriptionEn")} dir="ltr" maxLength={META_DESCRIPTION_MAX} />
        <FormRichText control={control} name={field("metaDescriptionAr")} label={t("descriptionAr")} dir="rtl" maxLength={META_DESCRIPTION_MAX} />
      </FormSection>
      <FormSection title={t("keywordsTitle")} description={t("keywordsDescription")}>
        <FormTagInput
          control={control}
          name={field("keywordsEn")}
          label={t("keywordsEn")}
          dir="ltr"
          maxTags={KEYWORDS_MAX}
          maxTagLength={KEYWORD_LENGTH_MAX}
        />
        <FormTagInput
          control={control}
          name={field("keywordsAr")}
          label={t("keywordsAr")}
          dir="rtl"
          maxTags={KEYWORDS_MAX}
          maxTagLength={KEYWORD_LENGTH_MAX}
        />
      </FormSection>
    </div>
  )
}
