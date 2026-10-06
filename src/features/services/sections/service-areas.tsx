import type { ServicesPageData } from "@/types/services";
import { ServiceAreasScene } from "../components/service-areas-scene";

/** "Our services": the six service areas, stepped through on scroll (see <ServiceAreasScene />). */
export function ServiceAreas(props: ServicesPageData["areas"]) {
  return <ServiceAreasScene {...props} />;
}
