"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import type { UseFormReturn } from "react-hook-form"

import { LinkFields, looseControl, StatsField } from "@admin/components/cms/content-fields"
import { FormImage } from "@admin/components/cms/form-image"
import { FormRepeater } from "@admin/components/cms/form-repeater"
import { FormStringList } from "@admin/components/cms/form-string-list"
import { PageEditor } from "@admin/components/cms/page-editor"
import { FormCheckbox } from "@admin/components/form/form-checkbox"
import { FormInput } from "@admin/components/form/form-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormSelect } from "@admin/components/form/form-select"
import { FormTagInput } from "@admin/components/form/form-tag-input"
import { FormTextarea } from "@admin/components/form/form-textarea"
import type { PageContentMap } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"

type Form = UseFormReturn<PageContentMap["home"]>

function HeroTab({ form }: { form: Form }) {
  const control = looseControl(form.control)
  const t = useTranslations("HomeEditor")
  const tf = useTranslations("Fields")
  return (
    <FormSection title={t("heroTitle")} description={t("heroHint")}>
      <FormInput control={control} name="hero.titleStart" label={t("titleStart")} description={t("titleStartHint")} required maxLength={80} />
      <FormInput control={control} name="hero.titleEnd" label={t("titleEnd")} description={t("titleEndHint")} required maxLength={80} />
      <FormInput control={control} name="hero.videoSrc" label={t("video")} description={t("videoHint")} required type="url" dir="ltr" className="lg:col-span-2" />
      <FormStringList control={control} name="hero.paragraphs" label={t("paragraphs")} addLabel={t("addParagraph")} multiline required min={1} max={4} maxLength={600} className="lg:col-span-2" />
      <StatsField control={control} name="hero.stats" label={tf("stats")} max={4} />
    </FormSection>
  )
}

function SolutionsTab({ form }: { form: Form }) {
  const control = looseControl(form.control)
  const t = useTranslations("HomeEditor")
  const tf = useTranslations("Fields")
  const themes = [
    { value: "brand", label: t("themeBrand") },
    { value: "navy", label: t("themeNavy") },
  ]
  return (
    <FormSection title={t("solutionsTitle")} description={t("solutionsHint")}>
      <FormInput control={control} name="solutions.title" label={tf("title")} required maxLength={200} className="lg:col-span-2" />
      <FormInput control={control} name="solutions.highlight.value" label={t("highlightValue")} required maxLength={20} />
      <FormInput control={control} name="solutions.highlight.label" label={t("highlightLabel")} required maxLength={80} />
      <FormInput control={control} name="solutions.highlight.tbc" label={t("highlightNote")} description={t("highlightNoteHint")} maxLength={80} className="lg:col-span-2" />
      <LinkFields control={control} name="solutions.cta" label={t("ctaLabel")} />
      <FormRepeater
        control={control}
        name="solutions.items"
        label={t("solutionCards")}
        addLabel={t("addCard")}
        min={1}
        max={8}
        newItem={() => ({ id: "", title: "", caption: "", description: "", image: null, imageAlt: "", theme: "brand", href: "/solutions" })}
        itemTitle={(item) => String(item.title ?? "")}
      >
        {(path) => (
          <>
            <FormInput control={control} name={`${path}.title`} label={tf("title")} required maxLength={80} />
            <FormInput control={control} name={`${path}.id`} label={t("cardKey")} description={t("cardKeyHint")} required dir="ltr" maxLength={60} />
            <FormInput control={control} name={`${path}.caption`} label={t("caption")} description={t("captionHint")} required maxLength={120} />
            <FormSelect control={control} name={`${path}.theme`} label={t("theme")} options={themes} required />
            <FormTextarea control={control} name={`${path}.description`} label={tf("description")} required rows={2} maxLength={300} className="lg:col-span-2" />
            <FormImage control={control} name={`${path}.image`} label={tf("image")} required />
            <div className="flex flex-col gap-6">
              <FormInput control={control} name={`${path}.imageAlt`} label={tf("imageAlt")} maxLength={300} />
              <FormInput control={control} name={`${path}.href`} label={tf("linkHref")} description={tf("linkHrefHint")} required dir="ltr" maxLength={500} />
            </div>
          </>
        )}
      </FormRepeater>
    </FormSection>
  )
}

