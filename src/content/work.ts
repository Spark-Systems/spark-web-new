import accreditationImg from "@/assets/images/solutions/accreditation.png";
import distributionImg from "@/assets/images/solutions/distribution.png";
import governmentalImg from "@/assets/images/solutions/governmental.png";
import ticketingImg from "@/assets/images/solutions/ticketing.png";
import maakImg from "@/assets/images/work/maak.png";
import mfaImg from "@/assets/images/work/mfa.png";
import ourWorkImg from "@/assets/images/work/our-work.png";
import selaImg from "@/assets/images/work/sela.png";
import ticketmxImg from "@/assets/images/work/ticketmx.png";
import { routes } from "@/config/site";
import type { ProjectDetail, ProjectSummary, WorkPageData } from "@/types/work";
import { contactContent } from "./shared";

const project = (
  slug: string,
  name: string,
  category: string,
  summary: string,
  src: ProjectSummary["image"]["src"],
  hasDetail = false,
): ProjectSummary => ({ slug, name, category, summary, image: { src, alt: name }, hasDetail });

/** Every project in the portfolio, in display order. */
export const projectCatalog: ProjectSummary[] = [
  project("saudi-tickets", "Saudi Tickets", "Development", "The main ticketing platform for sports fans in Saudi Arabia.", ticketingImg, true),
  project("sela-super-app", "Sela Super App", "Mobile", "One app for tickets, events and loyalty across Sela venues.", selaImg),
  project("mfa-portal", "MFA Portal", "Development", "Consular and citizen services moved online.", mfaImg),
  project("maak", "Maak", "Mobile", "A consumer app built for daily use.", maakImg),
  project("ticketmx", "ticketMX", "Development", "Ticket sales storefront with live seat selection.", ticketmxImg),
  project("event-accreditation", "Event Accreditation", "Development", "Registration, vetting and badges for large events.", accreditationImg),
  project("distribution-orders", "Distribution & Orders", "Mobile", "Field ordering and delivery tracking for distributors.", distributionImg),
  project("government-services", "Government Services", "Development", "Citizen-facing portals built for national scale.", governmentalImg),
];

/** Where a project links: its case study when it has one, otherwise the contact form. */
export const projectHref = (p: Pick<ProjectSummary, "slug" | "hasDetail">) =>
  p.hasDetail ? routes.project(p.slug) : "#contact";

/** Static work overview content, in the exact shape the content API will return. */
export const workPage: WorkPageData = {
  seo: {
    title: "Work",
    description:
      "Selected work by Spark Systems: Saudi Tickets, Sela Super App, the MFA portal and more, built to hold under pressure.",
  },
  hero: {
    eyebrow: "Our work",
    titleLines: ["Work that", "holds under", "pressure."],
    image: { src: ourWorkImg, alt: "" },
  },
  portfolio: {
    eyebrow: "Portfolio",
    title: "Selected work.",
    allLabel: "Show all",
    items: projectCatalog,
  },
  featured: {
    eyebrow: "Case study",
    slug: "saudi-tickets",
    name: "Saudi Tickets",
    summary:
      "Saudi Tickets is the main ticketing platform in Saudi Arabia, providing more than one million tickets every year for sports fans.",
    ctaLabel: "Read the case study",
    stats: [
      { value: 18, suffix: "+", label: "years building software" },
      { value: 600, suffix: "+", label: "projects delivered" },
      { value: 100, suffix: "+", label: "organisations served" },
      { value: 1, suffix: "M+", label: "tickets a year on Saudi Tickets" },
    ],
  },
  contact: contactContent,
};

