import type { LoaderContext } from "astro/loaders";
import { describe, expect, test, vi } from "vitest";
import { PORTFOLIO_OPT_IN_TOPIC, RepoCategory, RepoTier } from "../constants";
import type { Repo, RepoListing } from "../types/repo.type";
import { githubReposLoader } from "./github-repos";

const repo: Repo = {
  name: "portfolio",
  description: "A window to my projects",
  language: "TypeScript",
  url: "https://github.com/pablocru/portfolio",
  archived: false,
  pushedAt: "2026-10-20T09:00:00Z",
  category: RepoCategory.Web,
  tier: RepoTier.Project,
};

function createLoadContext() {
  const entries = new Map<string, Repo>();
  const store = {
    clear: () => entries.clear(),
    set: vi.fn((entry: { id: string; data: Repo }) =>
      entries.set(entry.id, entry.data),
    ),
  };
  const logger = { warn: vi.fn() };
  const context = {
    store,
    logger,
    parseData: async (options: { data: Repo }) => options.data,
    generateDigest: () => "digest",
  } as unknown as LoaderContext;

  return { context, entries, store, logger };
}

function listing(overrides: Partial<RepoListing> = {}): RepoListing {
  return { repos: [repo], warnings: [], ...overrides };
}

describe("githubReposLoader", () => {
  test("replaces the entries of a previous listing", async () => {
    const { context, entries, store } = createLoadContext();
    entries.set("removed", { ...repo, name: "removed" });

    await githubReposLoader(async () => listing()).load(context);

    expect([...entries.keys()]).toEqual(["portfolio"]);
    expect(store.set).toHaveBeenCalledWith({
      id: "portfolio",
      data: repo,
      digest: "digest",
    });
  });

  test("forwards the warnings of the listing", async () => {
    const { context, logger } = createLoadContext();
    const warning = 'Repository "secret" carries pf-show but is private.';

    await githubReposLoader(async () => listing({ warnings: [warning] })).load(
      context,
    );

    expect(logger.warn).toHaveBeenCalledWith(warning);
  });

  test("warns about the groups that stay empty", async () => {
    const { context, logger } = createLoadContext();

    await githubReposLoader(async () => listing()).load(context);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('"Featured"'),
    );
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Cloud & DevOps"),
    );
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('"Lab"'));
  });

  test("warns when no repository qualifies", async () => {
    const { context, entries, store, logger } = createLoadContext();
    entries.set("removed", { ...repo, name: "removed" });

    await githubReposLoader(async () => listing({ repos: [] })).load(context);

    expect(entries.size).toBe(0);
    expect(store.set).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(PORTFOLIO_OPT_IN_TOPIC),
    );
  });
});
