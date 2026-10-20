import { RepoCategory, RepoTier } from "../constants";
import type { Repo } from "../types/repo.type";
import type {
  RepoGroup,
  RepoGroupId,
  RepoGrouping,
} from "../types/repo-group.type";

type GroupDefinition = {
  id: RepoGroupId;
  label: string;
  includes: (repo: Repo) => boolean;
  warning: string;
};

const CATEGORY_GROUP_ID: Record<RepoCategory, RepoGroupId> = {
  [RepoCategory.Web]: "web",
  [RepoCategory.Data]: "data",
  [RepoCategory.CloudDevOps]: "cloud-devops",
};

const GROUP_DEFINITIONS: GroupDefinition[] = [
  {
    id: "featured",
    label: RepoTier.Featured,
    includes: (repo) => repo.tier === RepoTier.Featured,
    warning: `The "${RepoTier.Featured}" group has no repository; its section is omitted.`,
  },
  ...Object.values(RepoCategory).map((category) => ({
    id: CATEGORY_GROUP_ID[category],
    label: category,
    includes: (repo: Repo) =>
      repo.tier === RepoTier.Project && repo.category === category,
    warning: `Category "${category}" has no project-tier repository; its section is omitted.`,
  })),
  {
    id: "lab",
    label: RepoTier.Lab,
    includes: (repo) => repo.tier === RepoTier.Lab,
    warning: `The "${RepoTier.Lab}" group has no repository; its section is omitted.`,
  },
];

/**
 * Splits the published repositories into the sections of the page. The tier
 * wins over the category, so every repository belongs to exactly one group.
 * Empty groups are left out and reported; with no repository at all the page
 * shows its empty state instead of a list of empty sections.
 */
export function groupRepos(repos: Repo[]): RepoGrouping {
  if (repos.length === 0) {
    return { groups: [], warnings: [] };
  }

  const warnings: string[] = [];
  const groups: RepoGroup[] = [];

  for (const definition of GROUP_DEFINITIONS) {
    const groupedRepos = repos.filter(definition.includes).sort(compareRepos);

    if (groupedRepos.length === 0) {
      warnings.push(definition.warning);
      continue;
    }

    groups.push({
      id: definition.id,
      label: definition.label,
      repos: groupedRepos,
    });
  }

  return { groups, warnings };
}

function compareRepos(firstRepo: Repo, secondRepo: Repo): number {
  if (firstRepo.archived !== secondRepo.archived) {
    return firstRepo.archived ? 1 : -1;
  }

  const pushedComparison = comparePushedAt(
    firstRepo.pushedAt,
    secondRepo.pushedAt,
  );

  return pushedComparison === 0
    ? firstRepo.name.localeCompare(secondRepo.name)
    : pushedComparison;
}

function comparePushedAt(
  firstPushedAt: string | null,
  secondPushedAt: string | null,
): number {
  if (firstPushedAt === secondPushedAt) {
    return 0;
  }

  if (firstPushedAt === null) {
    return 1;
  }

  if (secondPushedAt === null) {
    return -1;
  }

  return secondPushedAt.localeCompare(firstPushedAt);
}
