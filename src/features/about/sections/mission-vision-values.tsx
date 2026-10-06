import type { AboutPageData } from "@/types/about";
import { MvvScene } from "../components/mvv-scene";

/** Mission, vision and values, stepped through on scroll (see <MvvScene />). */
export function MissionVisionValues(props: AboutPageData["mvv"]) {
  return <MvvScene {...props} />;
}
