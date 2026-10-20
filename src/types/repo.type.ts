import type { RepoCategory, RepoTier } from "../constants";

/**
 * Repository published in the portfolio. It is a type alias, not an interface,
 * because Astro's content loader API requires the entries to be assignable to
 * `Record<string, unknown>`.
 */
export type Repo = {
  name: string;
  description: string | null;
  language: string | null;
  url: string;
  archived: boolean;
  pushedAt: string | null;
  category: RepoCategory;
  tier: RepoTier;
};

/**
 * Outcome of one repository listing: the repositories the owner publishes and
 * the misconfigurations that do not stop the build.
 */
export type RepoListing = {
  repos: Repo[];
  warnings: string[];
};
