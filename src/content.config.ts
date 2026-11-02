import { defineCollection } from "astro:content";
import { createGitHubClient } from "./clients/github.client";
import { githubReposLoader } from "./loaders/github-repos";
import { repoSchema } from "./loaders/repo.schema";
import { getPortfolioRepos } from "./services/portfolio.service";

const repos = defineCollection({
  loader: githubReposLoader(() => getPortfolioRepos(createGitHubClient())),
  schema: repoSchema,
});

export const collections = { repos };
