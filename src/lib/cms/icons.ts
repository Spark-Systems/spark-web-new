import type { IconName } from "@/types/content";

/**
 * Icons content can pick (features, process steps, milestones, services,
 * solutions). The rest of the <Icon> set is UI chrome: arrows, socials.
 */
export const contentIcons = [
  "armchair",
  "bank",
  "chart-bar",
  "chart-line-up",
  "cloud",
  "code",
  "cube",
  "cursor-click",
  "device-mobile",
  "flag",
  "flow-arrow",
  "globe",
  "handshake",
  "identification-badge",
  "identification-card",
  "layout",
  "magnifying-glass",
  "map-pin",
  "paint-brush",
  "pen-nib",
  "plugs-connected",
  "qr-code",
  "scan",
  "shield-check",
  "shopping-cart",
  "sparkle",
  "storefront",
  "ticket",
  "tree-structure",
  "trophy",
  "truck",
] as const satisfies readonly IconName[];

export type ContentIcon = (typeof contentIcons)[number];
