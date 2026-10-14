import {
  Category,
  HOME_REPO,
  MAX_TAGS,
  TIER_TOPICS,
  Tier,
  TOPIC,
} from "../constants";
import type { GhRepo, RepoEntry } from "../types/github.type";
import { toUrlOrNull } from "../utils/url.util";

function buildLinks(
  isSelf: boolean,
  codeUrl: string,
  demo?: { url: string; host: string },
): RepoEntry["links"] {
  const links: RepoEntry["links"] = [];

  if (isSelf) {
    links.push({ label: "How it works", href: "/how-it-works/" });
  } else if (demo !== undefined) {
    links.push({ label: `Demo · ${demo.host}`, href: demo.url });
  }

  links.push({ label: "Code", href: codeUrl });

  return links;
}

function hostLabel(url: URL): string {
  const host = url.hostname;

  if (host.endsWith(".github.io")) {
    return "GitHub Pages";
  }

  if (host.endsWith(".pages.dev") || host.endsWith(".workers.dev")) {
    return "Cloudflare";
  }

  return host;
}

export function mapRepo(repo: GhRepo): RepoEntry | null {
  const topics = repo.topics ?? [];

  if (!topics.includes(TOPIC.show)) {
    return null;
  }

  const controlTopics = topics.filter((topic) =>
    topic.startsWith(TOPIC.prefix),
  );

  const knownControlTopics = new Set<string>([
    TOPIC.show,
    ...Object.keys(TIER_TOPICS),
    ...Object.values(Category).map(
      (category) => `${TOPIC.categoryPrefix}${category}`,
    ),
  ]);

  const unknownControlTopics = controlTopics.filter(
    (topic) => !knownControlTopics.has(topic),
  );

  if (unknownControlTopics.length > 0) {
    throw new Error(
      `${repo.name}: unknown control topics: ${unknownControlTopics.join(", ")}`,
    );
  }

  const tierTopics = controlTopics.filter((topic) =>
    Object.hasOwn(TIER_TOPICS, topic),
  );
  const categoryTopics = controlTopics.filter((topic) =>
    topic.startsWith(TOPIC.categoryPrefix),
  );

  if (tierTopics.length > 1 || categoryTopics.length > 1) {
    throw new Error(`${repo.name}: conflicting control topics`);
  }

  const tier =
    tierTopics[0] === undefined ? Tier.Project : TIER_TOPICS[tierTopics[0]];

  const categoryValue = categoryTopics
    .at(0)
    ?.slice(TOPIC.categoryPrefix.length);
  const category =
    categoryValue === undefined ? undefined : (categoryValue as Category);

  if (tier !== Tier.Lab && category === undefined) {
    throw new Error(`${repo.name}: missing pf-cat-* topic`);
  }

  const isSelf = repo.name === HOME_REPO;
  const demoUrl = isSelf ? null : toUrlOrNull(repo.homepage ?? "");

  return {
    name: repo.name,
    description: repo.description ?? "",
    language: repo.language,
    pushedAt: new Date(repo.pushed_at),
    tier,
    category,
    status: repo.archived ? "archived" : "active",
    tags: topics
      .filter((topic) => !topic.startsWith(TOPIC.prefix))
      .slice(0, MAX_TAGS),
    links: buildLinks(
      isSelf,
      repo.html_url,
      demoUrl === null
        ? undefined
        : { url: demoUrl.toString(), host: hostLabel(demoUrl) },
    ),
  };
}
