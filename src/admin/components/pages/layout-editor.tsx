"use client"

import { useTranslations } from "next-intl"

import { ContactCopyFields, LinkFields, looseControl } from "@admin/components/cms/content-fields"
import { FormRepeater } from "@admin/components/cms/form-repeater"
import { PageEditor } from "@admin/components/cms/page-editor"
import { FormInput } from "@admin/components/form/form-input"
import { FormNumberInput } from "@admin/components/form/form-number-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormTextarea } from "@admin/components/form/form-textarea"

/** Site-wide content: company details, the full-screen menu, the footer and the shared enquiry copy. */
export function LayoutEditor() {
  const t = useTranslations("LayoutEditor")
  return (
    <PageEditor
      page="layout"
      previewPath="/"
      tabs={(form) => {
        const control = looseControl(form.control)
        return [
        {
          value: "company",
          label: t("tabs.company"),
          keys: ["email", "phone", "foundedYear", "footer", "contact"],
          content: (
            <div className="flex flex-col gap-4">
              <FormSection title={t("companyTitle")} description={t("companyHint")}>
                <FormInput control={control} name="email" label={t("email")} required type="email" dir="ltr" />
                <FormNumberInput control={control} name="foundedYear" label={t("foundedYear")} required min={1900} max={2100} />
                <LinkFields control={control} name="phone" label={t("phone")} />
              </FormSection>
              <FormSection title={t("footerTitle")} description={t("footerHint")}>
                <FormInput control={control} name="footer.slogan" label={t("slogan")} required maxLength={60} />
                <FormTextarea control={control} name="footer.blurb" label={t("blurb")} required rows={2} maxLength={400} />
              </FormSection>
              <ContactCopyFields control={control} name="contact" />
            </div>
          ),
        },
        {
          value: "menu",
          label: t("tabs.menu"),
          keys: ["menu"],
          content: (
            <FormSection title={t("menuTitle")} description={t("menuHint")}>
              <FormRepeater
                control={control}
                name="menu"
                label={t("menuItems")}
                addLabel={t("addMenuItem")}
                min={1}
                max={10}
                newItem={() => ({ label: "", href: "/", brief: "" })}
                itemTitle={(item) => String(item.label ?? "")}
              >
                {(path) => (
                  <>
                    <LinkFields control={control} name={path} />
                    <FormTextarea control={control} name={`${path}.brief`} label={t("brief")} description={t("briefHint")} required rows={2} maxLength={200} />
                  </>
                )}
              </FormRepeater>
            </FormSection>
          ),
        },
        ]
      }}
    />
  )
}
