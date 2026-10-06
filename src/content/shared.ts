import type { ContactContent } from "@/types/content";

/** Stock photography (Pexels) by photo id; swap for Spark's own photos when available. */
export const stockPhoto = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`;

/** Contact section copy, shared by every page that ends with the enquiry form. */
export const contactContent: ContactContent = {
  title: "Let's talk about what you want to build.",
  lead: "Tell us where you're headed and we'll tell you honestly what it takes.",
  submitLabel: "Bring us the idea, we'll bring the solution.",
};
