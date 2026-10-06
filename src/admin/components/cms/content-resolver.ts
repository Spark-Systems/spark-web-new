import { zodResolver } from "@hookform/resolvers/zod"
import type { FieldValues, Resolver } from "react-hook-form"
import { z } from "zod"

import { withPlaceholderImages } from "./images"

/**
 * react-hook-form resolver for the shared content schemas (lib/cms/schemas).
 * Pictures picked but not uploaded yet count as present, and on success the
 * form's own values come back (pending pictures included) so they can be
 * uploaded before saving.
 */
export function contentResolver<V extends FieldValues>(schema: z.ZodType): Resolver<V> {
  // The schema's output type is the saved record, not the form's values (which may hold pending pictures).
  const base = zodResolver(schema as z.ZodType<FieldValues, FieldValues>) as unknown as Resolver<V>
  return async (values, context, options) => {
    const result = await base(withPlaceholderImages(values), context, options)
    return Object.keys(result.errors).length > 0 ? result : { values, errors: {} }
  }
}

/**
 * Sets the language of zod's built-in messages (used by the shared schemas)
 * and words missing values as "Required".
 */
export function configureZodLocale(locale: string, requiredMessage: string) {
  z.config(locale === "ar" ? z.locales.ar() : z.locales.en())
  z.config({
    // Empty values (blank text, no picture picked, nothing chosen) all read "Required".
    customError: (issue) =>
      issue.input === undefined || issue.input === null || issue.input === "" ? requiredMessage : undefined,
  })
}
