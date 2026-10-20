import {
  PORTFOLIO_OPT_IN_TOPIC,
  PORTFOLIO_TOPIC_PREFIX,
  REPO_CATEGORY_TOPIC,
  REPO_TIER_TOPIC,
  RepoCategory,
  RepoTier,
} from "../constants";
import { type GitHubRepo, mapRepo } from "../mappers/repo.mapper";
import type { Repo, RepoListing } from "../types/repo.type";

const CATEGORY_BY_TOPIC: ReadonlyMap<string, RepoCategory> = new Map(
  Object.values(RepoCategory).map((category) => [
    REPO_CATEGORY_TOPIC[category],
    category,
  ]),
);

const TIER_BY_TOPIC: ReadonlyMap<string, RepoTier> = new Map(
  Object.values(RepoTier).map((tier) => [REPO_TIER_TOPIC[tier], tier]),
);

const KNOWN_TOPICS = new Set<string>([
  PORTFOLIO_OPT_IN_TOPIC,
  ...CATEGORY_BY_TOPIC.keys(),
  ...TIER_BY_TOPIC.keys(),
]);

export type RepoClassification =
  | { kind: "published"; repo: Repo }
  | { kind: "ignored" }
  | { kind: "warned"; warning: string };

/**
 * The owner publishes a repository by tagging it with the portfolio opt-in
 * topic. Private repositories are rejected even when tagged: the site is
 * public, so everything it builds is exposed.
 */
function isPublishedRepo(githubRepo: GitHubRepo): boolean {
  return (
    !githubRepo.private &&
    (githubRepo.topics ?? []).includes(PORTFOLIO_OPT_IN_TOPIC)
  );
}

/**
 * Places one repository in the portfolio or explains why it stays out.
 * A repository the owner did not publish never stops the build; a published
 * repository whose classification is missing, duplicated or unknown throws.
 */
export function classifyRepo(githubRepo: GitHubRepo): RepoClassification {
  const topics = githubRepo.topics ?? [];
  const controlTopics = topics.filter((topic) =>
    topic.startsWith(PORTFOLIO_TOPIC_PREFIX),
  );

  if (!isPublishedRepo(githubRepo)) {
    if (topics.includes(PORTFOLIO_OPT_IN_TOPIC)) {
      return {
        kind: "warned",
        warning: `Repository "${githubRepo.name}" carries ${PORTFOLIO_OPT_IN_TOPIC} but is private, so it is not published.`,
      };
    }

    if (controlTopics.length === 0) {
      return { kind: "ignored" };
    }

    return {
      kind: "warned",
      warning: `Repository "${githubRepo.name}" carries the control topics ${formatTopics(controlTopics)} but not ${PORTFOLIO_OPT_IN_TOPIC}, so it is not published.`,
    };
  }

  const unknownTopics = controlTopics.filter(
    (topic) => !KNOWN_TOPICS.has(topic),
  );

  if (unknownTopics.length > 0) {
    throw new Error(
      `Repository "${githubRepo.name}" carries unknown control topics: ${formatTopics(unknownTopics)}.`,
    );
  }

  const tiers = Object.values(RepoTier).filter((tier) =>
    topics.includes(REPO_TIER_TOPIC[tier]),
  );

  if (tiers.length > 1) {
    throw new Error(
      `Repository "${githubRepo.name}" carries more than one tier topic: ${formatTopics(tiers.map((tier) => REPO_TIER_TOPIC[tier]))}.`,
    );
  }

  const categories = Object.values(RepoCategory).filter((category) =>
    topics.includes(REPO_CATEGORY_TOPIC[category]),
  );
  const [category] = categories;

  if (category === undefined) {
    throw new Error(
      `Repository "${githubRepo.name}" is published but carries no category topic.`,
    );
  }

  if (categories.length > 1) {
    throw new Error(
      `Repository "${githubRepo.name}" carries more than one category topic: ${formatTopics(categories.map((value) => REPO_CATEGORY_TOPIC[value]))}.`,
    );
  }

  return {
    kind: "published",
    repo: mapRepo(githubRepo, category, tiers[0] ?? RepoTier.Project),
  };
}

/**
 * Classifies a whole listing: the repositories to publish and the
 * misconfigurations that do not stop the build.
 */
export function classifyRepos(githubRepos: GitHubRepo[]): RepoListing {
  const publishedRepos: Repo[] = [];
  const warnings: string[] = [];

  for (const githubRepo of githubRepos) {
    const classification = classifyRepo(githubRepo);

    if (classification.kind === "published") {
      publishedRepos.push(classification.repo);
    } else if (classification.kind === "warned") {
      warnings.push(classification.warning);
    }
  }

  return { repos: publishedRepos, warnings };
}

function formatTopics(topics: string[]): string {
  return topics.join(", ");
}
