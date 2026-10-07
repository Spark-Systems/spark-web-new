"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useForm, type DefaultValues, type UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import { QueryError } from "@admin/components/query-error"
import { Skeleton } from "@admin/components/ui/skeleton"
import { isApiError } from "@admin/lib/api/errors"
import { pageQueries, pagesApi } from "@admin/lib/api/services/pages"
import type { PageContentMap, PageDocument, PageKey } from "@admin/lib/api/types"
import { useAuth } from "@admin/lib/auth/auth-provider"
import { pageSchemas } from "@/lib/cms/schemas"
import { contentResolver } from "./content-resolver"
import { EditorFrame, type AutosaveResult } from "./editor-frame"
import { applyApiErrors, useEditorTabs, type EditorTab } from "./editor-shell"
import { uploadPendingImages, withPlaceholderImages } from "./images"
import { PublishActions, type PublishPending } from "./publish-actions"

export interface PageEditorProps<K extends PageKey> {
  page: K
  /** Website path to preview the saved draft on. */
  previewPath: string
  tabs: (form: UseFormReturn<PageContentMap[K]>) => EditorTab[]
}

function PageForm<K extends PageKey>({ page, previewPath, tabs, doc: initial }: PageEditorProps<K> & { doc: PageDocument<K> }) {
  const t = useTranslations("Publish")
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [doc, setDoc] = useState(initial)
  const [pending, setPending] = useState<PublishPending>(null)

  const form = useForm<PageContentMap[K]>({
    resolver: contentResolver(pageSchemas[page]),
    defaultValues: doc.content as DefaultValues<PageContentMap[K]>,
  })
  const editorTabs = useEditorTabs(form.control, tabs(form))

  const settle = (saved: PageDocument<K>, message: string) => {
    setDoc(saved)
    form.reset(saved.content)
    queryClient.setQueryData(pageQueries.detail(page).queryKey, saved)
    toast.success(message)
  }

  const save = (publish: boolean) =>
    form.handleSubmit(async (values) => {
      setPending(publish ? "publish" : "draft")
      try {
        const content = await uploadPendingImages(values, "pages")
        let saved = await pagesApi.save(page, content)
        if (publish) saved = await pagesApi.act(page, "publish")
        settle(saved, publish ? t("published") : t("savedDraft"))
      } catch (error) {
        if (!applyApiErrors(form, error, "content.")) {
          toast.error(isApiError(error) ? error.message : t("saveError"))
        }
      } finally {
        setPending(null)
      }
    }, editorTabs.showFirstError)()

  /** Draft save for the live preview: no toasts, never shows field errors. */
  const saveSilently = async (): Promise<AutosaveResult> => {
    if (pending) return "error"
    const before = form.getValues()
    if (!pageSchemas[page].safeParse(withPlaceholderImages(before)).success) return "invalid"
    try {
      const saved = await pagesApi.save(page, await uploadPendingImages(before, "pages"))
      setDoc(saved)
      queryClient.setQueryData(pageQueries.detail(page).queryKey, saved)
      const unchanged = JSON.stringify(form.getValues()) === JSON.stringify(before)
      form.reset(saved.content, unchanged ? undefined : { keepValues: true })
      return "saved"
    } catch {
      return "error"
    }
  }

  const discard = async () => {
    setPending("discard")
    try {
      settle(await pagesApi.act(page, "discard"), t("discarded"))
    } catch {
      toast.error(t("actionError"))
    } finally {
      setPending(null)
    }
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        void save(false)
      }}
    >
      <EditorFrame
        form={form}
        previewPath={previewPath}
        saveSilently={saveSilently}
        readOnly={user?.role === "viewer"}
        footer={(previewToggle) => (
          <PublishActions
            leading={previewToggle}
            status={doc.status}
            isDirty={form.formState.isDirty}
            pending={pending}
            readOnly={user?.role === "viewer"}
            previewPath={previewPath}
            onSaveDraft={() => void save(false)}
            onPublish={() => void save(true)}
            onDiscard={() => void discard()}
          />
        )}
      >
        {editorTabs.view}
      </EditorFrame>
    </form>
  )
}

/**
 * Editor for one of the website's pages: loads its saved content, shows the
 * fields in tabs, and saves drafts / publishes like the list editors.
 */
export function PageEditor<K extends PageKey>(props: PageEditorProps<K>) {
  const t = useTranslations("Publish")
  const { data, isPending, isError, refetch } = useQuery(pageQueries.detail(props.page))
  if (isPending) return <Skeleton className="h-[480px] rounded-xl" />
  if (isError) return <QueryError message={t("loadError")} onRetry={() => refetch()} />
  return <PageForm {...props} doc={data} />
}
