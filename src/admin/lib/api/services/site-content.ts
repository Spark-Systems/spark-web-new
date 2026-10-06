import { createResource } from "../resource"
import type { SiteService, SiteServiceInput, Solution, SolutionInput } from "../types"

/** Service areas (the website's /services). "Site services" keeps them apart from the API modules in this folder. */
export const siteServicesResource = createResource<SiteService, SiteServiceInput>("/services", "services")

/** Solutions catalogue (the website's /solutions). */
export const solutionsResource = createResource<Solution, SolutionInput>("/solutions", "solutions")
