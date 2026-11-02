import { CATEGORIES } from "../config/categories";
import { DEFAULT_TIER_ID } from "../config/tiers";
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
    url: `https://github.com/pablocru/${name}`,
    archived: false,
    pushedAt: "2026-01-01T00:00:00Z",
    category: CATEGORIES[0].id,
    tier: DEFAULT_TIER_ID,
    ...overrides,
  };
}
