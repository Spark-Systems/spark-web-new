import { PartnerBadge } from "@/components/ui/partner-badge";
import { Reveal } from "@/components/ui/reveal";
import { SmartLink } from "@/components/ui/smart-link";
import { Eyebrow, Tbc } from "@/components/ui/typography";
import { partners } from "@/config/site";
import { clients, clientsSection } from "@/content/home";
import { ClientOrbit } from "../components/client-orbit";
import { LogoWall } from "../components/logo-wall";

/**
 * Full-screen clients section: centred heading, client logos on half-circle
 * orbits around the Spark mark (a flipping logo grid on mobile), and the
 * "more clients" link with certified partners along the bottom.
 */
export function ClientsSection() {
  const { eyebrow, title, lead, moreLink, partnersLabel } = clientsSection;

  return (
    <section
      id="clients"
      className="bg-texture px-gutter flex min-h-[max(680px,100vh)] flex-col justify-between overflow-hidden pt-[clamp(56px,6cqw,96px)]"
    >
      <div className="mx-auto flex max-w-215 flex-col items-center gap-4 mb-8 text-center">
        <Reveal as="div">
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal
          as="h2"
          delay={100}
          className="m-0 text-balance text-[clamp(34px,4.4cqw,68px)] font-medium leading-[1.02] tracking-[-0.04em] text-snow"
        >
          <Tbc>{title}</Tbc>
        </Reveal>
        <Reveal
          as="p"
          delay={200}
          className="m-0 text-pretty text-[clamp(15px,1.25cqw,18px)] leading-relaxed text-fog-500"
        >
          <Tbc>{lead}</Tbc>
        </Reveal>
      </div>

      <div className="flex flex-1 flex-col justify-end">
        <div className="max-md:hidden">
          <ClientOrbit clients={clients} />
        </div>
        <div className="md:hidden">
          <LogoWall clients={clients} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6 border-t border-white/8 py-6">
        <SmartLink
          href={moreLink.href}
          className="inline-flex gap-2.5 text-[clamp(16px,1.3cqw,19px)] text-fog-300 transition-colors hover:text-brand-bright"
        >
          {moreLink.label} <span>→</span>
        </SmartLink>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5">
          <span className="text-xs tracking-[0.04em] text-fog-600">
            {partnersLabel}
          </span>
          <div className="flex flex-wrap gap-2.5">
            {partners.map((partner) => (
              <PartnerBadge key={partner.name} partner={partner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
