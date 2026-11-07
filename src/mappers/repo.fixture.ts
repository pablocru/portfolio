import { categoryTopic } from "../config/categories";
import { firstCategory } from "../config/categories.fixture";
import { neutralGitHubUrl } from "../config/portfolio.fixture";
import { type TierId, tierTopic } from "../config/tiers";
import { firstRequiredTier } from "../config/tiers.fixture";
import type { GitHubRepo } from "./repo.mapper";

/** The tier the GitHub fixture is published under. */
export const githubRepoTierId = firstRequiredTier().id satisfies TierId;

/** One published repository as the GitHub API returns it. */
export const githubRepo = {
  name: "portfolio",
  description: "A window to my projects",
  language: "TypeScript",
  html_url: neutralGitHubUrl("portfolio"),
  archived: false,
  private: false,
  pushed_at: "2026-10-20T09:00:00Z",
  topics: [tierTopic(githubRepoTierId), categoryTopic(firstCategory().id)],
} satisfies GitHubRepo;
