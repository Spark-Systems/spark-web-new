import "server-only";

import type {
  Application,
  CollectionKey,
  CollectionMap,
  Enquiry,
  InsightRecord,
  JobRecord,
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
  jobs: defineCollection<JobRecord>({ key: "jobs", idPrefix: "job", noun: "Role", title: (j) => j.title }),
  insights: defineCollection<InsightRecord>({
    key: "insights",
    idPrefix: "ins",
    noun: "Article",
    title: (a) => a.title,
    unique: ["slug"],
  }),
};

/** Messages from the website's contact form, newest last. */
export const enquiries = defineRecords<Enquiry>("enquiries", { label: "Enquiry", limit: 5000 });

/** Job applications from the careers page, newest last (CV files are stored separately, see server/applications). */
export const applications = defineRecords<Application>("applications", { label: "Application", limit: 5000 });
