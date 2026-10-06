"use client"

import Image from "@tiptap/extension-image"
import { Node, ResizableNodeView } from "@tiptap/core"
import { NodeSelection } from "@tiptap/pm/state"
import { useEditorState, type Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { SquarePlay, Trash2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@admin/components/ui/button"
import { Input } from "@admin/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@admin/components/ui/popover"
import { Separator } from "@admin/components/ui/separator"
import { Toggle } from "@admin/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@admin/components/ui/tooltip"
import { cn } from "@admin/lib/utils"

/* ------------------------------------------------------------------ */
/* Image positions                                                     */
/* ------------------------------------------------------------------ */

export const imagePositions = ["top-left", "top-right", "center", "bottom-left", "bottom-right"] as const
export type ImagePosition = (typeof imagePositions)[number]

/**
 * The Image extension plus a `position` attribute, saved as data-position on the
 * <img>. Left and right positions float the image so text wraps around it; the
 * website needs the matching CSS (see `.rich-text img[data-position…]` in globals.css).
 */
export const PositionedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      position: positionAttribute,
    }
  },
})

/** Blocks that can be positioned from the media menu. */
const POSITIONABLE = ["image", "embed"]

/** Reads `data-position`, keeping only known values. */
const positionAttribute = {
  default: null,
  parseHTML: (element: HTMLElement) => {
    const value = element.getAttribute("data-position")
    return imagePositions.includes(value as ImagePosition) ? value : null
  },
  renderHTML: (attributes: Record<string, unknown>) =>
    attributes.position ? { "data-position": attributes.position } : {},
}

/**
 * Moves the selected image or embed to a position. "Top" puts it just before the text it
 * sits beside and "bottom" just after it; left/right float it so the text wraps,
 * and center gives it a line of its own.
 */
export function positionMedia(editor: Editor, position: ImagePosition | null) {
  const { state } = editor
  const selection = state.selection
  if (!(selection instanceof NodeSelection) || !POSITIONABLE.includes(selection.node.type.name)) return

  const node = selection.node
  const $pos = state.doc.resolve(selection.from)
  const index = $pos.index()
  // Only paragraphs with text count; the editor's empty last line isn't something to sit beside.
  const withText = (child: typeof node | null) => (child?.isTextblock && child.content.size > 0 ? child : null)
  const prev = withText($pos.parent.maybeChild(index - 1))
  const next = withText($pos.parent.maybeChild(index + 1))

  // The paragraph the image belongs to: the one before it once it's been put at a
  // bottom position, otherwise the one after it. Switching top ↔ bottom then moves
  // the image around that same paragraph instead of drifting to another one.
  const current = node.attrs.position as ImagePosition | null
  const anchorIsPrev = current?.startsWith("bottom") ? Boolean(prev) : !next && Boolean(prev)
  const anchor = anchorIsPrev ? prev : next

  // Where to move the image, if it isn't already on the requested side of that paragraph.
  let target: number | null = null
  if (anchor && position?.startsWith("top") && anchorIsPrev) {
    target = selection.from - anchor.nodeSize // before the paragraph above
  }
  if (anchor && position?.startsWith("bottom") && !anchorIsPrev) {
    target = selection.to + anchor.nodeSize // after the paragraph below
  }

  const tr = state.tr
  let at = selection.from
  if (target !== null) {
    tr.delete(selection.from, selection.to)
    at = tr.mapping.map(target)
    tr.insert(at, node)
  }
  tr.setNodeMarkup(at, undefined, { ...node.attrs, position })
  tr.setSelection(NodeSelection.create(tr.doc, at))
  editor.view.dispatch(tr.scrollIntoView())
  editor.commands.focus()
}

/** A tiny page diagram: text lines with the image box in the given position. */
function PositionIcon({ position }: { position: ImagePosition }) {
  const box = {
    "top-left": { x: 2, y: 2 },
    "top-right": { x: 9, y: 2 },
    center: { x: 5.5, y: 5.5 },
    "bottom-left": { x: 2, y: 9 },
    "bottom-right": { x: 9, y: 9 },
  }[position]
  const lines =
    position === "center"
      ? [[2, 2.5, 14], [2, 13.5, 14]]
      : position.endsWith("left")
        ? [[8, 3, 14], [8, 6, 14], [8, 9, 14], [8, 12, 14], [2, 14.5, 14]].filter((_, i) => (position.startsWith("top") ? i !== 4 : i !== 0))
        : [[2, 3, 8], [2, 6, 8], [2, 9, 8], [2, 12, 8], [2, 14.5, 14]].filter((_, i) => (position.startsWith("top") ? i !== 4 : i !== 0))
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      {lines.map(([x1, y, x2], i) => (
        <line key={i} x1={x1} x2={x2} y1={y} y2={y} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.55" />
      ))}
      <rect x={box.x} y={box.y} width="5" height="5" rx="1" fill="currentColor" />
    </svg>
  )
}

