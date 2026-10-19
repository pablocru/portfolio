import type { LoaderContext } from "astro/loaders";
import { describe, expect, test, vi } from "vitest";
import { PORTFOLIO_TOPIC } from "../constants";
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
  const store = { clear: vi.fn(), set: vi.fn() };
  const logger = { warn: vi.fn() };
  const context = {
    store,
    logger,
    parseData: async (options: { data: Repo }) => options.data,
    generateDigest: () => "digest",
  } as unknown as LoaderContext;

  return { context, store, logger };
}

describe("githubReposLoader", () => {
  test("writes one entry per repository", async () => {
    const { context, store, logger } = createLoadContext();

    await githubReposLoader(async () => [repo]).load(context);

    expect(store.clear).toHaveBeenCalledOnce();
    expect(store.set).toHaveBeenCalledWith({
      id: "portfolio",
      data: repo,
      digest: "digest",
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test("warns when no repository qualifies", async () => {
    const { context, store, logger } = createLoadContext();

    await githubReposLoader(async () => []).load(context);

    expect(store.set).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(PORTFOLIO_TOPIC),
    );
  });
});
