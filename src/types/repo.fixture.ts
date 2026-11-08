import { firstCategory } from "../config/categories.fixture";
import { neutralGitHubUrl } from "../config/portfolio.fixture";
import { firstRequiredTier } from "../config/tiers.fixture";
import type { PortfolioRepo } from "./repo.type";

/**
 * Builds one portfolio repository for the tests, with the defaults the sorting
 * and grouping cases share.
 */
export function portfolioRepo(
  name: string,
  overrides: Partial<PortfolioRepo> = {},
): PortfolioRepo {
  return {
    name,
    description: null,
    language: null,
    url: neutralGitHubUrl(name),
    archived: false,
    pushedAt: "2026-01-01T00:00:00Z",
    category: firstCategory().id,
    tier: firstRequiredTier().id,
    ...overrides,
  };
}
