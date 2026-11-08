import {
  CATEGORIES,
  type CategoryId,
  type CategoryLabel,
} from "../../config/categories";
import {
  type GroupedTierId,
  isGroupedTier,
  TIERS,
  type TierId,
  type TierLabel,
} from "../../config/tiers";
import type { PortfolioRepo } from "../../types/repo.type";
import { comparePortfolioRepos } from "../../utils/repo-order.util";

export type RepoGroupId = Exclude<TierId, GroupedTierId> | CategoryId;

export type RepoGroupLabel = TierLabel | CategoryLabel;

export type RepoGroup = {
  id: RepoGroupId;
  label: RepoGroupLabel;
  repos: PortfolioRepo[];
};

/**
 * Sections of the page, in render order, plus the groups that stayed empty.
 */
export type RepoGrouping = {
  groups: RepoGroup[];
  warnings: string[];
};

type GroupDefinition = {
  id: RepoGroupId;
  label: RepoGroupLabel;
  includes: (repo: PortfolioRepo) => boolean;
  warning: string;
};

const GROUP_DEFINITIONS: GroupDefinition[] = TIERS.flatMap(
  (tier): GroupDefinition[] =>
    isGroupedTier(tier)
      ? CATEGORIES.map(
          (category): GroupDefinition => ({
            id: category.id,
            label: category.label,
            includes: (repo) =>
              repo.tier === tier.id && repo.category === category.id,
            warning: `Category "${category.label}" has no ${tier.label.toLowerCase()}-tier repository; its section is omitted.`,
          }),
        )
      : [
          {
            id: tier.id,
            label: tier.label,
            includes: (repo) => repo.tier === tier.id,
            warning: `The "${tier.label}" group has no repository; its section is omitted.`,
          },
        ],
);

/**
 * Splits the repositories included in the portfolio into the sections of the
 * page. The tier wins over the category, so every repository belongs to exactly
 * one group. Empty groups are left out and reported; with no repository at all
 * every group is reported empty and the page shows its empty state.
 */
export function groupRepos(repos: PortfolioRepo[]): RepoGrouping {
  const warnings: string[] = [];
  const groups: RepoGroup[] = [];

  for (const definition of GROUP_DEFINITIONS) {
    const groupedRepos = repos
      .filter(definition.includes)
      .sort(comparePortfolioRepos);

    if (groupedRepos.length === 0) {
      warnings.push(definition.warning);
    } else {
      groups.push({
        id: definition.id,
        label: definition.label,
        repos: groupedRepos,
      });
    }
  }

  return { groups, warnings };
}
