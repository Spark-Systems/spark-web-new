import type { ReactNode } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { PartnerBadge } from "@/components/ui/partner-badge";
import { SmartLink } from "@/components/ui/smart-link";
import { companyNav, offices, partners, siteConfig, socialLinks, solutionNames } from "@/config/site";
import { footerContent } from "@/content/home";
import { FooterParallax, FooterSlogan } from "./footer-motion";

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3.5">
      <span className="text-xs tracking-[0.04em] text-fog-700">{title}</span>
      {children}
    </div>
  );
}

const linkClass = "text-fog-200 transition-colors hover:text-brand-bright";

export function SiteFooter() {
  return (
    <FooterParallax className="bg-texture px-gutter flex min-h-[clamp(500px,100vh,1100px)] flex-col justify-center gap-[clamp(48px,6cqw,96px)] border-t border-white/8 pb-8 pt-[clamp(56px,6cqw,96px)] text-fog-400 will-change-transform">
      <FooterSlogan text={footerContent.slogan} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-[clamp(24px,4cqw,64px)] gap-y-12">
        <div className="flex flex-col gap-5">
          <BrandLogo className="h-[26px] self-start" />
          <p className="max-w-[30ch] text-sm leading-relaxed text-fog-500">{footerContent.blurb}</p>
        </div>

        <FooterColumn title="Solutions">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {solutionNames.map((name) => (
              <a key={name} href="#" className={linkClass}>
                {name}
              </a>
            ))}
          </div>
        </FooterColumn>

        <FooterColumn title="Company">
          <div className="flex flex-col gap-2.5 text-sm">
            {companyNav.map((item) => (
              <SmartLink key={item.label} href={item.href} className={linkClass}>
                {item.label}
              </SmartLink>
            ))}
          </div>
        </FooterColumn>

        <FooterColumn title="Offices">
          <address className="flex flex-col gap-2.5 text-sm not-italic text-fog-200">
            {offices.map((office) => (
              <span key={office}>{office}</span>
            ))}
            <a href={`mailto:${siteConfig.email}`} className={`${linkClass} mt-1.5`}>
              {siteConfig.email}
            </a>
          </address>
        </FooterColumn>
      </div>

      <div className="mt-[clamp(48px,5cqw,80px)] flex flex-wrap items-center justify-between gap-5 border-t border-white/8 pt-6">
        <div className="flex flex-wrap gap-2">
          {partners.map((partner) => (
            <PartnerBadge key={partner.name} partner={partner} size="sm" />
          ))}
        </div>
        <div className="flex flex-wrap gap-5 text-[13px]">
          {socialLinks.map((link) => (
            <SmartLink key={link.label} href={link.href} className="text-fog-400 transition-colors hover:text-brand-bright">
              {link.label}
            </SmartLink>
          ))}
        </div>
        <span className="text-[13px] text-fog-600">
          © {siteConfig.name}, est. {siteConfig.foundedYear}
        </span>
      </div>
    </FooterParallax>
  );
}
