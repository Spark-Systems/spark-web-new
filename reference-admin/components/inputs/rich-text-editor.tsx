"use client"

import { BackgroundColor, Color, FontSize, TextStyle } from "@tiptap/extension-text-style"
import { CharacterCount, Placeholder } from "@tiptap/extensions"
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Baseline,
  Bold,
  CodeXml,
  Eraser,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { CodeEditor } from "@/components/inputs/code-editor"
import { Embed, EmbedControl, insertBlock, MediaPositionMenu, PositionedImage } from "@/components/inputs/rich-text-media"
import { useFileSize } from "@/components/inputs/file-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface RichTextEditorProps {
  /** HTML. An empty document is reported as "". */
  value: string
  onChange: (html: string) => void
  onBlur?: () => void
  id?: string
  placeholder?: string
  /** Hard cap on characters; the editor stops accepting input past it. */
  maxLength?: number
  /** Text direction of the content, independent of the page's. */
  dir?: "ltr" | "rtl" | "auto"
  disabled?: boolean
  invalid?: boolean
  className?: string
  "aria-describedby"?: string
  "aria-labelledby"?: string
  /** Adds an "Edit as HTML" toggle that swaps the editor for a code view of its HTML. */
  sourceEditing?: boolean
  /**
   * Adds an image button. The picked file is passed here and the returned URL is
   * inserted; inserted images can be resized by dragging their corners.
   */
  onImageUpload?: (file: File) => Promise<string>
  /** Largest image the image button accepts, in bytes. Default 2 MB. */
  imageMaxSize?: number
  /** Adds text color and text background pickers. */
  colors?: boolean
  /** Adds a block type select: paragraph or heading 1–6. */
  headings?: boolean
  /** Adds a font size select. */
  fontSizes?: boolean
  /** Adds an embed button for YouTube, Vimeo and Google Maps players. */
  embeds?: boolean
}

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const
type HeadingLevel = (typeof HEADING_LEVELS)[number]
const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "30px", "36px"]
// Select values must be strings; these stand for "no heading" and "no size set".
const PARAGRAPH = "paragraph"
const DEFAULT_SIZE = "default"

