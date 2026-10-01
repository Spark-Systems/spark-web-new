import { Reveal } from "@/components/ui/reveal";
import { aiCapabilities, aiSection } from "@/content/home";
import { AiScene } from "../components/ai-scene";

export function AiSection() {
  return (
    <AiScene
      capabilities={aiCapabilities}
      heading={
        <>
          <Reveal
            as="h2"
            className="m-0 text-balance text-[clamp(36px,min(5.6cqw,9vh),88px)] font-medium leading-none tracking-[-0.04em] text-snow"
          >
            {aiSection.title}
          </Reveal>
          <Reveal
            as="p"
            delay={120}
            className="m-0 text-pretty text-[clamp(22px,2.4cqw,36px)] leading-[1.3] tracking-[-0.02em] text-lavender-100"
          >
            {aiSection.lead}
          </Reveal>
        </>
      }
    />
  );
}
