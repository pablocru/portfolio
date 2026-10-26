import type { PortfolioRepo } from "../types/repo.type";

export function comparePortfolioRepos(
  firstRepo: PortfolioRepo,
  secondRepo: PortfolioRepo,
): number {
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
