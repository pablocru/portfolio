import type { LoaderContext } from "astro/loaders";
import { describe, expect, test, vi } from "vitest";
import {
  GITHUB_USERNAME,
  PORTFOLIO_OPT_IN_TOPIC,
  RepoCategory,
  RepoTier,
} from "../constants";
import type { PortfolioRepo, PortfolioRepoSelection } from "../types/repo.type";
import { githubReposLoader } from "./github-repos";

const portfolioRepo: PortfolioRepo = {
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
  const entries = new Map<string, PortfolioRepo>();
  const store = {
    clear: () => entries.clear(),
    set: vi.fn((entry: { id: string; data: PortfolioRepo }) =>
      entries.set(entry.id, entry.data),
    ),
  };
  const logger = { warn: vi.fn() };
  const context = {
    store,
    logger,
    parseData: async (options: { data: PortfolioRepo }) => options.data,
    generateDigest: () => "digest",
  } as unknown as LoaderContext;

  return { context, entries, store, logger };
}

function selection(
  overrides: Partial<PortfolioRepoSelection> = {},
): PortfolioRepoSelection {
  return { repos: [portfolioRepo], warnings: [], ...overrides };
}

describe("githubReposLoader", () => {
  test("replaces the entries of a previous selection", async () => {
    const { context, entries, store } = createLoadContext();
    entries.set("removed", { ...portfolioRepo, name: "removed" });

    await githubReposLoader(async () => selection()).load(context);

    expect([...entries.keys()]).toEqual(["portfolio"]);
    expect(store.set).toHaveBeenCalledWith({
      id: "portfolio",
      data: portfolioRepo,
      digest: "digest",
    });
  });

  test("forwards the warnings of the selection", async () => {
    const { context, logger } = createLoadContext();
    const warning = 'Repository "secret" carries "pf-show" but is private.';

    await githubReposLoader(async () =>
      selection({ warnings: [warning] }),
    ).load(context);

    expect(logger.warn).toHaveBeenCalledWith(warning);
  });

  test("warns when no repository qualifies", async () => {
    const { context, entries, store, logger } = createLoadContext();
    entries.set("removed", { ...portfolioRepo, name: "removed" });

    await githubReposLoader(async () => selection({ repos: [] })).load(context);

    expect(entries.size).toBe(0);
    expect(store.set).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        `no public repository of "${GITHUB_USERNAME}" carries the "${PORTFOLIO_OPT_IN_TOPIC}" topic`,
      ),
    );
  });
});
