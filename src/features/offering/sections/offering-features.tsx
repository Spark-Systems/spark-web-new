import type { OfferingDetail } from "@/types/offering";
import { FeatureScroller } from "../components/feature-scroller";

/** "What it does": features scrolling past a pinned, crossfading image. */
export function OfferingFeatures(props: OfferingDetail["features"]) {
  return (
    <section className="bg-texture px-gutter py-[clamp(96px,11cqw,176px)]">
      <FeatureScroller {...props} />
    </section>
  );
}
