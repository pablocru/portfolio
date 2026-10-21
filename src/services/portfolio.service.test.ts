import { Octokit } from "@octokit/rest";
import { describe, expect, test, vi } from "vitest";
import { PORTFOLIO_OPT_IN_TOPIC, RepoCategory, RepoTier } from "../constants";
import { getPortfolioRepos, getProfile } from "./portfolio.service";

const githubRepo = {
  name: "portfolio",
  description: "A window to my projects",
  language: "TypeScript",
  html_url: "https://github.com/pablocru/portfolio",
  archived: false,
  private: false,
  pushed_at: "2026-10-20T09:00:00Z",
  topics: [PORTFOLIO_OPT_IN_TOPIC, "pf-cat-web"],
};

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
        category: RepoCategory.Web,
        tier: RepoTier.Project,
      },
    ]);
    expect(selection.warnings).toEqual([]);
  });

  test("collects the warnings of the unpublished repositories", async () => {
    const client = new Octokit();
    vi.spyOn(client, "paginate").mockResolvedValue([
      githubRepo,
      { ...githubRepo, name: "secret", private: true },
      { ...githubRepo, name: "classified", topics: ["pf-cat-data"] },
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
      { ...githubRepo, topics: [PORTFOLIO_OPT_IN_TOPIC] },
    ]);

    await expect(getPortfolioRepos(client)).rejects.toThrow(
      'Repository "portfolio" is published but carries no category topic',
    );
  });
});
