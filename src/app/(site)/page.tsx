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
import { getHomePage } from "@/lib/api/pages";

export default async function HomePage() {
  const page = await getHomePage();

  return (
    <>
      <HeroSection {...page.hero} />
      <SolutionsSection {...page.solutions} />
      <ServicesSection {...page.services} />
      <ClientsSection {...page.clients} />
      <WorkSection {...page.work} />
      <TestimonialsSection {...page.testimonials} />
      <AiSection {...page.ai} />
      <ContactSection content={page.contact} />
    </>
  );
}
