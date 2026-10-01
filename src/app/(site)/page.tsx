import {
  AiSection,
  ClientsSection,
  ContactSection,
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
      <ContactSection />
    </>
  );
}
