"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useForm, useWatch, type DefaultValues, type FieldPath, type UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { DeleteDialog } from "@admin/components/delete-dialog"
import { useSlugFromName } from "@admin/components/form/use-slug-from-name"
import { QueryError } from "@admin/components/query-error"
import { Skeleton } from "@admin/components/ui/skeleton"
import { isApiError } from "@admin/lib/api/errors"
import type { Resource } from "@admin/lib/api/resource"
import type { CollectionKey, CollectionMap, CollectionRow, PublishAction } from "@admin/lib/api/types"
import { useAuth } from "@admin/lib/auth/auth-provider"
import { contentResolver } from "./content-resolver"
import { applyApiErrors, useEditorTabs, type EditorTab } from "./editor-shell"
import { uploadPendingImages } from "./images"
import { PublishActions, type PublishPending } from "./publish-actions"

type Values<K extends CollectionKey> = CollectionMap[K]
type Row<K extends CollectionKey> = CollectionRow<Values<K>>

/** A row's editable fields (drops its id and publication details). */
function toValues<K extends CollectionKey>(row: Row<K>): Values<K> {
  const values: Record<string, unknown> = { ...row }
  for (const key of ["id", "status", "created_at", "updated_at", "published_at", "updated_by"]) delete values[key]
  return values as unknown as Values<K>
}

export interface CollectionEditorProps<K extends CollectionKey> {
  resource: Resource<K>
  /** The saved item when editing; omit to create one. */
  row?: Row<K>
  /** Shared content schema (lib/cms/schemas) for this list. */
  schema: z.ZodType
  /** Starting values for a new item. */
  defaults: () => Values<K>
  /** Upload folder for its pictures, e.g. "solutions". */
  folder: string
  /** The list page; new items move to `${listPath}/:id/edit` once saved. */
  listPath: string
  /** Website page to preview with the saved draft. */
  previewPath?: (values: Values<K>) => string
  /** Fill the slug from the name while creating. */
  slug?: { from: FieldPath<Values<K>>; to: FieldPath<Values<K>> }
  /** The item's name, for the delete confirmation. */
  title: (values: Values<K>) => string
  tabs: (form: UseFormReturn<Values<K>>) => EditorTab[]
}

/**
 * Create/edit form for a draft/publish list item: tabs of fields, Save draft,
 * Publish (save and make live), Preview, Discard changes, Unpublish and
 * Delete. New pictures are uploaded on save.
 */
export function CollectionEditor<K extends CollectionKey>({
  resource,
  row: initialRow,
  schema,
  defaults,
  folder,
  listPath,
  previewPath,
  slug,
  title,
  tabs,
}: CollectionEditorProps<K>) {
  const t = useTranslations("Publish")
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [row, setRow] = useState(initialRow)
  const [pending, setPending] = useState<PublishPending>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { api } = resource

  const form = useForm<Values<K>>({
    resolver: contentResolver(schema),
    defaultValues: (row ? toValues(row) : defaults()) as DefaultValues<Values<K>>,
  })
  useSlugFromName(form, slug?.from ?? ("" as FieldPath<Values<K>>), slug?.to ?? ("" as FieldPath<Values<K>>), Boolean(slug && !row))
  const editorTabs = useEditorTabs(form.control, tabs(form))
  const values = useWatch({ control: form.control }) as Values<K>

  const settle = (saved: Row<K>, message: string) => {
    setRow(saved)
    form.reset(toValues(saved))
    queryClient.invalidateQueries({ queryKey: resource.queries.all })
    toast.success(message)
  }

  const save = (publish: boolean) =>
    form.handleSubmit(async (formValues) => {
      setPending(publish ? "publish" : "draft")
      try {
        const input = await uploadPendingImages(formValues, folder)
        if (!row) {
          const created = await api.create(input, { publish })
          settle(created, publish ? t("published") : t("savedDraft"))
          router.replace(`${listPath}/${created.id}/edit`)
          return
        }
        let saved = await api.update(row.id, input)
        if (publish) saved = await api.act(row.id, "publish")
        settle(saved, publish ? t("published") : t("savedDraft"))
      } catch (error) {
        if (!applyApiErrors(form, error)) toast.error(isApiError(error) ? error.message : t("saveError"))
      } finally {
        setPending(null)
      }
    }, editorTabs.showFirstError)()

  const act = async (action: Exclude<PublishAction, "publish">) => {
    if (!row) return
    setPending(action)
    try {
      settle(await api.act(row.id, action), t(action === "unpublish" ? "unpublished" : "discarded"))
    } catch {
      toast.error(t("actionError"))
    } finally {
      setPending(null)
    }
  }

  const remove = async () => {
    if (!row) return
    setPending("delete")
    try {
      await api.remove(row.id)
      queryClient.invalidateQueries({ queryKey: resource.queries.all })
      toast.success(t("deleted"))
      router.push(listPath)
    } catch {
      toast.error(t("deleteError"))
      setPending(null)
    }
  }

  return (
    <>
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void save(false)
        }}
      >
        {editorTabs.view}
        <PublishActions
          status={row?.status ?? null}
          isDirty={form.formState.isDirty}
          pending={pending}
          readOnly={user?.role === "viewer"}
          cancelHref={listPath}
          previewPath={row && previewPath ? previewPath(values) : undefined}
          onSaveDraft={() => void save(false)}
          onPublish={() => void save(true)}
          onUnpublish={() => void act("unpublish")}
          onDiscard={() => void act("discard")}
          onDelete={row ? () => setConfirmDelete(true) : undefined}
        />
      </form>
      <DeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t("deleteTitle", { name: title(values) })}
        description={t("deleteDescription")}
        confirmLabel={t("deleteConfirm")}
        cancelLabel={t("cancel")}
        pending={pending === "delete"}
        onConfirm={() => void remove()}
      />
    </>
  )
}

/** Loads an item, then shows its editor (or an error with retry). */
export function EditCollectionItem<K extends CollectionKey>({
  resource,
  id,
  children,
}: {
  resource: Resource<K>
  id: string
  children: (row: Row<K>) => React.ReactNode
}) {
  const t = useTranslations("Publish")
  const { data, isPending, isError, error, refetch } = useQuery(resource.queries.detail(id))
  if (isPending) return <Skeleton className="h-[480px] rounded-xl" />
  if (isError) {
    const notFound = isApiError(error) && error.status === 404
    return <QueryError message={notFound ? t("notFound") : t("loadError")} onRetry={() => refetch()} />
  }
  return children(data)
}
