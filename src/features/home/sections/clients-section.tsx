import { PartnerBadge } from "@/components/ui/partner-badge";
import { SmartLink } from "@/components/ui/smart-link";
import type { HomeClientsSection } from "@/types/home";
import { LogoWall } from "@/components/blocks/logo-wall";

export function ClientsSection({ moreLink, partnersLabel, clients, partners }: HomeClientsSection) {

  return (
    <section className="bg-texture px-gutter pb-[clamp(56px,6cqw,96px)] pt-[clamp(88px,10cqw,160px)]">
      <LogoWall clients={clients} />

      <div className="mt-7">
        <SmartLink
          href={moreLink.href}
          className="inline-flex gap-2.5 text-[clamp(16px,1.3cqw,19px)] text-fog-300 transition-colors hover:text-brand-bright"
        >
          {moreLink.label} <span>→</span>
        </SmartLink>
      </div>

      <div className="mt-[clamp(48px,5cqw,80px)] flex flex-wrap items-center gap-x-6 gap-y-3.5 border-t border-white/8 pt-5">
        <span className="text-xs tracking-[0.04em] text-fog-600">{partnersLabel}</span>
        <div className="flex flex-wrap gap-2.5">
          {partners.map((partner) => (
            <PartnerBadge key={partner.name} partner={partner} />
          ))}
        </div>
      </div>
    </section>
  );
}
