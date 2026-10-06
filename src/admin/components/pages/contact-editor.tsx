"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import { HeroFields, looseControl, SeoFields } from "@admin/components/cms/content-fields"
import { PageEditor } from "@admin/components/cms/page-editor"
import { FormInput } from "@admin/components/form/form-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormTextarea } from "@admin/components/form/form-textarea"
import { adminPaths } from "@admin/lib/paths"

const prompts = ["name", "company", "email", "message"] as const

export function ContactEditor() {
  const t = useTranslations("ContactEditor")
  const tf = useTranslations("Fields")
  return (
    <PageEditor
      page="contact"
      previewPath="/contact"
      tabs={(form) => {
        const control = looseControl(form.control)
        return [
        {
          value: "top",
          label: t("tabs.top"),
          keys: ["seo", "hero", "offices"],
          content: (
            <div className="flex flex-col gap-4">
              <SeoFields control={control} name="seo" />
              <HeroFields control={control} name="hero" />
              <FormSection title={t("officesTitle")} description={t("officesHint")}>
                <FormInput control={control} name="offices.eyebrow" label={tf("eyebrow")} required maxLength={80} />
                <p className="text-muted-foreground text-sm">
                  {t.rich("officesNote", { link: (chunks) => <Link className="text-primary underline" href={adminPaths.offices}>{chunks}</Link> })}
                </p>
              </FormSection>
            </div>
          ),
        },
        {
          value: "enquiry",
          label: t("tabs.enquiry"),
          keys: ["enquiry"],
          content: (
            <div className="flex flex-col gap-4">
              <FormSection title={t("enquiryTitle")} description={t("enquiryHint")}>
                <FormInput control={control} name="enquiry.eyebrow" label={tf("eyebrow")} required maxLength={80} />
                <FormInput control={control} name="enquiry.emailPrompt" label={t("emailPrompt")} description={t("emailPromptHint")} required maxLength={80} />
                <FormTextarea control={control} name="enquiry.lead" label={tf("lead")} required rows={2} maxLength={400} className="lg:col-span-2" />
              </FormSection>
              <FormSection title={t("formTitle")} description={t("formHint")}>
                {prompts.map((field) => (
                  <div key={field} className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                    <FormInput control={control} name={`enquiry.form.${field}.prompt`} label={t(`prompt.${field}`)} required maxLength={120} />
                    <FormInput control={control} name={`enquiry.form.${field}.placeholder`} label={t("placeholder")} required maxLength={80} />
                  </div>
                ))}
                <FormInput control={control} name="enquiry.form.submitLabel" label={tf("submitLabel")} required maxLength={120} />
                <FormInput control={control} name="enquiry.form.resetLabel" label={t("resetLabel")} required maxLength={60} />
                <FormTextarea control={control} name="enquiry.form.successMessage" label={t("successMessage")} required rows={2} maxLength={200} className="lg:col-span-2" />
              </FormSection>
            </div>
          ),
        },
        ]
      }}
    />
  )
}
