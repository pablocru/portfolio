import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { Category, Tier } from "./constants";
import { githubReposLoader } from "./loaders/github-repos";

const repos = defineCollection({
  loader: githubReposLoader(),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    language: z.string().nullable(),
    pushedAt: z.coerce.date(),
    tier: z.enum(Object.values(Tier) as [Tier, ...Tier[]]),
    category: z
      .enum(Object.values(Category) as [Category, ...Category[]])
      .optional(),
    status: z.enum(["active", "archived"]),
    tags: z.array(z.string()),
    links: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
      }),
    ),
  }),
});

export const collections = {
  repos,
};
