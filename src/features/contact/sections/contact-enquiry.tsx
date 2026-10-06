import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow } from "@/components/ui/typography";
import type { ContactPageData } from "@/types/contact";
import { EnquiryForm } from "../components/enquiry-form";

/** "Start a project": lead, email and socials on the left, the sentence-style form on the right. Anchored at `#contact`. */
export function ContactEnquiry({ eyebrow, lead, emailPrompt, email, socials, form }: ContactPageData["enquiry"]) {
  return (
    <section id="contact" className="bg-texture px-gutter py-[clamp(88px,11cqw,176px)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-stretch gap-[clamp(48px,7cqw,128px)]">
        <Reveal className="flex flex-col justify-between gap-12">
          <div className="flex flex-col gap-6">
            <Eyebrow className="text-brand-bright">{eyebrow}</Eyebrow>
            <p className="m-0 max-w-[22ch] text-pretty text-[clamp(22px,2cqw,30px)] font-medium leading-[1.35] tracking-[-0.02em]">
              {lead}
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] text-fog-600">{emailPrompt}</span>
              <a
                href={`mailto:${email}`}
                className="self-start text-[clamp(22px,2cqw,30px)] font-medium tracking-[-0.025em] text-snow transition-colors hover:text-brand-bright"
              >
                {email}
              </a>
            </div>
            <div className="flex gap-2.5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-12 items-center justify-center rounded-full border border-white/20 text-snow transition-[background-color,border-color,transform] duration-[300ms,300ms,500ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:-rotate-8 hover:border-brand hover:bg-brand hover:text-white"
                >
                  <Icon name={social.icon} size={20} />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={120} className="min-w-0">
          <EnquiryForm copy={form} />
        </Reveal>
      </div>
    </section>
  );
}
