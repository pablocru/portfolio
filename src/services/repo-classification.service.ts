import {
  CATEGORIES,
  type CategoryId,
  categoryTopic,
} from "../config/categories";
import { PORTFOLIO_TOPIC_PREFIX } from "../config/portfolio";
import {
  TIER_TOPIC_PREFIX,
  TIERS,
  type TierId,
  tierRequiresCategory,
  tierTopic,
} from "../config/tiers";
import type { GitHubRepo } from "../mappers/repo.mapper";
import type { NullableCategoryId } from "../types/repo.type";

type UnpublishedDecision =
  | { kind: "ignored" }
  | { kind: "warned"; warning: string };

type RepoClassification =
  | { kind: "published"; category: NullableCategoryId; tier: TierId }
  | UnpublishedDecision;

type GitHubRepoTopics = {
  controlTopics: string[];
  tierTopics: string[];
  unknownControlTopics: string[];
  unknownTierTopics: string[];
  categories: CategoryId[];
  tiers: TierId[];
};

type ClassificationPart<T> =
  | { kind: "resolved"; value: T }
  | { kind: "fault"; message: string };

/**
 * Places one repository in the portfolio or explains why it stays out.
 * A repository the owner did not publish never stops the build: one that shows
 * no intent to publish is ignored or warned about, and a private one is warned
 * about even when its topics cannot be classified. A public repository that
 * shows an intent to publish and is missing, duplicating or unknown topics
 * throws one error reporting every fault.
 */
export function classifyRepo(githubRepo: GitHubRepo): RepoClassification {
  const repoTopics = readRepoTopics(githubRepo);

  if (
    repoTopics.tiers.length === 0 &&
    repoTopics.unknownTierTopics.length === 0
  ) {
    return repoTopics.controlTopics.length === 0
      ? { kind: "ignored" }
      : {
          kind: "warned",
          warning:
            `Repository "${githubRepo.name}" carries the control topics` +
            ` ${formatTopics(repoTopics.controlTopics)} but no tier topic,` +
            " so it is not published.",
        };
  }

  if (githubRepo.private) {
    return {
      kind: "warned",
      warning:
        `Repository "${githubRepo.name}" carries` +
        ` ${formatTopics(repoTopics.tierTopics)} but is private,` +
        " so it is not published.",
    };
  }

  const { category, tier } = classifyPublishedRepo(githubRepo, repoTopics);

  return { kind: "published", category, tier };
}

/**
 * Reads the topics once and separates the control topics from the vocabulary
 * values. It reports what the repository carries; the rules that act on them
 * live in the decision functions.
 */
function readRepoTopics(githubRepo: GitHubRepo): GitHubRepoTopics {
  const topics = githubRepo.topics ?? [];
  const controlTopics = topics.filter((topic) =>
    topic.startsWith(PORTFOLIO_TOPIC_PREFIX),
  );
  const tierTopics = controlTopics.filter((topic) =>
    topic.startsWith(TIER_TOPIC_PREFIX),
  );
  const knownTierTopicSet = new Set(TIERS.map((tier) => tierTopic(tier.id)));
  const unknownTierTopics = tierTopics.filter(
    (topic) => !knownTierTopicSet.has(topic),
  );

  return {
    controlTopics,
    tierTopics,
    unknownControlTopics: controlTopics.filter(
      (topic) =>
        !isKnownControlTopic(topic) && !unknownTierTopics.includes(topic),
    ),
    unknownTierTopics,
    categories: CATEGORIES.filter((category) =>
      topics.includes(categoryTopic(category.id)),
    ).map((category) => category.id),
    tiers: TIERS.filter((tier) => topics.includes(tierTopic(tier.id))).map(
      (tier) => tier.id,
    ),
  };
}

function isKnownControlTopic(topic: string): boolean {
  return (
    CATEGORIES.some((category) => topic === categoryTopic(category.id)) ||
    TIERS.some((tier) => topic === tierTopic(tier.id))
  );
}

/**
 * Classifies a public repository that carries a tier topic: its control topics
 * must belong to the vocabulary and it needs at most one tier. A category is
 * required only when the tier requires one. Every fault is collected before
 * throwing, so one build reveals all the topics the owner must fix.
 */
function classifyPublishedRepo(
  githubRepo: GitHubRepo,
  repoTopics: GitHubRepoTopics,
): { category: NullableCategoryId; tier: TierId } {
  const tier = resolveTier(repoTopics.tiers, repoTopics.unknownTierTopics);
  const category = resolveCategory(
    repoTopics.categories,
    tier.kind === "resolved" && tierRequiresCategory(tier.value),
  );
  const faults = [
    ...(repoTopics.unknownControlTopics.length > 0
      ? [
          "carries unknown control topics:" +
            ` ${formatTopics(repoTopics.unknownControlTopics)}`,
        ]
      : []),
    ...(category.kind === "fault" ? [category.message] : []),
    ...(tier.kind === "fault" ? [tier.message] : []),
  ];

  if (category.kind === "fault" || tier.kind === "fault" || faults.length > 0) {
    throw new Error(formatClassificationError(githubRepo.name, faults));
  }

  // `tier` and `category` are resolved here because the check above would have
  // thrown otherwise.
  return { category: category.value, tier: tier.value };
}

/**
 * Returns the category, or the fault that prevents it, for a tier that may or
 * may not require one. It reports the fault instead of throwing so the caller
 * can collect every fault at once.
 */
function resolveCategory(
  categories: CategoryId[],
  requiresCategory: boolean,
): ClassificationPart<NullableCategoryId> {
  const [resolvedCategory] = categories;

  if (resolvedCategory === undefined) {
    return requiresCategory
      ? { kind: "fault", message: "is published but carries no category topic" }
      : { kind: "resolved", value: null };
  }

  if (categories.length > 1) {
    return {
      kind: "fault",
      message:
        "carries more than one category topic:" +
        ` ${formatTopics(categories.map((category) => categoryTopic(category)))}`,
    };
  }

  return { kind: "resolved", value: resolvedCategory };
}

/**
 * Returns the tier or the fault that prevents it. It reports the fault instead
 * of throwing so the caller can collect every fault at once.
 */
function resolveTier(
  tiers: TierId[],
  unknownTierTopics: string[],
): ClassificationPart<TierId> {
  const allTierTopics = [
    ...tiers.map((tier) => tierTopic(tier)),
    ...unknownTierTopics,
  ];

  if (allTierTopics.length > 1) {
    return {
      kind: "fault",
      message: `carries more than one tier topic: ${formatTopics(allTierTopics)}`,
    };
  }

  if (unknownTierTopics.length > 0) {
    return {
      kind: "fault",
      message: `carries unknown tier topic: ${formatTopics(unknownTierTopics)}`,
    };
  }

  // `tiers` has exactly one element because the caller only reaches here when
  // at least one tier topic is present and no fault was found.
  return { kind: "resolved", value: tiers[0] };
}

function formatClassificationError(repoName: string, faults: string[]): string {
  if (faults.length === 1) {
    return `Repository "${repoName}" ${faults[0]}.`;
  }

  return (
    `Repository "${repoName}" has ${faults.length} classification faults:\n` +
    faults.map((fault) => `- ${fault}.`).join("\n")
  );
}

function formatTopics(topics: string[]): string {
  return topics.map((topic) => `"${topic}"`).join(", ");
}
