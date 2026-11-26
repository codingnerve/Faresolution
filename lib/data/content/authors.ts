import type { Author } from "../types";

// Editorial personas for the demonstration site. Bios describe what each
// persona covers and make no claims about credentials, employers or experience.
export const authors: Author[] = [
  {
    slug: "priya-raman",
    name: "Priya Raman",
    role: "Software research editor",
    bio: "Writes the category explainers and comparison write-ups on Faresolution, with a focus on how to read a feature list critically and what to ask a vendor before you sign.",
    avatar: {
      src: "/images/authors/priya-raman.webp",
      alt: "Abstract geometric avatar for Priya Raman.",
    },
  },
  {
    slug: "daniel-whitfield",
    name: "Daniel Whitfield",
    role: "Buying guides editor",
    bio: "Edits the step-by-step buying guides and checklists, covering how to shortlist, trial and roll out business software without over-buying.",
    avatar: {
      src: "/images/authors/daniel-whitfield.webp",
      alt: "Abstract geometric avatar for Daniel Whitfield.",
    },
  },
  {
    slug: "elena-marchetti",
    name: "Elena Marchetti",
    role: "Data and methodology editor",
    bio: "Maintains how product facts are recorded on Faresolution, including what counts as verified, how gaps are shown and how the sample data is labelled.",
    avatar: {
      src: "/images/authors/elena-marchetti.webp",
      alt: "Abstract geometric avatar for Elena Marchetti.",
    },
  },
];
