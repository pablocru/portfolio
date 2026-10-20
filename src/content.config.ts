import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { createGitHubClient } from "./clients/github.client";
import { RepoCategory, RepoTier } from "./constants";
import { githubReposLoader } from "./loaders/github-repos";
import { getRepoListing } from "./services/github.service";

const repos = defineCollection({
  loader: githubReposLoader(() => getRepoListing(createGitHubClient())),
  schema: z.object({
    name: z.string(),
    description: z.string().nullable(),
    language: z.string().nullable(),
    url: z.string(),
    archived: z.boolean(),
    pushedAt: z.string().nullable(),
    category: z.enum(RepoCategory),
    tier: z.enum(RepoTier),
  }),
});

export const collections = { repos };
