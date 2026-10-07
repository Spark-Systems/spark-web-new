"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { HeroFields, IntroFields, looseControl, SeoFields, StatsField } from "@admin/components/cms/content-fields"
import { FormRepeater } from "@admin/components/cms/form-repeater"
import { PageEditor } from "@admin/components/cms/page-editor"
import { FormInput } from "@admin/components/form/form-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormSelect } from "@admin/components/form/form-select"
import { FormTagInput } from "@admin/components/form/form-tag-input"
import { FormTextarea } from "@admin/components/form/form-textarea"
import { projectsResource } from "@admin/lib/api/services/site-content"

/**
 * Editors for the copy around the three list pages (/solutions, /services,
 * /work). The lists themselves are edited in their own sections.
 */

export function SolutionsPageEditor() {
  const t = useTranslations("ListingPages")
  return (
    <PageEditor
      page="solutions"
      previewPath="/solutions"
      tabs={(form) => {
        const control = looseControl(form.control)
        return [
        {
          value: "page",
          label: t("tab"),
          keys: ["seo", "hero", "flagships", "catalog"],
          content: (
            <div className="flex flex-col gap-4">
              <SeoFields control={control} name="seo" />
              <HeroFields control={control} name="hero" />
              <FormSection title={t("flagshipsTitle")} description={t("flagshipsHint")}>
                <IntroFields control={control} name="flagships" lead />
              </FormSection>
              <FormSection title={t("catalogTitle")} description={t("catalogHint")}>
                <IntroFields control={control} name="catalog" />
              </FormSection>
            </div>
          ),
        },
        ]
      }}
    />
  )
}

export function ServicesPageEditor() {
  const t = useTranslations("ListingPages")
  const tf = useTranslations("Fields")
  return (
    <PageEditor
      page="services"
      previewPath="/services"
      tabs={(form) => {
        const control = looseControl(form.control)
        return [
        {
          value: "page",
          label: t("tab"),
          keys: ["seo", "hero", "areas", "approach"],
          content: (
            <div className="flex flex-col gap-4">
              <SeoFields control={control} name="seo" />
              <HeroFields control={control} name="hero" />
              <FormSection title={t("areasTitle")} description={t("areasHint")}>
                <IntroFields control={control} name="areas" />
              </FormSection>
              <FormSection title={t("approachTitle")} description={t("approachHint")}>
                <IntroFields control={control} name="approach" lead />
                <FormRepeater
                  control={control}
                  name="approach.steps"
                  label={tf("steps")}
                  addLabel={tf("addStep")}
                  min={1}
                  max={8}
                  newItem={() => ({ title: "", body: "" })}
                  itemTitle={(item) => String(item.title ?? "")}
                >
                  {(path) => (
                    <>
                      <FormInput control={control} name={`${path}.title`} label={tf("title")} required maxLength={80} />
                      <FormTextarea control={control} name={`${path}.body`} label={tf("body")} required rows={2} maxLength={400} />
                    </>
                  )}
                </FormRepeater>
              </FormSection>
            </div>
          ),
        },
        ]
      }}
    />
  )
}

export function WorkPageEditor() {
  const t = useTranslations("ListingPages")
  const tf = useTranslations("Fields")
  // The featured case study is picked from the projects that have one.
  const { data } = useQuery(
    projectsResource.queries.list({ page: 1, pageSize: 100, sort: null, search: "", filters: { detail: ["yes"] } }),
  )
  const caseStudies = (data?.data ?? []).map((p) => ({ value: p.slug, label: p.name }))

  return (
    <PageEditor
      page="work"
      previewPath="/work"
      tabs={(form) => {
        const control = looseControl(form.control)
        return [
        {
          value: "page",
          label: t("tab"),
          keys: ["seo", "hero", "portfolio", "featured"],
          content: (
            <div className="flex flex-col gap-4">
              <SeoFields control={control} name="seo" />
              <HeroFields control={control} name="hero" />
              <FormSection title={t("portfolioTitle")} description={t("portfolioHint")}>
                <IntroFields control={control} name="portfolio" />
                <FormInput control={control} name="portfolio.allLabel" label={t("allLabel")} description={t("allLabelHint")} required maxLength={40} />
              </FormSection>
              <FormSection title={t("featuredTitle")} description={t("featuredHint")}>
                <FormInput control={control} name="featured.eyebrow" label={tf("eyebrow")} required maxLength={80} />
                <FormSelect control={control} name="featured.slug" label={t("featuredProject")} options={caseStudies} required />
                <FormInput control={control} name="featured.name" label={tf("name")} required maxLength={120} />
                <FormInput control={control} name="featured.ctaLabel" label={t("ctaLabel")} required maxLength={60} />
                <FormTextarea control={control} name="featured.summary" label={t("summary")} required rows={3} maxLength={600} className="lg:col-span-2" />
                <StatsField control={control} name="featured.stats" />
              </FormSection>
            </div>
          ),
        },
        ]
      }}
    />
  )
}

export function CareersPageEditor() {
  const t = useTranslations("ListingPages")
  const tf = useTranslations("Fields")
  return (
    <PageEditor
      page="careers"
      previewPath="/careers"
      tabs={(form) => {
        const control = looseControl(form.control)
        return [
          {
            value: "page",
            label: t("tab"),
            keys: ["seo", "hero", "roles", "apply"],
            content: (
              <div className="flex flex-col gap-4">
                <SeoFields control={control} name="seo" />
                <HeroFields control={control} name="hero" />
                <FormSection title={t("rolesTitle")} description={t("rolesHint")}>
                  <IntroFields control={control} name="roles" />
                </FormSection>
                <FormSection title={t("applyTitle")} description={t("applyHint")}>
                  <IntroFields control={control} name="apply" lead />
                  <FormInput control={control} name="apply.submitLabel" label={tf("submitLabel")} required maxLength={60} />
                  <FormTagInput control={control} name="apply.countries" label={t("countries")} description={t("countriesHint")} maxTags={30} maxTagLength={60} />
                  <FormTextarea control={control} name="apply.successMessage" label={t("successMessage")} required rows={2} maxLength={300} className="lg:col-span-2" />
                </FormSection>
              </div>
            ),
          },
        ]
      }}
    />
  )
}

export function InsightsPageEditor() {
  const t = useTranslations("ListingPages")
  const tf = useTranslations("Fields")
  return (
    <PageEditor
      page="insights"
      previewPath="/insights"
      tabs={(form) => {
        const control = looseControl(form.control)
        return [
          {
            value: "page",
            label: t("tab"),
            keys: ["seo", "hero", "featured", "posts"],
            content: (
              <div className="flex flex-col gap-4">
                <SeoFields control={control} name="seo" />
                <HeroFields control={control} name="hero" />
                <FormSection title={t("featuredArticleTitle")} description={t("featuredArticleHint")}>
                  <FormInput control={control} name="featured.eyebrow" label={tf("eyebrow")} required maxLength={60} />
                  <FormInput control={control} name="featured.ctaLabel" label={t("ctaLabel")} required maxLength={60} />
                </FormSection>
                <FormSection title={t("postsTitle")} description={t("postsHint")}>
                  <IntroFields control={control} name="posts" />
                  <FormInput control={control} name="posts.allLabel" label={t("allLabel")} description={t("allPostsHint")} required maxLength={40} />
                </FormSection>
              </div>
            ),
          },
        ]
      }}
    />
  )
}
