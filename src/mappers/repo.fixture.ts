import { CATEGORIES, categoryTopic } from "../config/categories";
import { type TierId, tierTopic } from "../config/tiers";
import type { GitHubRepo } from "./repo.mapper";

/** The tier the GitHub fixture is published under. */
export const githubRepoTierId = "project" satisfies TierId;

/** One published repository as the GitHub API returns it. */
export const githubRepo = {
  name: "portfolio",
  description: "A window to my projects",
  language: "TypeScript",
  html_url: "https://github.com/pablocru/portfolio",
  archived: false,
  private: false,
  pushed_at: "2026-10-20T09:00:00Z",
  topics: [tierTopic(githubRepoTierId), categoryTopic(CATEGORIES[0].id)],
} satisfies GitHubRepo;
