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

type UnpublishedDecision =
  | { kind: "ignored" }
  | { kind: "warned"; warning: string };

type PublicationDecision = { kind: "published" } | UnpublishedDecision;

type RepoClassification =
  | { kind: "published"; category: RepoCategory; tier: RepoTier }
  | UnpublishedDecision;

type GitHubRepoTopics = {
  optIn: boolean;
  control: string[];
  unknown: string[];
  categories: RepoCategory[];
  tiers: RepoTier[];
};

/**
 * Places one repository in the portfolio or explains why it stays out.
 * A repository the owner did not publish never stops the build; a published
 * repository whose classification is missing, duplicated or unknown throws.
 */
export function classifyRepo(githubRepo: GitHubRepo): RepoClassification {
  const topics = readRepoTopics(githubRepo);
  const publication = decidePublication(githubRepo, topics);

  if (publication.kind !== "published") {
    return publication;
  }

  const { category, tier } = classifyPublishedRepo(githubRepo, topics);

  return { kind: "published", category, tier };
}

/**
 * Reads the topics once and separates the control topics from the vocabulary
 * values. It reports what the repository carries; the rules that act on them
 * live in the decision functions.
 */
function readRepoTopics(githubRepo: GitHubRepo): GitHubRepoTopics {
  const topics = githubRepo.topics ?? [];
  const control = topics.filter((topic) =>
    topic.startsWith(PORTFOLIO_TOPIC_PREFIX),
  );

  return {
    optIn: topics.includes(PORTFOLIO_OPT_IN_TOPIC),
    control,
    unknown: control.filter((topic) => !KNOWN_TOPICS.has(topic)),
    categories: Object.values(RepoCategory).filter((category) =>
      topics.includes(REPO_CATEGORY_TOPIC[category]),
    ),
    tiers: Object.values(RepoTier).filter((tier) =>
      topics.includes(REPO_TIER_TOPIC[tier]),
    ),
  };
}

/**
 * The owner publishes a repository by tagging it with the portfolio opt-in
 * topic. Private repositories are rejected even when tagged: the site is
 * public, so everything it builds is exposed.
 */
function decidePublication(
  githubRepo: GitHubRepo,
  topics: GitHubRepoTopics,
): PublicationDecision {
  if (!githubRepo.private && topics.optIn) {
    return { kind: "published" };
  }

  if (topics.optIn) {
    return {
      kind: "warned",
      warning:
        `Repository "${githubRepo.name}" carries ${PORTFOLIO_OPT_IN_TOPIC}` +
        " but is private, so it is not published.",
    };
  }

  return topics.control.length === 0
    ? { kind: "ignored" }
    : {
        kind: "warned",
        warning:
          `Repository "${githubRepo.name}" carries the control topics` +
          ` ${formatTopics(topics.control)} but not ${PORTFOLIO_OPT_IN_TOPIC},` +
          " so it is not published.",
      };
}

/**
 * Classifies a repository that already passed the publication gate: its
 * control topics must belong to the vocabulary and it needs exactly one
 * category and at most one tier.
 */
function classifyPublishedRepo(
  githubRepo: GitHubRepo,
  topics: GitHubRepoTopics,
): { category: RepoCategory; tier: RepoTier } {
  if (topics.unknown.length > 0) {
    throw new Error(
      `Repository "${githubRepo.name}" carries unknown control topics:` +
        ` ${formatTopics(topics.unknown)}.`,
    );
  }

  return {
    category: resolveCategory(githubRepo, topics.categories),
    tier: resolveTier(githubRepo, topics.tiers),
  };
}

function resolveCategory(
  githubRepo: GitHubRepo,
  categories: RepoCategory[],
): RepoCategory {
  const [category] = categories;

  if (category === undefined) {
    throw new Error(
      `Repository "${githubRepo.name}" is published but carries no category` +
        " topic.",
    );
  }

  if (categories.length > 1) {
    throw new Error(
      `Repository "${githubRepo.name}" carries more than one category topic:` +
        ` ${formatTopics(categories.map((value) => REPO_CATEGORY_TOPIC[value]))}.`,
    );
  }

  return category;
}

function resolveTier(githubRepo: GitHubRepo, tiers: RepoTier[]): RepoTier {
  if (tiers.length > 1) {
    throw new Error(
      `Repository "${githubRepo.name}" carries more than one tier topic:` +
        ` ${formatTopics(tiers.map((tier) => REPO_TIER_TOPIC[tier]))}.`,
    );
  }

  return tiers[0] ?? RepoTier.Project;
}

function formatTopics(topics: string[]): string {
  return topics.join(", ");
}
