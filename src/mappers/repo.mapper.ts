import type { RestEndpointMethodTypes } from "@octokit/rest";
import {
  PORTFOLIO_OPT_IN_TOPIC,
  PORTFOLIO_TOPIC_PREFIX,
  REPO_CATEGORY_TOPIC,
  REPO_TIER_TOPIC,
  RepoCategory,
  RepoTier,
} from "../constants";
import type { Repo } from "../types/repo.type";

type GitHubRepo = Pick<
  RestEndpointMethodTypes["repos"]["listForUser"]["response"]["data"][number],
  | "name"
  | "description"
  | "language"
  | "html_url"
  | "archived"
  | "private"
  | "topics"
  | "pushed_at"
>;

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
export function isPublishedRepo(repo: GitHubRepo): boolean {
  return !repo.private && (repo.topics ?? []).includes(PORTFOLIO_OPT_IN_TOPIC);
}

/**
 * Places one repository in the portfolio or explains why it stays out.
 * A repository the owner did not publish never stops the build; a published
 * repository whose classification is missing, duplicated or unknown throws.
 */
export function classifyRepo(repo: GitHubRepo): RepoClassification {
  const topics = repo.topics ?? [];
  const controlTopics = topics.filter((topic) =>
    topic.startsWith(PORTFOLIO_TOPIC_PREFIX),
  );

  if (!isPublishedRepo(repo)) {
    if (topics.includes(PORTFOLIO_OPT_IN_TOPIC)) {
      return {
        kind: "warned",
        warning: `Repository "${repo.name}" carries ${PORTFOLIO_OPT_IN_TOPIC} but is private, so it is not published.`,
      };
    }

    if (controlTopics.length === 0) {
      return { kind: "ignored" };
    }

    return {
      kind: "warned",
      warning: `Repository "${repo.name}" carries the control topics ${list(controlTopics)} but not ${PORTFOLIO_OPT_IN_TOPIC}, so it is not published.`,
    };
  }

  const unknownTopics = controlTopics.filter(
    (topic) => !KNOWN_TOPICS.has(topic),
  );

  if (unknownTopics.length > 0) {
    throw new Error(
      `Repository "${repo.name}" carries unknown control topics: ${list(unknownTopics)}.`,
    );
  }

  const tiers = Object.values(RepoTier).filter((tier) =>
    topics.includes(REPO_TIER_TOPIC[tier]),
  );

  if (tiers.length > 1) {
    throw new Error(
      `Repository "${repo.name}" carries more than one tier topic: ${list(tiers.map((tier) => REPO_TIER_TOPIC[tier]))}.`,
    );
  }

  const categories = Object.values(RepoCategory).filter((category) =>
    topics.includes(REPO_CATEGORY_TOPIC[category]),
  );
  const [category] = categories;

  if (category === undefined) {
    throw new Error(
      `Repository "${repo.name}" is published but carries no category topic.`,
    );
  }

  if (categories.length > 1) {
    throw new Error(
      `Repository "${repo.name}" carries more than one category topic: ${list(categories.map((value) => REPO_CATEGORY_TOPIC[value]))}.`,
    );
  }

  return {
    kind: "published",
    repo: {
      name: repo.name,
      description: repo.description?.trim() || null,
      language: repo.language ?? null,
      url: repo.html_url,
      archived: repo.archived ?? false,
      pushedAt: repo.pushed_at ?? null,
      category,
      tier: tiers[0] ?? RepoTier.Project,
    },
  };
}

function list(topics: string[]): string {
  return topics.join(", ");
}