const positionKey = {
  "top-left": "topLeft",
  "top-right": "topRight",
  center: "center",
  "bottom-left": "bottomLeft",
  "bottom-right": "bottomRight",
} as const

/** The selected image or embed, if any. */
const selectedMedia = (editor: Editor) => POSITIONABLE.find((type) => editor.isActive(type))

/** Floating menu over a selected image or embed: the five positions, plus reset and delete. */
export function MediaPositionMenu({ editor }: { editor: Editor }) {
  const t = useTranslations("Inputs.image.position")
  const current = useEditorState({
    editor,
    selector: ({ editor }) => {
      const type = selectedMedia(editor)
      return type ? ((editor.getAttributes(type).position as ImagePosition | null | undefined) ?? null) : null
    },
  })

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) => editor.isEditable && Boolean(selectedMedia(editor))}
      options={{ placement: "top", offset: 8 }}
      className="bg-popover text-popover-foreground z-50 flex items-center gap-0.5 rounded-lg border p-1 shadow-md"
    >
      <div role="toolbar" aria-label={t("label")} className="flex items-center gap-0.5">
        {imagePositions.map((position) => (
          <Tooltip key={position}>
            <TooltipTrigger
              render={
                <Toggle
                  size="sm"
                  pressed={current === position}
                  onPressedChange={() => positionMedia(editor, position)}
                  aria-label={t(positionKey[position])}
                  className="aria-pressed:bg-accent aria-pressed:text-accent-foreground"
                />
              }
            >
              <PositionIcon position={position} />
            </TooltipTrigger>
            <TooltipContent>{t(positionKey[position])}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      <Separator orientation="vertical" className="mx-1 h-5 data-[orientation=vertical]:self-center" />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={!current}
              onClick={() => positionMedia(editor, null)}
              aria-label={t("reset")}
            />
          }
        >
          <X />
        </TooltipTrigger>
        <TooltipContent>{t("reset")}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => editor.chain().focus().deleteSelection().run()}
              aria-label={t("delete")}
              className="hover:text-destructive"
            />
          }
        >
          <Trash2 />
        </TooltipTrigger>
        <TooltipContent>{t("delete")}</TooltipContent>
      </Tooltip>
    </BubbleMenu>
  )
}

/**
 * Inserts a block (image, embed) at the cursor; when a block is selected it goes
 * after it rather than replacing it.
 */
export function insertBlock(editor: Editor, content: { type: string; attrs: Record<string, unknown> }) {
  const { selection } = editor.state
  const chain = editor.chain().focus()
  if (selection instanceof NodeSelection) chain.insertContentAt(selection.to, content).run()
  else chain.insertContent(content).run()
}

/* ------------------------------------------------------------------ */
/* Embeds                                                              */
/* ------------------------------------------------------------------ */

type EmbedKind = "video" | "map"

/** Only these players can be embedded, so content can't pull in arbitrary pages. */
function embedKind(src: string): EmbedKind | null {
  try {
    const url = new URL(src)
    if (url.protocol !== "https:") return null
    if (["www.youtube-nocookie.com", "www.youtube.com"].includes(url.hostname) && url.pathname.startsWith("/embed/")) return "video"
    if (url.hostname === "player.vimeo.com" && url.pathname.startsWith("/video/")) return "video"
    if (["www.google.com", "maps.google.com"].includes(url.hostname) && url.pathname.startsWith("/maps/embed")) return "map"
    return null
  } catch {
    return null
  }
}

/**
 * Turns what people paste (a YouTube or Vimeo page link, a Google Maps embed link,
 * or a whole <iframe> snippet) into an embeddable player URL, or null.
 */
export function toEmbed(input: string): { src: string; kind: EmbedKind } | null {
  const text = input.trim()
  const raw = /<iframe[^>]+src=["']([^"']+)["']/i.exec(text)?.[1] ?? text
  let url: URL
  try {
    url = new URL(raw.startsWith("//") ? `https:${raw}` : raw)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^m\./, "www.")
  let src = url.href
  if (host === "youtu.be") src = `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`
  else if (["www.youtube.com", "youtube.com"].includes(host)) {
    const id = url.searchParams.get("v") ?? /^\/(?:shorts|embed|live)\/([\w-]+)/.exec(url.pathname)?.[1]
    if (id) src = `https://www.youtube-nocookie.com/embed/${id}`
  } else if (["vimeo.com", "www.vimeo.com"].includes(host)) {
    const id = /^\/(\d+)/.exec(url.pathname)?.[1]
    if (id) src = `https://player.vimeo.com/video/${id}`
  }
  const kind = embedKind(src)
  return kind ? { src, kind } : null
}

