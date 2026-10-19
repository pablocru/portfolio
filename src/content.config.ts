import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { createGitHubClient } from "./clients/github.client";
import { githubReposLoader } from "./loaders/github-repos";
import { getRepos } from "./services/github.service";

const repos = defineCollection({
  loader: githubReposLoader(() => getRepos(createGitHubClient())),
  schema: z.object({
    name: z.string(),
    description: z.string().nullable(),
    language: z.string().nullable(),
    url: z.string(),
    archived: z.boolean(),
  }),
});

export const collections = { repos };
