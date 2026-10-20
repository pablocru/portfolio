import type { RestEndpointMethodTypes } from "@octokit/rest";
import type { RepoCategory, RepoTier } from "../constants";
import type { Repo } from "../types/repo.type";

export type GitHubRepo = Pick<
  RestEndpointMethodTypes["repos"]["listForUser"]["response"]["data"][number],
  | "name"
  | "description"
  | "language"
  | "html_url"
  | "archived"
  | "private"
  | "topics"
  | "pushed_at"
>;

/**
 * Maps the GitHub payload to the portfolio repository. The caller decides
 * whether the repository is published and which category and tier it has.
 */
export function mapRepo(
  githubRepo: GitHubRepo,
  category: RepoCategory,
  tier: RepoTier,
): Repo {
  return {
    name: githubRepo.name,
    description: githubRepo.description?.trim() || null,
    language: githubRepo.language ?? null,
    url: githubRepo.html_url,
    archived: githubRepo.archived ?? false,
    pushedAt: githubRepo.pushed_at ?? null,
    category,
    tier,
  };
}
