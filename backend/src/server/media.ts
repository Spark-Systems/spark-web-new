import { randomBytes } from "node:crypto";
import sharp, { type Sharp } from "sharp";

import type { UploadedImage } from "@/types/cms";
import { HttpError } from "@/server/http/respond";
import { storage } from "@/server/storage";

/** Vercel caps request bodies at 4.5 MB, so uploads stay under that everywhere. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Longest side of a stored picture; larger uploads are scaled down. */
const MAX_DIMENSION = 2400;
const WEBP_QUALITY = 82;

/** Formats accepted, detected from the file's contents (never its name or claimed type). */
const RASTER_FORMATS = new Set(["jpeg", "png", "webp", "gif", "avif", "tiff"]);

const FOLDER_PATTERN = /^[a-z0-9-]{1,40}$/;

/** "Our Work (final).PNG" → "our-work-final" */
const baseName = (name: string) =>
  name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "image";

const uniqueName = (name: string, extension: string) => `${baseName(name)}-${randomBytes(4).toString("hex")}.${extension}`;

/**
 * SVGs can carry scripts. They're only accepted without scripts, event
 * handlers, javascript: links or embedded HTML.
 */
function assertSafeSvg(svg: string) {
  if (!/<svg[\s>]/i.test(svg)) throw new HttpError(415, "This file isn't a valid SVG", "bad_svg");
  if (/<script|<foreignObject|\son[a-z]+\s*=|javascript:|<iframe|<embed|<object/i.test(svg)) {
    throw new HttpError(415, "SVGs with scripts or embedded content aren't allowed", "unsafe_svg");
  }
}

/** A tiny blurred copy for next/image's placeholder="blur", as a data URL. */
async function blurPreview(image: Sharp) {
  const { data, info } = await image
    .clone()
    .resize(10, 10, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer({ resolveWithObject: true });
  return { blurDataURL: `data:image/webp;base64,${data.toString("base64")}`, blurWidth: info.width, blurHeight: info.height };
}

/**
 * Validates and stores an uploaded picture under images/<folder>/. Photos and
 * other raster images are scaled to fit 2400px and saved as WebP with a blur
 * preview; SVGs are kept as they are. Returns the stored picture's details.
 */
export async function storeImage(body: Buffer, originalName: string, folder: string): Promise<UploadedImage> {
  if (!FOLDER_PATTERN.test(folder)) throw new HttpError(422, "Invalid upload folder", "bad_folder");
  if (body.length > MAX_UPLOAD_BYTES) throw new HttpError(413, "The file is larger than 4 MB", "too_large");

  const head = body.subarray(0, 512).toString("utf8").trimStart();
  if (head.startsWith("<svg") || head.startsWith("<?xml")) {
    const svg = body.toString("utf8");
    assertSafeSvg(svg);
    const meta = await sharp(body).metadata().catch(() => null);
    if (!meta?.width || !meta.height) throw new HttpError(415, "This SVG has no size (add width/height or a viewBox)", "bad_svg");
    const src = await storage().saveFile(`images/${folder}/${uniqueName(originalName, "svg")}`, body, "image/svg+xml");
    return { src, width: meta.width, height: meta.height };
  }

  const meta = await sharp(body).metadata().catch(() => null);
  if (!meta?.format || !RASTER_FORMATS.has(meta.format)) {
    throw new HttpError(415, "Upload a JPEG, PNG, WebP, GIF, AVIF or SVG image", "unsupported_type");
  }

  const animated = (meta.pages ?? 1) > 1;
  const image = sharp(body, { animated })
    .rotate() // apply the camera's orientation before EXIF is stripped
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true });
  const { data, info } = await image.clone().webp({ quality: WEBP_QUALITY }).toBuffer({ resolveWithObject: true });
  const blur = await blurPreview(image);
  const src = await storage().saveFile(`images/${folder}/${uniqueName(originalName, "webp")}`, data, "image/webp");
  return { src, width: info.width, height: animated ? (info.pageHeight ?? info.height) : info.height, ...blur };
}
