import Image from "next/image";
import { pillClassName } from "@/components/ui/pill";
import { SmartLink } from "@/components/ui/smart-link";
import { MonoLabel, TagList, Tbc } from "@/components/ui/typography";
import type { Project } from "@/types/content";

/** Project card in the horizontal work track. Width comes from --work-card-w. */
export function WorkCard({ project, index }: { project: Project; index: number }) {
  const Subtitle = project.subtitleTbc ? Tbc : "span";

  return (
    <SmartLink
      href={project.href}
      className="flex w-(--work-card-w) flex-none flex-col gap-[clamp(14px,1.4cqw,22px)] text-snow"
    >
      <div className="relative aspect-16/10 overflow-hidden rounded-card bg-surface-2">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(min-width: 760px) 52vw, 90vw"
          placeholder="blur"
          className="object-cover"
        />
        <span
          className={pillClassName(
            "glass",
            "absolute right-[clamp(14px,1.6cqw,24px)] top-[clamp(14px,1.6cqw,24px)]",
          )}
        >
          View project ↗
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <TagList tags={project.tags} />
        <MonoLabel className="text-fog-600">{String(index + 1).padStart(2, "0")}</MonoLabel>
      </div>

      <div className="flex flex-col items-start gap-[clamp(14px,1.4cqw,20px)]">
        <div className="flex min-w-0 flex-col gap-2">
          <h3 className="m-0 text-[clamp(26px,2.8cqw,46px)] font-medium leading-none tracking-[-0.04em]">
            {project.title}
          </h3>
          <Subtitle className="text-[clamp(15px,1.2cqw,18px)] text-fog-500">{project.subtitle}</Subtitle>
        </div>
        <div className="flex items-baseline gap-2 text-brand">
          <span className="text-[clamp(34px,3.4cqw,56px)] font-medium leading-[0.95] tracking-[-0.05em]">
            {project.metric.value}
          </span>
          <span className="text-[clamp(14px,1.1cqw,17px)] font-medium">{project.metric.label}</span>
        </div>
      </div>
    </SmartLink>
  );
}