function ServicesTab({ form }: { form: Form }) {
  const control = looseControl(form.control)
  const t = useTranslations("HomeEditor")
  const tf = useTranslations("Fields")
  return (
    <FormSection title={t("servicesTitle")} description={t("servicesHint")}>
      <FormInput control={control} name="services.title" label={tf("title")} required maxLength={120} className="lg:col-span-2" />
      <FormRepeater
        control={control}
        name="services.items"
        label={t("serviceCards")}
        description={t("serviceCardsHint")}
        addLabel={t("addCard")}
        min={1}
        max={12}
        newItem={() => ({ name: "", description: "", image: null })}
        itemTitle={(item) => String(item.name ?? "")}
      >
        {(path) => (
          <>
            <FormInput control={control} name={`${path}.name`} label={tf("name")} required maxLength={80} />
            <FormTextarea control={control} name={`${path}.description`} label={tf("description")} required rows={2} maxLength={300} />
            <FormImage control={control} name={`${path}.image`} label={tf("image")} required className="lg:col-span-2" />
          </>
        )}
      </FormRepeater>
    </FormSection>
  )
}

function ClientsTab({ form }: { form: Form }) {
  const control = looseControl(form.control)
  const t = useTranslations("HomeEditor")
  return (
    <FormSection title={t("clientsTitle")} description={t("clientsHint")}>
      <LinkFields control={control} name="clients.moreLink" label={t("moreLink")} />
      <FormInput control={control} name="clients.partnersLabel" label={t("partnersLabel")} required maxLength={80} />
      <p className="text-muted-foreground text-sm lg:col-span-2">
        {t.rich("clientsListsNote", {
          clients: (chunks) => <Link className="text-primary underline" href={adminPaths.clients}>{chunks}</Link>,
          partners: (chunks) => <Link className="text-primary underline" href={adminPaths.partners}>{chunks}</Link>,
        })}
      </p>
    </FormSection>
  )
}

function WorkTab({ form }: { form: Form }) {
  const control = looseControl(form.control)
  const t = useTranslations("HomeEditor")
  const tf = useTranslations("Fields")
  return (
    <div className="flex flex-col gap-4">
      <FormSection title={t("workIntroTitle")} description={t("workIntroHint")}>
        <FormInput control={control} name="work.intro.before" label={t("introBefore")} required maxLength={40} />
        <FormInput control={control} name="work.intro.after" label={t("introAfter")} required maxLength={40} />
        <FormImage control={control} name="work.intro.image" label={tf("image")} required />
        <FormInput control={control} name="work.intro.imageAlt" label={tf("imageAlt")} maxLength={300} />
      </FormSection>
      <FormSection title={t("workTitle")} description={t("workHint")}>
        <FormInput control={control} name="work.title" label={tf("title")} required maxLength={120} className="lg:col-span-2" />
        <LinkFields control={control} name="work.cta" label={t("ctaLabel")} />
        <FormRepeater
          control={control}
          name="work.items"
          label={t("projectCards")}
          addLabel={t("addCard")}
          min={1}
          max={8}
          newItem={() => ({ title: "", subtitle: "", subtitleTbc: false, tags: [], metric: { value: "", label: "" }, image: null, href: "/work" })}
          itemTitle={(item) => String(item.title ?? "")}
        >
          {(path) => (
            <>
              <FormInput control={control} name={`${path}.title`} label={tf("title")} required maxLength={120} />
              <FormInput control={control} name={`${path}.subtitle`} label={t("subtitle")} required maxLength={200} />
              <FormInput control={control} name={`${path}.metric.value`} label={t("metricValue")} required maxLength={30} />
              <FormInput control={control} name={`${path}.metric.label`} label={t("metricLabel")} required maxLength={80} />
              <FormTagInput control={control} name={`${path}.tags`} label={tf("tags")} maxTags={6} maxTagLength={60} />
              <FormInput control={control} name={`${path}.href`} label={tf("linkHref")} description={tf("linkHrefHint")} required dir="ltr" maxLength={500} />
              <FormImage control={control} name={`${path}.image`} label={tf("image")} required />
              <FormCheckbox control={control} name={`${path}.subtitleTbc`} label={t("subtitleTbc")} description={t("subtitleTbcHint")} />
            </>
          )}
        </FormRepeater>
      </FormSection>
    </div>
  )
}

