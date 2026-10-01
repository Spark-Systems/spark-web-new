import Image from "next/image";
import logoWhite from "@/assets/images/brand/spark-logo-white.svg";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, preload }: { className?: string; preload?: boolean }) {
  return (
    <Image
      src={logoWhite}
      alt={siteConfig.name}
      preload={preload}
      unoptimized
      className={cn("block h-[clamp(22px,2cqw,30px)] w-auto", className)}
    />
  );
}