/** Case studies by slug. Only projects with `hasDetail` appear here. */
export const projectDetails: Record<string, ProjectDetail> = {
  "saudi-tickets": {
    slug: "saudi-tickets",
    seo: {
      title: "Saudi Tickets",
      description:
        "How Spark Systems built Saudi Tickets, the main ticketing platform in Saudi Arabia, issuing more than one million tickets every year.",
    },
    hero: {
      eyebrow: "Case study / Development",
      titleLines: ["Saudi", "Tickets."],
      image: { src: ticketingImg, alt: "" },
    },
    facts: [
      { label: "Client", value: "Saudi Tickets" },
      { label: "Sector", value: "Sports ticketing" },
      { label: "Services", value: "Development, Cloud" },
      { label: "Launched", value: "2019" },
    ],
    statement:
      "Saudi Tickets is the main ticketing platform in Saudi Arabia, providing more than one million tickets every year for sports fans.",
    showcase: { src: ticketingImg, alt: "Saudi Tickets platform" },
    story: [
      {
        title: "Challenge",
        body: "Sell and validate tickets for packed stadiums across the Kingdom, with demand that spikes the moment a big match goes on sale.",
      },
      {
        title: "Approach",
        body: "A cloud platform for web, app and box-office sales, live seat maps and gate scanning, scaled automatically on AWS.",
      },
      {
        title: "Outcome",
        body: "The main ticketing platform in Saudi Arabia, issuing more than one million tickets every year.",
      },
    ],
    features: {
      eyebrow: "Key features",
      title: "What the platform does.",
      items: [
        {
          title: "Web and app sales",
          body: "Fans buy tickets on the web or in the app, with a checkout built for on-sale peaks.",
          image: { src: ticketingImg, alt: "Web and app sales screen" },
        },
        {
          title: "Live seat maps",
          body: "Pick an exact seat on a live stadium map that updates as seats sell.",
          image: { src: ticketmxImg, alt: "Live seat map screen" },
        },
        {
          title: "Gate scanning",
          body: "Tickets are validated at the gate in seconds, even when the stadium is full.",
          image: { src: accreditationImg, alt: "Gate scanning screen" },
        },
        {
          title: "Organiser dashboard",
          body: "Organisers track sales, capacity and entry for every match in real time.",
          image: { src: ourWorkImg, alt: "Organiser dashboard screen" },
        },
      ],
    },
    gallery: {
      title: "Inside the platform.",
      items: [
        { image: { src: ticketingImg, alt: "Match listing and checkout" }, caption: "Match listing and checkout" },
        { image: { src: ticketmxImg, alt: "Live seat selection" }, caption: "Live seat selection" },
        { image: { src: accreditationImg, alt: "Gate scanning" }, caption: "Gate scanning" },
        { image: { src: ourWorkImg, alt: "Organiser dashboard" }, caption: "Organiser dashboard" },
      ],
    },
    devices: {
      eyebrow: "Across devices",
      title: "One product, every screen.",
      items: [
        { kind: "web", label: "Web", image: { src: ticketingImg, alt: "Saudi Tickets on the web" } },
        { kind: "mobile", label: "Mobile app", image: { src: ticketmxImg, alt: "Saudi Tickets mobile app" } },
        { kind: "tablet", label: "Tablet", image: { src: distributionImg, alt: "Saudi Tickets on a tablet" } },
        { kind: "pos", label: "Box office POS", image: { src: accreditationImg, alt: "Box office point of sale" } },
      ],
    },
    comparison: {
      eyebrow: "Before / after",
      title: "From the old experience to the new one.",
      hint: "Drag to compare",
      before: { src: ticketmxImg, alt: "The old ticketing experience" },
      after: { src: ticketingImg, alt: "The new Saudi Tickets experience" },
    },
    results: {
      eyebrow: "Results",
      headline: { value: 1, suffix: "M+", label: "tickets every year for sports fans" },
      builtOn: { eyebrow: "Built on", label: "Spark Ticketing", href: routes.solution("ticketing") },
      figures: [
        { label: "Peak tickets sold per minute" },
        { label: "Platform uptime" },
        { label: "Stadiums and venues" },
      ],
    },
    testimonial: {
      eyebrow: "Client words",
      quote: "Client quote goes here. One or two sentences on what the project changed for their team and their customers.",
      author: "Client name",
      role: "Role, Saudi Tickets",
      placeholder: true,
    },
    contact: contactContent,
  },
};
