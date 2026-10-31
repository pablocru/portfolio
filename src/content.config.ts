import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { createGitHubClient } from "./clients/github.client";
import { CATEGORIES } from "./config/categories";
import { RepoTier } from "./constants";
import { githubReposLoader } from "./loaders/github-repos";
import { getPortfolioRepos } from "./services/portfolio.service";

const repos = defineCollection({
  loader: githubReposLoader(() => getPortfolioRepos(createGitHubClient())),
  schema: z.object({
    name: z.string(),
    description: z.string().nullable(),
    language: z.string().nullable(),
    url: z.string(),
    archived: z.boolean(),
    pushedAt: z.string().nullable(),
    category: z.enum(CATEGORIES.map((category) => category.id)),
    tier: z.enum(RepoTier),
  }),
});

export const collections = { repos };
