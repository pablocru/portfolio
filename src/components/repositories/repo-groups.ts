import {
  CATEGORIES,
  type CategoryId,
  type CategoryLabel,
} from "../../config/categories";
import { RepoTier } from "../../constants";
import type { PortfolioRepo } from "../../types/repo.type";
import { comparePortfolioRepos } from "../../utils/repo-order.util";

export type RepoGroupId = "featured" | CategoryId | "lab";

export type RepoGroupLabel = RepoTier | CategoryLabel;

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

const GROUP_DEFINITIONS: GroupDefinition[] = [
  {
    id: "featured",
    label: RepoTier.Featured,
    includes: (repo) => repo.tier === RepoTier.Featured,
    warning: `The "${RepoTier.Featured}" group has no repository; its section is omitted.`,
  },
  ...CATEGORIES.map(
    (category): GroupDefinition => ({
      id: category.id,
      label: category.label,
      includes: (repo) =>
        repo.tier === RepoTier.Project && repo.category === category.id,
      warning: `Category "${category.label}" has no project-tier repository; its section is omitted.`,
    }),
  ),
  {
    id: "lab",
    label: RepoTier.Lab,
    includes: (repo) => repo.tier === RepoTier.Lab,
    warning: `The "${RepoTier.Lab}" group has no repository; its section is omitted.`,
  },
];

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
