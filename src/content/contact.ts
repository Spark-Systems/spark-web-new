import { siteConfig } from "@/config/site";
import type { ContactPageData } from "@/types/contact";
import { offices } from "./offices";
import { stockPhoto } from "./shared";

/** Static contact page content, in the exact shape the content API will return. */
export const contactPage: ContactPageData = {
  seo: {
    title: "Contact",
    description:
      "Talk to Spark Systems about your project. Offices in Cairo, Giza, Dubai and Riyadh, or write to us at info@spark-sys.com.",
  },
  hero: {
    eyebrow: "Contact",
    titleLines: ["Bring us", "the idea,", "we’ll build it."],
    image: { src: stockPhoto(13068366), alt: "" },
  },
  offices: {
    eyebrow: "Offices",
    items: offices,
  },
  enquiry: {
    eyebrow: "Start a project",
    lead: "Tell us where you're headed and we'll tell you honestly what it takes.",
    emailPrompt: "Prefer email?",
    email: siteConfig.email,
    socials: [
      { label: "Instagram", icon: "instagram", href: "https://www.instagram.com/spark.systems/" },
      { label: "LinkedIn", icon: "linkedin", href: "https://www.linkedin.com/company/sparksystems/" },
      { label: "X", icon: "x", href: "https://x.com/Spark_systems" },
      { label: "Facebook", icon: "facebook", href: "https://www.facebook.com/Spark.Systems" },
    ],
    form: {
      name: { prompt: "Hi Spark, my name is", placeholder: "your name" },
      company: { prompt: "I work at", placeholder: "company" },
      email: { prompt: "You can reach me at", placeholder: "email address" },
      message: { prompt: "I'd like to build", placeholder: "tell us about your project" },
      submitLabel: "Bring us the idea, we'll bring the solution.",
      successMessage: "Thanks. We will get back to you soon.",
      resetLabel: "Send another message",
    },
  },
};
