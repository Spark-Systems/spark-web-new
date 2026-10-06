import "server-only";

import type {
  CollectionKey,
  CollectionMap,
  Enquiry,
  LogoRecord,
  OfficeRecord,
  ProjectRecord,
  ServiceRecord,
  SolutionRecord,
} from "@/types/cms";
import { defineCollection, type Collection } from "./collection";
import { defineRecords } from "./records";

export { activityLog, logActivity } from "./activity";
export { DbError } from "./errors";
export type { Actor } from "./ids";
export { actOnPage, getPageDocument, readPage, savePage } from "./page";
export { readSettings, updateSettings } from "./settings";
export { users } from "./users";

/** The draft/publish lists, by API path. */
export const collections: { [K in CollectionKey]: Collection<CollectionMap[K]> } = {
  solutions: defineCollection<SolutionRecord>({
    key: "solutions",
    idPrefix: "sol",
    noun: "Solution",
    title: (s) => s.name,
    unique: ["slug"],
  }),
  services: defineCollection<ServiceRecord>({
    key: "services",
    idPrefix: "svc",
    noun: "Service",
    title: (s) => s.name,
    unique: ["slug"],
  }),
  projects: defineCollection<ProjectRecord>({
    key: "projects",
    idPrefix: "prj",
    noun: "Project",
    title: (p) => p.name,
    unique: ["slug"],
  }),
  clients: defineCollection<LogoRecord>({ key: "clients", idPrefix: "cli", noun: "Client", title: (c) => c.name }),
  partners: defineCollection<LogoRecord>({ key: "partners", idPrefix: "par", noun: "Partner", title: (p) => p.name }),
  offices: defineCollection<OfficeRecord>({ key: "offices", idPrefix: "off", noun: "Office", title: (o) => o.city }),
};

/** Messages from the website's contact form, newest last. */
export const enquiries = defineRecords<Enquiry>("enquiries", { label: "Enquiry", limit: 5000 });
