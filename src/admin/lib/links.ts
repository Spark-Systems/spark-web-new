/** Where a link opens: "_self" is the same tab, "_blank" a new tab. */
export const linkTargets = ["_self", "_blank"] as const
export type LinkTarget = (typeof linkTargets)[number]

export const isLinkTarget = (value: string): value is LinkTarget => linkTargets.includes(value as LinkTarget)

/**
 * A link the website can follow: a full http(s) address, or a path on the site
 * itself such as "/products". An empty string counts as "no link".
 */
export function isValidLink(value: string) {
  const link = value.trim()
  if (link === "") return true
  if (link.startsWith("/") && !link.startsWith("//")) return true
  try {
    return ["http:", "https:"].includes(new URL(link).protocol)
  } catch {
    return false
  }
}
