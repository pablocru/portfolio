import type { LoaderContext } from "astro/loaders";
import { describe, expect, test, vi } from "vitest";
import { PORTFOLIO_OPT_IN_TOPIC } from "../constants";
import type { Repo } from "../types/repo.type";
import { githubReposLoader } from "./github-repos";

const repo: Repo = {
  name: "portfolio",
  description: "A window to my projects",
  language: "TypeScript",
  url: "https://github.com/pablocru/portfolio",
  archived: false,
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

describe("githubReposLoader", () => {
  test("replaces the entries of a previous listing", async () => {
    const { context, entries, store, logger } = createLoadContext();
    entries.set("removed", { ...repo, name: "removed" });

    await githubReposLoader(async () => [repo]).load(context);

    expect([...entries.keys()]).toEqual(["portfolio"]);
    expect(store.set).toHaveBeenCalledWith({
      id: "portfolio",
      data: repo,
      digest: "digest",
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test("warns when no repository qualifies", async () => {
    const { context, entries, store, logger } = createLoadContext();
    entries.set("removed", { ...repo, name: "removed" });

    await githubReposLoader(async () => []).load(context);

    expect(entries.size).toBe(0);
    expect(store.set).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(PORTFOLIO_OPT_IN_TOPIC),
    );
  });
});