const iframeAttrs = {
  loading: "lazy",
  allowfullscreen: "true",
  allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
  referrerpolicy: "strict-origin-when-cross-origin",
  frameborder: "0",
}

/** Smallest an embed can be dragged to, in pixels. */
const EMBED_MIN_WIDTH = 160

/**
 * A video or map player, saved as <div data-embed="video|map" data-position style="width"><iframe></div>.
 * The height follows a 16:9 shape, so only the width is stored. Drag a corner to
 * resize it, and position it from the media menu like an image.
 */
export const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      // src and kind are written by renderHTML itself (on the iframe / as data-embed).
      src: { default: null, renderHTML: () => ({}) },
      kind: { default: "video", renderHTML: () => ({}) },
      position: positionAttribute,
      width: {
        default: null,
        parseHTML: (element) => {
          const width = Number.parseInt(element.style.width, 10)
          return Number.isFinite(width) && width > 0 ? width : null
        },
        renderHTML: (attributes) => (attributes.width ? { style: `width: ${attributes.width}px` } : {}),
      },
    }
  },

  parseHTML() {
    const fromIframe = (iframe: Element | null) => {
      const src = iframe?.getAttribute("src")
      const kind = src ? embedKind(src) : null
      return src && kind ? { src, kind } : false
    }
    return [
      { tag: "div[data-embed]", getAttrs: (element) => fromIframe(element.querySelector("iframe")) },
      { tag: "iframe[src]", getAttrs: (element) => fromIframe(element) },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, "data-embed": node.attrs.kind }, ["iframe", { src: node.attrs.src, ...iframeAttrs }]]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const element = document.createElement("div")
      const iframe = document.createElement("iframe")
      Object.entries(iframeAttrs).forEach(([key, value]) => iframe.setAttribute(key, value))
      element.appendChild(iframe)

      // Mirrors the node's attributes onto the DOM (also on undo/redo or a position change).
      const sync = (current: typeof node) => {
        element.setAttribute("data-embed", current.attrs.kind)
        if (current.attrs.position) element.setAttribute("data-position", current.attrs.position)
        else element.removeAttribute("data-position")
        element.style.width = current.attrs.width ? `${current.attrs.width}px` : ""
        if (iframe.getAttribute("src") !== current.attrs.src) iframe.setAttribute("src", current.attrs.src)
      }
      sync(node)

      return new ResizableNodeView({
        element,
        node,
        editor,
        getPos,
        // The 16:9 shape sets the height, so only the width follows the drag.
        onResize: (width) => {
          element.style.width = `${width}px`
        },
        onCommit: (width) => {
          const pos = getPos()
          if (pos === undefined) return
          editor.chain().setNodeSelection(pos).updateAttributes("embed", { width: Math.round(width) }).run()
        },
        onUpdate: (updated) => {
          if (updated.type !== node.type) return false
          sync(updated)
          return true
        },
        options: {
          directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
          min: { width: EMBED_MIN_WIDTH, height: Math.round((EMBED_MIN_WIDTH * 9) / 16) },
          preserveAspectRatio: true,
        },
      })
    }
  },
})

/** Toolbar button: paste a link or embed code, get a player in the content. */
export function EmbedControl({ editor, disabled }: { editor: Editor; disabled?: boolean }) {
  const t = useTranslations("Inputs.embed")
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [error, setError] = useState(false)

  const insert = () => {
    const embed = toEmbed(value)
    if (!embed) return setError(true)
    insertBlock(editor, { type: "embed", attrs: embed })
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setValue("")
          setError(false)
        }
        setOpen(next)
      }}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={<Button type="button" variant="ghost" size="icon-sm" disabled={disabled} aria-label={t("button")} />}
            />
          }
        >
          <SquarePlay />
        </TooltipTrigger>
        <TooltipContent>{t("button")}</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-80">
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation() // don't submit the page's form
            insert()
          }}
        >
          <p className="text-sm font-medium">{t("title")}</p>
          <Input
            dir="ltr"
            autoFocus
            value={value}
            placeholder="https://www.youtube.com/watch?v=…"
            aria-label={t("title")}
            aria-invalid={error || undefined}
            onChange={(event) => {
              setValue(event.target.value)
              setError(false)
            }}
          />
          <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
            {error ? t("invalid") : t("hint")}
          </p>
          <div className="flex justify-end">
            <Button type="submit" size="sm">
              {t("insert")}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
