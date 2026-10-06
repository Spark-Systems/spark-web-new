import { PillLink } from "@/components/ui/pill";
import type { HomeWorkSection } from "@/types/home";
import { WorkCard } from "../components/work-card";
import { WorkCarousel } from "../components/work-carousel";
import { WorkIntro } from "../components/work-intro";

export function WorkSection({ intro, title, cta, items: projects }: HomeWorkSection) {

  return (
    <section id="work" className="bg-texture text-snow">
      <WorkIntro {...intro} />

      <WorkCarousel title={title} count={projects.length}>
        {projects.map((project, i) => (
          <WorkCard key={project.title} project={project} index={i} />
        ))}
        <div className="flex h-[calc(var(--work-card-w)/1.6)] w-[clamp(240px,26cqw,420px)] flex-none items-center justify-center self-start">
          <PillLink href={cta.href}>
            {cta.label} <span>→</span>
          </PillLink>
        </div>
      </WorkCarousel>
    </section>
  );
}