function TestimonialsTab({ form }: { form: Form }) {
  const control = looseControl(form.control)
  const t = useTranslations("HomeEditor")
  const tf = useTranslations("Fields")
  return (
    <FormSection title={t("testimonialsTitle")} description={t("testimonialsHint")}>
      <FormInput control={control} name="testimonials.eyebrow" label={tf("eyebrow")} required maxLength={80} />
      <FormInput control={control} name="testimonials.title" label={tf("title")} required maxLength={200} />
      <FormRepeater
        control={control}
        name="testimonials.items"
        label={t("testimonials")}
        addLabel={t("addTestimonial")}
        max={12}
        newItem={() => ({ quote: "", author: "", role: "", company: "", logo: null })}
        itemTitle={(item) => [item.author, item.company].filter(Boolean).join(", ")}
      >
        {(path) => (
          <>
            <FormTextarea control={control} name={`${path}.quote`} label={tf("quote")} required rows={3} maxLength={1000} className="lg:col-span-2" />
            <FormInput control={control} name={`${path}.author`} label={tf("author")} required maxLength={120} />
            <FormInput control={control} name={`${path}.role`} label={tf("role")} description={t("roleHint")} maxLength={160} />
            <FormInput control={control} name={`${path}.company`} label={tf("company")} required maxLength={120} />
            <FormImage control={control} name={`${path}.logo`} label={tf("logo")} svg />
          </>
        )}
      </FormRepeater>
    </FormSection>
  )
}

function AiTab({ form }: { form: Form }) {
  const control = looseControl(form.control)
  const t = useTranslations("HomeEditor")
  const tf = useTranslations("Fields")
  return (
    <FormSection title={t("aiTitle")} description={t("aiHint")}>
      <FormInput control={control} name="ai.title" label={tf("title")} required maxLength={200} className="lg:col-span-2" />
      <FormTextarea control={control} name="ai.lead" label={tf("lead")} required rows={2} maxLength={400} className="lg:col-span-2" />
      <FormRepeater
        control={control}
        name="ai.capabilities"
        label={t("capabilities")}
        addLabel={t("addCapability")}
        min={1}
        max={6}
        newItem={() => ({ title: "", description: "" })}
        itemTitle={(item) => String(item.title ?? "")}
      >
        {(path) => (
          <>
            <FormInput control={control} name={`${path}.title`} label={tf("title")} required maxLength={60} />
            <FormTextarea control={control} name={`${path}.description`} label={tf("description")} required rows={2} maxLength={400} />
          </>
        )}
      </FormRepeater>
    </FormSection>
  )
}

export function HomeEditor() {
  const t = useTranslations("HomeEditor.tabs")
  return (
    <PageEditor
      page="home"
      previewPath="/"
      tabs={(form) => [
        { value: "hero", label: t("hero"), keys: ["hero"], content: <HeroTab form={form} /> },
        { value: "solutions", label: t("solutions"), keys: ["solutions"], content: <SolutionsTab form={form} /> },
        { value: "services", label: t("services"), keys: ["services"], content: <ServicesTab form={form} /> },
        { value: "clients", label: t("clients"), keys: ["clients"], content: <ClientsTab form={form} /> },
        { value: "work", label: t("work"), keys: ["work"], content: <WorkTab form={form} /> },
        { value: "testimonials", label: t("testimonials"), keys: ["testimonials"], content: <TestimonialsTab form={form} /> },
        { value: "ai", label: t("ai"), keys: ["ai"], content: <AiTab form={form} /> },
      ]}
    />
  )
}
