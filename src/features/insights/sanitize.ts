/**
 * Cleans article HTML from the admin's rich text editor before it's rendered:
 * drops scripts, embeds, forms and styles, event-handler attributes and
 * `javascript:` links. Editors are trusted, so this is a safety net rather
 * than a full sanitizer.
 */
export function sanitizeArticleHtml(html: string) {
  return html
    .replace(/<(script|style|iframe|object|embed|form|template|noscript)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form|input|button|link|meta|base)\b[^>]*\/?>/gi, "")
    .replace(/\s(on[a-z]+|srcdoc|formaction)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src|xlink:href)\s*=\s*(["'])\s*(javascript|vbscript|data:text\/html)[^"']*\2/gi, '$1="#"');
}
