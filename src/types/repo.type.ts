import type { CategoryId } from "../config/categories";
import type { TierId } from "../config/tiers";

/**
 * Repository included in the portfolio. It is a type alias, not an interface,
 * because Astro's content loader API requires the entries to be assignable to
 * `Record<string, unknown>`.
 */
export type PortfolioRepo = {
  name: string;
  description: string | null;
  language: string | null;
  url: string;
  archived: boolean;
  pushedAt: string | null;
  /**
   * Category of the repository. It is `null` only for tiers that do not
   * require a category (see `tierRequiresCategory`); those tiers may still
   * carry one.
   */
  category: CategoryId | null;
  tier: TierId;
};

/**
 * Repositories selected for the portfolio, plus the warnings about the GitHub
 * repositories that were left out or misconfigured.
 */
export type PortfolioRepoSelection = {
  repos: PortfolioRepo[];
  warnings: string[];
};
