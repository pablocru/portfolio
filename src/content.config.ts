import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { githubReposLoader } from "./loaders/github-repos";

const repos = defineCollection({
  loader: githubReposLoader(),
  schema: z.object({
    name: z.string(),
    description: z.string().nullable(),
    language: z.string().nullable(),
    url: z.string(),
    archived: z.boolean(),
  }),
});

export const collections = { repos };
