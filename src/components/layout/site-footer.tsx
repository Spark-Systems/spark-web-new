import type { ReactNode } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { PartnerBadge } from "@/components/ui/partner-badge";
import { SmartLink } from "@/components/ui/smart-link";
import { companyNav, contactCta, routes } from "@/config/site";
import { cn } from "@/lib/utils";
import type { Office } from "@/types/contact";
import type { SiteLayoutData } from "@/types/layout";
import { FooterParallax, FooterSlogan } from "./footer-motion";

function FooterColumn({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-3.5", className)}>
      <span className="text-xs tracking-[0.04em] text-fog-700">{title}</span>
      {children}
    </div>
  );
}

const linkClass = "text-fog-200 transition-colors hover:text-brand-bright";

/** "Cairo (HQ), Egypt" */
const officeLabel = (o: Office) => `${o.city}${o.hq ? " (HQ)" : ""}, ${o.country}`;

/**
 * Site footer. On mobile it slims down: the solutions list and offices are
 * hidden, company links sit in two columns, and a big "Let's Talk" button
 * takes the offices' place.
 */
export function SiteFooter({ company, footer, solutions, offices, partners, socials }: SiteLayoutData) {
  return (
    <FooterParallax className="bg-texture px-gutter flex min-h-[clamp(500px,100vh,1100px)] flex-col justify-center gap-[clamp(48px,6cqw,96px)] border-t border-white/8 pb-8 pt-[clamp(56px,6cqw,96px)] text-fog-400 will-change-transform">
      <FooterSlogan text={footer.slogan} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-[clamp(24px,4cqw,64px)] gap-y-12">
        <div className="flex flex-col gap-5">
          <BrandLogo className="h-[26px] self-start" />
          <p className="max-w-[30ch] text-sm leading-relaxed text-fog-500">{footer.blurb}</p>
        </div>

        <FooterColumn title="Solutions" className="max-md:hidden">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {solutions.map((s) => (
              <SmartLink
                key={s.slug}
                href={s.hasDetail ? routes.solution(s.slug) : routes.solutions}
                className={linkClass}
              >
                {s.name}
              </SmartLink>
            ))}
          </div>
        </FooterColumn>

        <FooterColumn title="Company">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm md:flex md:flex-col">
            {companyNav.map((item) => (
              <SmartLink
                key={item.label}
                href={item.href}
                // On mobile "Contact" is covered by the "Let's Talk" button.
                className={cn(linkClass, item.label === "Contact" && "max-md:hidden")}
              >
                {item.label}
              </SmartLink>
            ))}
          </div>
        </FooterColumn>

        <FooterColumn title="Offices" className="max-md:hidden">
          <address className="flex flex-col gap-2.5 text-sm not-italic text-fog-200">
            {offices.map((office) => (
              <span key={office.id}>{officeLabel(office)}</span>
            ))}
            <a href={`mailto:${company.email}`} className={`${linkClass} mt-1.5`}>
              {company.email}
            </a>
          </address>
        </FooterColumn>

        {/* Mobile only: replaces the offices column. */}
        <div className="flex flex-col gap-3 md:hidden">
          <SmartLink
            href={contactCta.href}
            className="flex items-center justify-center whitespace-nowrap rounded-full border-2 border-brand px-7 py-8 text-[clamp(30px,9vw,56px)] font-bold uppercase leading-none tracking-[0.08em] text-white transition-colors hover:bg-brand"
          >
            Let&apos;s Talk
          </SmartLink>
          <a href={`mailto:${company.email}`} className={cn(linkClass, "self-center text-sm")}>
            {company.email}
          </a>
        </div>
      </div>

      <div className="mt-[clamp(48px,5cqw,80px)] flex flex-wrap items-center justify-between gap-5 border-t border-white/8 pt-6">
        <div className="flex flex-wrap gap-2">
          {partners.map((partner) => (
            <PartnerBadge key={partner.name} partner={partner} size="sm" />
          ))}
        </div>
        <div className="flex flex-wrap gap-5 text-[13px]">
          {socials.map((link) => (
            <SmartLink key={link.label} href={link.href} className="text-fog-400 transition-colors hover:text-brand-bright">
              {link.label}
            </SmartLink>
          ))}
        </div>
        <span className="text-[13px] text-fog-600">
          © {company.name}, est. {company.foundedYear}
        </span>
      </div>
    </FooterParallax>
  );
}
