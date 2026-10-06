import { ADMIN_BASE } from "./auth/constants"

/** Admin page paths, so links and redirects agree with the route folders. */
export const adminPaths = {
  dashboard: `${ADMIN_BASE}/dashboard`,
  home: `${ADMIN_BASE}/pages/home`,
  about: `${ADMIN_BASE}/pages/about`,
  contact: `${ADMIN_BASE}/pages/contact`,
  layout: `${ADMIN_BASE}/pages/layout`,
  solutions: `${ADMIN_BASE}/solutions`,
  solutionsPage: `${ADMIN_BASE}/solutions/page`,
  services: `${ADMIN_BASE}/services`,
  servicesPage: `${ADMIN_BASE}/services/page`,
  work: `${ADMIN_BASE}/work`,
  workPage: `${ADMIN_BASE}/work/page`,
  clients: `${ADMIN_BASE}/clients`,
  partners: `${ADMIN_BASE}/partners`,
  offices: `${ADMIN_BASE}/offices`,
  enquiries: `${ADMIN_BASE}/enquiries`,
  activity: `${ADMIN_BASE}/activity`,
  users: `${ADMIN_BASE}/users`,
  profile: `${ADMIN_BASE}/profile`,
  configuration: `${ADMIN_BASE}/settings/configuration`,
} as const
