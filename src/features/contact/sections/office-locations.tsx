import type { ContactPageData } from "@/types/contact";
import { OfficeLocator } from "../components/office-locator";

/** "Offices": the office list and live map (see <OfficeLocator />). */
export function OfficeLocations(props: ContactPageData["offices"]) {
  return <OfficeLocator {...props} />;
}
