import { contactContent } from "@/content/shared";
import { ContactSection } from "@/features/contact";
import {
  AiSection,
  ClientsSection,
  HeroSection,
  ServicesSection,
  SolutionsSection,
  TestimonialsSection,
  WorkSection,
} from "@/features/home";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SolutionsSection />
      <ServicesSection />
      <ClientsSection />
      <WorkSection />
      <TestimonialsSection />
      <AiSection />
      <ContactSection content={contactContent} />
    </>
  );
}
