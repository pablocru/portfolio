import { Octokit } from "@octokit/rest";
import { describe, expect, test, vi } from "vitest";
import { CATEGORIES, categoryTopic } from "../config/categories";
import { tierTopic } from "../config/tiers";
import { firstRequiredTier } from "../config/tiers.fixture";
import { githubRepo, githubRepoTierId } from "../mappers/repo.fixture";
import { getPortfolioRepos, getProfile } from "./portfolio.service";

const [web, data] = CATEGORIES;

describe("getProfile", () => {
  test("maps the fetched GitHub user", async () => {
    const githubUser = {
      login: "pablocru",
      name: "Pablo",
      avatar_url: "https://avatars.githubusercontent.com/u/1",
      bio: "A bio",
    };
    const client = {
      rest: { users: { getByUsername: async () => ({ data: githubUser }) } },
    } as unknown as Octokit;

    await expect(getProfile(client)).resolves.toEqual({
      name: "Pablo",
      avatarUrl: "https://avatars.githubusercontent.com/u/1",
      bio: "A bio",
    });
  });
});

describe("getPortfolioRepos", () => {
  test("maps the published repositories", async () => {
    const client = new Octokit();
    vi.spyOn(client, "paginate").mockResolvedValue([
      githubRepo,
      { ...githubRepo, name: "hidden", topics: ["astro"] },
    ]);

    const selection = await getPortfolioRepos(client);

    expect(selection.repos).toEqual([
      {
        name: "portfolio",
        description: "A window to my projects",
        language: "TypeScript",
        url: "https://github.com/pablocru/portfolio",
        archived: false,
        pushedAt: "2026-10-20T09:00:00Z",
        category: web.id,
        tier: githubRepoTierId,
      },
    ]);
    expect(selection.warnings).toEqual([]);
  });

  test("collects the warnings of the unpublished repositories", async () => {
    const client = new Octokit();
    vi.spyOn(client, "paginate").mockResolvedValue([
      githubRepo,
      // The public source never returns a private repository; this fixture
      // keeps the defensive classifier path covered.
      { ...githubRepo, name: "secret", private: true },
      { ...githubRepo, name: "classified", topics: [categoryTopic(data.id)] },
    ]);

    const selection = await getPortfolioRepos(client);

    expect(selection.repos.map((portfolioRepo) => portfolioRepo.name)).toEqual([
      "portfolio",
    ]);
    expect(selection.warnings).toEqual([
      expect.stringContaining('Repository "secret"'),
      expect.stringContaining('Repository "classified"'),
    ]);
  });

  test("reports a published repository without a category", async () => {
    const client = new Octokit();
    vi.spyOn(client, "paginate").mockResolvedValue([
      { ...githubRepo, topics: [tierTopic(firstRequiredTier().id)] },
    ]);

    await expect(getPortfolioRepos(client)).rejects.toThrow(
      'Repository "portfolio" is published but carries no category topic',
    );
  });
});