/** Compact select for the toolbar (block type, font size). */
function ToolbarSelect({
  label,
  value,
  items,
  disabled,
  onChange,
  className,
}: {
  label: string
  value: string
  items: { value: string; label: string }[]
  disabled?: boolean
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <Select items={items} value={value} onValueChange={(next) => next && onChange(next)} disabled={disabled}>
      <SelectTrigger size="sm" aria-label={label} title={label} className={cn("border-transparent shadow-none", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const IMAGE_FORMATS = "JPEG, JPG, PNG, WEBP, GIF"
const DEFAULT_IMAGE_MAX_SIZE = 2 * 1024 * 1024

function ToolbarToggle({
  icon: Icon,
  label,
  pressed,
  disabled,
  onPress,
}: {
  icon: LucideIcon
  label: string
  pressed?: boolean
  disabled?: boolean
  onPress: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Toggle
            size="sm"
            pressed={pressed ?? false}
            disabled={disabled}
            onPressedChange={onPress}
            aria-label={label}
            className="aria-pressed:bg-accent aria-pressed:text-accent-foreground"
          />
        }
      >
        <Icon />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** A one-shot action (undo, redo), as opposed to an on/off format toggle. */
function ToolbarButton({
  icon: Icon,
  label,
  disabled,
  busy,
  onClick,
}: {
  icon: LucideIcon
  label: string
  disabled?: boolean
  /** Shows a spinner in place of the icon. */
  busy?: boolean
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button type="button" variant="ghost" size="icon-sm" disabled={disabled} onClick={onClick} aria-label={label} />}
      >
        {busy ? <Loader2 className="animate-spin" /> : <Icon />}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** Accepts "example.com", "https://…", "mailto:…"; returns a normalized href or null. */
function normalizeUrl(input: string) {
  const text = input.trim()
  if (!text) return null
  const withProtocol = /^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`
  try {
    const url = new URL(withProtocol)
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function LinkControl({ editor, active, disabled }: { editor: Editor; active: boolean; disabled?: boolean }) {
  const t = useTranslations("Inputs")
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [error, setError] = useState(false)

  const apply = () => {
    const href = normalizeUrl(url)
    if (!href) return setError(true)
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run()
    setOpen(false)
  }

  const remove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setUrl((editor.getAttributes("link").href as string | undefined) ?? "")
          setError(false)
        }
        setOpen(next)
      }}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Toggle
                  size="sm"
                  pressed={active}
                  disabled={disabled}
                  aria-label={t("link")}
                  className="aria-pressed:bg-accent aria-pressed:text-accent-foreground"
                />
              }
            />
          }
        >
          <Link2 />
        </TooltipTrigger>
        <TooltipContent>{t("link")}</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-72">
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation() // don't submit the page's form
            apply()
          }}
        >
          <Input
            dir="ltr"
            autoFocus
            value={url}
            placeholder="https://"
            aria-label={t("linkUrl")}
            aria-invalid={error || undefined}
            onChange={(event) => {
              setUrl(event.target.value)
              setError(false)
            }}
          />
          {error && <p className="text-destructive text-xs">{t("linkInvalid")}</p>}
          <div className="flex justify-end gap-2">
            {active && (
              <Button type="button" variant="ghost" size="sm" onClick={remove}>
                <Unlink data-icon="inline-start" />
                {t("removeLink")}
              </Button>
            )}
            <Button type="submit" size="sm">
              {t("applyLink")}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

// Brand ink and red first, then a small general palette. Background swatches are light
// tints so dark text on them stays readable.
const TEXT_COLORS = ["#050505", "#B9383A", "#6B7280", "#DC2626", "#EA580C", "#CA8A04", "#16A34A", "#0D9488", "#2563EB", "#7C3AED", "#DB2777"]
const BACKGROUND_COLORS = ["#F8F8F8", "#F6E4E4", "#E5E7EB", "#FEE2E2", "#FFEDD5", "#FEF9C3", "#DCFCE7", "#CCFBF1", "#DBEAFE", "#EDE9FE", "#FCE7F3"]

/** Swatch grid plus a custom color picker, for text color or text background. */
function ColorControl({
  icon: Icon,
  label,
  colors,
  current,
  disabled,
  onPick,
  onClear,
}: {
  icon: LucideIcon
  label: string
  colors: string[]
  /** The selection's color, shown as a bar under the icon. */
  current?: string
  disabled?: boolean
  onPick: (color: string) => void
  onClear: () => void
}) {
  const t = useTranslations("Inputs.color")
  const [open, setOpen] = useState(false)
  const pick = (color: string) => {
    onPick(color)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={<Button type="button" variant="ghost" size="icon-sm" disabled={disabled} aria-label={label} />}
            />
          }
        >
          <span className="flex flex-col items-center gap-0.5">
            <Icon className="size-3.5" />
            <span
              aria-hidden
              className="h-0.75 w-4 rounded-full border border-black/10"
              style={{ backgroundColor: current ?? "transparent" }}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-56">
        <div className="grid grid-cols-6 gap-1.5">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => pick(color)}
              aria-label={color}
              title={color}
              aria-pressed={current?.toLowerCase() === color.toLowerCase()}
              className="focus-visible:ring-ring aria-pressed:ring-primary size-7 rounded-md border border-black/10 outline-none focus-visible:ring-2 aria-pressed:ring-2 aria-pressed:ring-offset-1"
              style={{ backgroundColor: color }}
            />
          ))}
          <label
            title={t("custom")}
            className="focus-within:ring-ring relative flex size-7 cursor-pointer items-center justify-center overflow-hidden rounded-md border focus-within:ring-2"
            style={{ background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }}
          >
            <span className="sr-only">{t("custom")}</span>
            <input
              type="color"
              className="absolute inset-0 cursor-pointer opacity-0"
              value={current?.startsWith("#") && current.length === 7 ? current : "#000000"}
              onChange={(event) => onPick(event.target.value)}
            />
          </label>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start"
          onClick={() => {
            onClear()
            setOpen(false)
          }}
        >
          <Eraser data-icon="inline-start" />
          {t("clear")}
        </Button>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Tiptap rich text editor with a compact toolbar (bold, italic, underline,
 * strike, lists, link, undo/redo). Controlled: pass HTML in, get HTML out.
 * Opt in to `sourceEditing` for an HTML code view, `onImageUpload` for
 * resizable, positionable images, `embeds` for video and map players, `colors`
 * for text and background colors, `headings` for H1–H6 and `fontSizes` for a size select.
 */
export function RichTextEditor({
  value,
  onChange,
  onBlur,
  id,
  placeholder,
  maxLength,
  dir,
  disabled,
  invalid,
  className,
  "aria-describedby": describedBy,
  "aria-labelledby": labelledBy,
  sourceEditing,
  onImageUpload,
  imageMaxSize = DEFAULT_IMAGE_MAX_SIZE,
  colors,
  headings,
  fontSizes,
  embeds,
}: RichTextEditorProps) {
  const t = useTranslations("Inputs")
  const fileSize = useFileSize()
  const [sourceMode, setSourceMode] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    // Render on the client only, so server and client HTML always match.
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: headings ? { levels: [...HEADING_LEVELS] } : false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
      CharacterCount.configure({ limit: maxLength ?? null }),
      ...(colors || fontSizes ? [TextStyle] : []),
      ...(colors ? [Color, BackgroundColor] : []),
      ...(fontSizes ? [FontSize] : []),
      ...(onImageUpload
        ? [
            // Images can be positioned (float left/right, center) from a menu over the selected image.
            PositionedImage.configure({
              // Uploads may come back as data: URLs (the mock backend does this).
              allowBase64: true,
              resize: {
                enabled: true,
                directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
                minWidth: 48,
                minHeight: 48,
                alwaysPreserveAspectRatio: true,
              },
            }),
          ]
        : []),
      ...(embeds ? [Embed] : []),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "rich-text min-h-28 px-3 py-2 outline-none",
        role: "textbox",
        "aria-multiline": "true",
        ...(id && { id }),
        ...(dir && { dir }),
        ...(labelledBy && { "aria-labelledby": labelledBy }),
        ...(describedBy && { "aria-describedby": describedBy }),
        ...(invalid && { "aria-invalid": "true" }),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    onBlur: () => onBlur?.(),
  })

  // Toolbar state, re-read only when the editor's state changes.
  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor && {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strike: editor.isActive("strike"),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        link: editor.isActive("link"),
        color: editor.getAttributes("textStyle").color as string | undefined,
        backgroundColor: editor.getAttributes("textStyle").backgroundColor as string | undefined,
        fontSize: editor.getAttributes("textStyle").fontSize as string | undefined,
        heading: HEADING_LEVELS.find((level) => editor.isActive("heading", { level })),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
        characters: editor.storage.characterCount.characters() as number,
      },
  })

  // Accept outside changes (form reset, data loaded) without echoing them back.
  // While the HTML view is open the code is the source of truth; the editor catches up on return.
  useEffect(() => {
    if (!editor || sourceMode) return
    const current = editor.isEmpty ? "" : editor.getHTML()
    if (value !== current) editor.commands.setContent(value || "", { emitUpdate: false })
  }, [editor, value, sourceMode])

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [editor, disabled])

  const run = (command: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) => () => {
    if (editor) command(editor.chain().focus()).run()
  }

  const toggleSource = () => {
    if (editor && sourceMode) {
      editor.commands.setContent(value || "", { emitUpdate: false })
      // Store what the editor kept: tags and attributes it doesn't support are dropped.
      const html = editor.isEmpty ? "" : editor.getHTML()
      if (html !== value) onChange(html)
    }
    setSourceMode(!sourceMode)
  }

  const insertImage = async (file: File) => {
    if (!editor || !onImageUpload) return
    if (!IMAGE_TYPES.includes(file.type)) {
      return toast.error(t("image.invalidType", { name: file.name, formats: IMAGE_FORMATS }))
    }
    if (file.size > imageMaxSize) {
      return toast.error(t("image.tooLarge", { name: file.name, size: fileSize(imageMaxSize) }))
    }
    setUploading(true)
    try {
      const src = await onImageUpload(file)
      insertBlock(editor, { type: "image", attrs: { src, alt: "" } })
    } catch {
      toast.error(t("image.uploadError"))
    } finally {
      setUploading(false)
    }
  }

  // Formatting is unavailable while the HTML view is open.
  const formatDisabled = disabled || sourceMode

  return (
    <div
      data-invalid={invalid || undefined}
      className={cn(
        "border-input dark:bg-input/30 flex w-full flex-col overflow-hidden rounded-lg border bg-transparent transition-colors",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-3",
        "data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40 data-invalid:ring-3",
        disabled && "opacity-50",
        className
      )}
    >
      <div role="toolbar" aria-label={t("toolbar")} className="flex flex-wrap items-center gap-0.5 border-b p-1">
        {sourceEditing && (
          <>
            <ToolbarToggle icon={CodeXml} label={t("editHtml")} pressed={sourceMode} disabled={disabled} onPress={toggleSource} />
            <Separator orientation="vertical" className="mx-1 h-5 data-[orientation=vertical]:self-center" />
          </>
        )}
        {headings && (
          <ToolbarSelect
            label={t("blockType")}
            value={state?.heading ? String(state.heading) : PARAGRAPH}
            items={[
              { value: PARAGRAPH, label: t("paragraph") },
              ...HEADING_LEVELS.map((level) => ({ value: String(level), label: t("heading", { level }) })),
            ]}
            disabled={formatDisabled}
            onChange={(next) =>
              editor
                ?.chain()
                .focus()
                .setNode(next === PARAGRAPH ? "paragraph" : "heading", next === PARAGRAPH ? {} : { level: Number(next) as HeadingLevel })
                .run()
            }
            className="w-28"
          />
        )}
        {fontSizes && (
          <ToolbarSelect
            label={t("fontSize")}
            value={state?.fontSize && FONT_SIZES.includes(state.fontSize) ? state.fontSize : DEFAULT_SIZE}
            items={[
              { value: DEFAULT_SIZE, label: t("defaultSize") },
              ...FONT_SIZES.map((size) => ({ value: size, label: size.replace("px", "") })),
            ]}
            disabled={formatDisabled}
            onChange={(next) =>
              next === DEFAULT_SIZE
                ? editor?.chain().focus().unsetFontSize().run()
                : editor?.chain().focus().setFontSize(next).run()
            }
            className="w-24"
          />
        )}
        {(headings || fontSizes) && (
          <Separator orientation="vertical" className="mx-1 h-5 data-[orientation=vertical]:self-center" />
        )}
        <ToolbarToggle icon={Bold} label={t("bold")} pressed={state?.bold} disabled={formatDisabled} onPress={run((c) => c.toggleBold())} />
        <ToolbarToggle icon={Italic} label={t("italic")} pressed={state?.italic} disabled={formatDisabled} onPress={run((c) => c.toggleItalic())} />
        <ToolbarToggle icon={Underline} label={t("underline")} pressed={state?.underline} disabled={formatDisabled} onPress={run((c) => c.toggleUnderline())} />
        <ToolbarToggle icon={Strikethrough} label={t("strike")} pressed={state?.strike} disabled={formatDisabled} onPress={run((c) => c.toggleStrike())} />
        {colors && (
          <>
            <ColorControl
              icon={Baseline}
              label={t("color.text")}
              colors={TEXT_COLORS}
              current={state?.color}
              disabled={formatDisabled}
              onPick={(color) => editor?.chain().focus().setColor(color).run()}
              onClear={() => editor?.chain().focus().unsetColor().run()}
            />
            <ColorControl
              icon={Highlighter}
              label={t("color.background")}
              colors={BACKGROUND_COLORS}
              current={state?.backgroundColor}
              disabled={formatDisabled}
              onPick={(color) => editor?.chain().focus().setBackgroundColor(color).run()}
              onClear={() => editor?.chain().focus().unsetBackgroundColor().run()}
            />
          </>
        )}
        <Separator orientation="vertical" className="mx-1 h-5 data-[orientation=vertical]:self-center" />
        <ToolbarToggle icon={List} label={t("bulletList")} pressed={state?.bulletList} disabled={formatDisabled} onPress={run((c) => c.toggleBulletList())} />
        <ToolbarToggle icon={ListOrdered} label={t("orderedList")} pressed={state?.orderedList} disabled={formatDisabled} onPress={run((c) => c.toggleOrderedList())} />
        <Separator orientation="vertical" className="mx-1 h-5 data-[orientation=vertical]:self-center" />
        {editor && <LinkControl editor={editor} active={state?.link ?? false} disabled={formatDisabled} />}
        {onImageUpload && (
          <>
            <ToolbarButton
              icon={ImagePlus}
              busy={uploading}
              label={uploading ? t("image.uploading") : t("image.insert")}
              disabled={formatDisabled || uploading}
              onClick={() => fileInput.current?.click()}
            />
            <input
              ref={fileInput}
              type="file"
              accept={IMAGE_TYPES.join(",")}
              hidden
              tabIndex={-1}
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = "" // so picking the same file again still fires
                if (file) insertImage(file)
              }}
            />
          </>
        )}
        {embeds && editor && <EmbedControl editor={editor} disabled={formatDisabled} />}
        <div className="ms-auto flex items-center gap-0.5">
          <ToolbarButton icon={Undo2} label={t("undo")} disabled={formatDisabled || !state?.canUndo} onClick={run((c) => c.undo())} />
          <ToolbarButton icon={Redo2} label={t("redo")} disabled={formatDisabled || !state?.canRedo} onClick={run((c) => c.redo())} />
        </div>
      </div>
      {/* Kept mounted (just hidden) in HTML view so undo history survives the round trip. */}
      <EditorContent editor={editor} hidden={sourceMode} />
      {(onImageUpload || embeds) && editor && !sourceMode && <MediaPositionMenu editor={editor} />}
      {sourceMode && (
        <CodeEditor
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          minHeight="7rem"
          maxHeight="28rem"
          disabled={disabled}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          className="rounded-none border-0 focus-within:ring-0"
        />
      )}
      {maxLength !== undefined && !sourceMode && (
        <div className="text-muted-foreground px-3 pb-2 text-end text-xs tabular-nums">
          {/* Numbers read "78 / 300" in both languages. */}
          <span dir="ltr">{t("characters", { count: state?.characters ?? 0, limit: maxLength })}</span>
        </div>
      )}
    </div>
  )
}
