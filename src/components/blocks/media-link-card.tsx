import { Icon } from "@/components/ui/icon";
import { SmartLink } from "@/components/ui/smart-link";
import type { ImageAsset } from "@/types/content";
import { ParallaxImage } from "./parallax-image";

interface MediaLinkCardProps {
  title: string;
  image: ImageAsset;
  href: string;
}

/** A linked card: parallax image above a title with an arrow (case studies, related work). */
export function MediaLinkCard({ title, image, href }: MediaLinkCardProps) {
  return (
    <SmartLink href={href} className="group flex flex-col gap-3.5 text-snow">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-surface">
        <ParallaxImage image={image} strength={40} sizes="(min-width: 760px) 33vw, 100vw" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <h3 className="m-0 text-[clamp(22px,1.9cqw,28px)] font-medium tracking-[-0.02em] transition-colors group-hover:text-brand-bright">
          {title}
        </h3>
        <Icon
          name="arrow-up-right"
          size={22}
          className="flex-none text-brand-bright transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>
    </SmartLink>
  );
}
