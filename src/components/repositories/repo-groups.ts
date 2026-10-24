import { RepoCategory, RepoTier } from "../../constants";
import type { PortfolioRepo } from "../../types/repo.type";
import { comparePortfolioRepos } from "../../utils/repo-order.util";

type CategoryGroupId = "web" | "data" | "cloud-devops";

export type RepoGroupId = "featured" | CategoryGroupId | "lab";

export type RepoGroupLabel = RepoTier | RepoCategory;

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
  includes: (portfolioRepo: PortfolioRepo) => boolean;
  warning: string;
};

const CATEGORY_GROUP_ID: Record<RepoCategory, CategoryGroupId> = {
  [RepoCategory.Web]: "web",
  [RepoCategory.Data]: "data",
  [RepoCategory.CloudDevOps]: "cloud-devops",
};

const GROUP_DEFINITIONS: GroupDefinition[] = [
  {
    id: "featured",
    label: RepoTier.Featured,
    includes: (portfolioRepo) => portfolioRepo.tier === RepoTier.Featured,
    warning: `The "${RepoTier.Featured}" group has no repository; its section is omitted.`,
  },
  ...Object.values(RepoCategory).map(
    (category): GroupDefinition => ({
      id: CATEGORY_GROUP_ID[category],
      label: category,
      includes: (portfolioRepo) =>
        portfolioRepo.tier === RepoTier.Project &&
        portfolioRepo.category === category,
      warning: `Category "${category}" has no project-tier repository; its section is omitted.`,
    }),
  ),
  {
    id: "lab",
    label: RepoTier.Lab,
    includes: (portfolioRepo) => portfolioRepo.tier === RepoTier.Lab,
    warning: `The "${RepoTier.Lab}" group has no repository; its section is omitted.`,
  },
];

/**
 * Splits the repositories included in the portfolio into the sections of the
 * page. The tier wins over the category, so every repository belongs to exactly
 * one group. Empty groups are left out and reported; with no repository at all
 * the page shows its empty state instead of a list of empty sections.
 */
export function groupRepos(portfolioRepos: PortfolioRepo[]): RepoGrouping {
  if (portfolioRepos.length === 0) {
    return { groups: [], warnings: [] };
  }

  const warnings: string[] = [];
  const groups: RepoGroup[] = [];

  for (const definition of GROUP_DEFINITIONS) {
    const groupedRepos = portfolioRepos
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
