import { ParallaxImage } from "@/components/blocks/parallax-image";
import { Icon } from "@/components/ui/icon";
import { SmartLink } from "@/components/ui/smart-link";
import { projectHref } from "@/content/work";
import type { ProjectSummary } from "@/types/work";

/** Portfolio card: parallax image with a category badge, then the name with an arrow that grows and turns on hover. */
export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <SmartLink href={projectHref(project)} className="group flex flex-col gap-3.5 text-snow hover:text-snow">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-surface">
        <ParallaxImage image={project.image} strength={40} sizes="(min-width: 960px) 50vw, 100vw" />
        <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-xs text-snow backdrop-blur-sm">
          {project.category}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <h3 className="m-0 text-[clamp(22px,1.9cqw,28px)] font-medium tracking-[-0.02em]">{project.name}</h3>
        <span className="flex size-11 flex-none items-center justify-center rounded-full bg-brand text-white transition-[scale,background-color] duration-500 ease-spark group-hover:scale-130 group-hover:bg-brand-bright">
          <Icon
            name="arrow-up-right"
            size={20}
            className="transition-transform duration-500 ease-spark group-hover:rotate-45"
          />
        </span>
      </div>
      <p className="m-0 max-w-[42ch] text-[15px] leading-normal text-fog-400">{project.summary}</p>
    </SmartLink>
  );
}
