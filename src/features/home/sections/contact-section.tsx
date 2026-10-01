import { Reveal } from "@/components/ui/reveal";
import { contactSection } from "@/content/home";
import { ContactForm } from "@/features/contact/contact-form";

export function ContactSection() {
  return (
    <section id="contact" className="bg-texture px-gutter pb-[clamp(48px,5cqw,80px)] pt-[clamp(88px,11cqw,176px)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-start gap-[clamp(48px,7cqw,128px)]">
        <Reveal className="flex flex-col gap-7">
          <h2 className="m-0 max-w-[13ch] text-balance text-[clamp(40px,5cqw,80px)] font-medium leading-[1.02] tracking-[-0.04em]">
            {contactSection.title}
          </h2>
          <p className="m-0 max-w-[32ch] text-pretty text-[clamp(18px,1.5cqw,22px)] leading-normal text-fog-400">
            {contactSection.lead}
          </p>
        </Reveal>
        <ContactForm submitLabel={contactSection.submitLabel} />
      </div>
    </section>
  );
}
