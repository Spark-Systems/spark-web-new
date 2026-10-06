import aws from "@/assets/images/partners/aws.svg";
import microsoft from "@/assets/images/partners/microsoft.svg";
import type { AboutPageData } from "@/types/about";
import { clients } from "./home";
import { contactContent, stockPhoto as photo } from "./shared";

/** Static About page content, in the exact shape the content API will return. */
export const aboutPage: AboutPageData = {
  seo: {
    title: "About",
    description:
      "Since 2008 Spark Systems has built software, web, mobile and cloud platforms that governments, events and enterprises across the Middle East depend on every day.",
  },

  hero: {
    eyebrow: "About Spark Systems",
    titleLines: ["Software that", "holds,", "since 2008."],
    image: { src: photo(13068366), alt: "" },
  },

  intro: {
    statement:
      "For 18+ years we've built software, web, mobile and cloud platforms that governments, events and enterprises depend on every day, from New Cairo, Sheikh Zayed, Riyadh and Dubai.",
    stats: [
      { value: 18, suffix: "+", label: "years building software" },
      { value: 600, suffix: "+", label: "projects delivered" },
      { value: 100, suffix: "+", label: "organisations served" },
      { value: 4, label: "offices across 3 countries" },
    ],
  },

  mvv: {
    title: "Shaping the future of digital design",
    steps: [
      {
        id: "mission",
        kind: "statement",
        label: "Mission",
        eyebrow: "Our mission",
        text: "Intelligent solutions that work from day one, and every day after.",
        image: { src: photo(13068366), alt: "Modern office interior with black furniture and pendant lights" },
      },
      {
        id: "vision",
        kind: "statement",
        label: "Vision",
        eyebrow: "Our vision",
        text: "A trusted digital partner, empowering businesses through technology and design that create lasting impact.",
        image: { src: photo(946312), alt: "Modern office building with glass windows" },
      },
      {
        id: "values",
        kind: "values",
        label: "Values",
        eyebrow: "Our values",
        values: [
          { title: "Always delivered", body: "What we ship holds under real pressure." },
          { title: "Built to think", body: "Every solution predicts, recommends and answers." },
          { title: "Straight answers", body: "Honest about what it takes, from day one." },
        ],
        image: { src: photo(5918384), alt: "Colleagues working together in a modern office" },
      },
    ],
  },

  story: {
    eyebrow: "Our story",
    title: "Eighteen years, one standard",
    milestones: [
      {
        year: "2008",
        icon: "flag",
        title: "Founded in Cairo",
        body: "Spark Systems starts as a small engineering team building custom software for enterprises in Egypt.",
      },
      {
        year: "20XX",
        tbc: true,
        icon: "bank",
        title: "First national platform",
        body: "A government platform goes live for millions of users and sets the standard for everything after it.",
      },
      {
        year: "20XX",
        tbc: true,
        icon: "map-pin",
        title: "Riyadh office",
        body: "We move closer to our Saudi clients as work grows across ticketing, events and public services.",
      },
      {
        year: "20XX",
        tbc: true,
        icon: "ticket",
        title: "Events at scale",
        body: "Ticketing and accreditation for some of the region's largest seasons, venues and sporting clubs.",
      },
      {
        year: "20XX",
        tbc: true,
        icon: "globe",
        title: "Dubai office",
        body: "A fourth office extends our reach into the UAE.",
      },
      {
        year: "20XX",
        tbc: true,
        icon: "sparkle",
        title: "AI in every product",
        body: "AI becomes part of every platform we ship: prediction, recommendation and plain-language answers.",
      },
      {
        year: "2026",
        icon: "trophy",
        title: "600+ projects",
        body: "Four offices, three countries and over a hundred organisations depending on what we build.",
      },
    ],
  },

  clients: {
    eyebrow: "Trusted by",
    title: "Over a hundred organisations since 2008",
    logos: clients,
  },

  partnerships: {
    eyebrow: "Partnerships",
    title: "Spark Systems partnered with AWS and Azure for secure solutions.",
    partners: [
      { name: "Amazon Web Services", label: "Partner", logo: { src: aws, alt: "Amazon Web Services" }, invert: true },
      { name: "Microsoft Azure", label: "Partner", logo: { src: microsoft, alt: "Microsoft Azure" } },
    ],
  },

  contact: contactContent,
};
