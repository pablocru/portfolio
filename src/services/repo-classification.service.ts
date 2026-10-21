import {
  PORTFOLIO_OPT_IN_TOPIC,
  PORTFOLIO_TOPIC_PREFIX,
  REPO_CATEGORY_TOPIC,
  REPO_TIER_TOPIC,
  RepoCategory,
  RepoTier,
} from "../constants";
import type { GitHubRepo } from "../mappers/repo.mapper";

const KNOWN_TOPICS = new Set<string>([
  PORTFOLIO_OPT_IN_TOPIC,
  ...Object.values(REPO_CATEGORY_TOPIC),
  ...Object.values(REPO_TIER_TOPIC),
]);

type PublicationDecision =
  | { kind: "published" }
  | { kind: "ignored" }
  | { kind: "warned"; warning: string };

type RepoClassification =
  | { kind: "published"; category: RepoCategory; tier: RepoTier }
  | { kind: "ignored" }
  | { kind: "warned"; warning: string };

/**
 * Places one repository in the portfolio or explains why it stays out.
 * A repository the owner did not publish never stops the build; a published
 * repository whose classification is missing, duplicated or unknown throws.
 */
export function classifyRepo(githubRepo: GitHubRepo): RepoClassification {
  const publication = decidePublication(githubRepo);

  if (publication.kind !== "published") {
    return publication;
  }

  const topics = githubRepo.topics ?? [];
  const unknownTopics = topics.filter(
    (topic) =>
      topic.startsWith(PORTFOLIO_TOPIC_PREFIX) && !KNOWN_TOPICS.has(topic),
  );

  if (unknownTopics.length > 0) {
    throw new Error(
      `Repository "${githubRepo.name}" carries unknown control topics: ${formatTopics(unknownTopics)}.`,
    );
  }

  return {
    kind: "published",
    category: resolveCategory(githubRepo, topics),
    tier: resolveTier(githubRepo, topics),
  };
}

/**
 * The owner publishes a repository by tagging it with the portfolio opt-in
 * topic. Private repositories are rejected even when tagged: the site is
 * public, so everything it builds is exposed.
 */
function decidePublication(githubRepo: GitHubRepo): PublicationDecision {
  if (isPublishedRepo(githubRepo)) {
    return { kind: "published" };
  }

  const topics = githubRepo.topics ?? [];
  const controlTopics = topics.filter((topic) =>
    topic.startsWith(PORTFOLIO_TOPIC_PREFIX),
  );

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

function isPublishedRepo(githubRepo: GitHubRepo): boolean {
  return (
    !githubRepo.private &&
    (githubRepo.topics ?? []).includes(PORTFOLIO_OPT_IN_TOPIC)
  );
}

function resolveCategory(
  githubRepo: GitHubRepo,
  topics: string[],
): RepoCategory {
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

  return category;
}

function resolveTier(githubRepo: GitHubRepo, topics: string[]): RepoTier {
  const tiers = Object.values(RepoTier).filter((tier) =>
    topics.includes(REPO_TIER_TOPIC[tier]),
  );

  if (tiers.length > 1) {
    throw new Error(
      `Repository "${githubRepo.name}" carries more than one tier topic: ${formatTopics(tiers.map((tier) => REPO_TIER_TOPIC[tier]))}.`,
    );
  }

  return tiers[0] ?? RepoTier.Project;
}

function formatTopics(topics: string[]): string {
  return topics.join(", ");
}
