import type { RestEndpointMethodTypes } from "@octokit/rest";
import { PORTFOLIO_TOPIC } from "../constants";
import type { Repo } from "../types/repo.type";

type GitHubRepo = Pick<
  RestEndpointMethodTypes["repos"]["listForUser"]["response"]["data"][number],
  | "name"
  | "description"
  | "language"
  | "html_url"
  | "archived"
  | "private"
  | "topics"
>;

/**
 * Private repositories are rejected on purpose: the site is public, so
 * everything it builds is exposed.
 */
export function isPortfolioRepo(repo: GitHubRepo): boolean {
  return !repo.private && (repo.topics ?? []).includes(PORTFOLIO_TOPIC);
}

export function mapRepo(repo: GitHubRepo): Repo {
  return {
    name: repo.name,
    description: repo.description?.trim() || null,
    language: repo.language ?? null,
    url: repo.html_url,
    archived: repo.archived ?? false,
  };
}
