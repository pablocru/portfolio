import { Octokit } from "@octokit/rest";
import { describe, expect, test, vi } from "vitest";
import {
  GITHUB_USERNAME,
  PORTFOLIO_OPT_IN_TOPIC,
  RepoCategory,
} from "../constants";
import { getProfile, getRepoListing } from "./github.service";

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
  test("reports the failed lookup and the username", async () => {
    const client = new Octokit();
    vi.spyOn(client.rest.users, "getByUsername").mockRejectedValue(
      new Error("boom"),
    );

    await expect(getProfile(client)).rejects.toThrow(
      `GitHub profile lookup failed for username "${GITHUB_USERNAME}"`,
    );
  });
});

describe("getRepoListing", () => {
  test("classifies the listed repositories", async () => {
    const client = new Octokit();
    vi.spyOn(client, "paginate").mockResolvedValue([
      githubRepo,
      { ...githubRepo, name: "hidden", topics: ["astro"] },
    ]);

    const listing = await getRepoListing(client);

    expect(listing.repos).toHaveLength(1);
    expect(listing.repos[0]).toMatchObject({
      name: "portfolio",
      url: "https://github.com/pablocru/portfolio",
      category: RepoCategory.Web,
    });
    expect(listing.warnings).toEqual([]);
  });

  test("reports a published repository without a category", async () => {
    const client = new Octokit();
    vi.spyOn(client, "paginate").mockResolvedValue([
      { ...githubRepo, topics: [PORTFOLIO_OPT_IN_TOPIC] },
    ]);

    await expect(getRepoListing(client)).rejects.toThrow(
      'Repository "portfolio" is published but carries no category topic',
    );
  });

  test("reports the failed listing and the username", async () => {
    const client = new Octokit();
    vi.spyOn(client.rest.repos, "listForUser").mockRejectedValue(
      new Error("boom"),
    );

    await expect(getRepoListing(client)).rejects.toThrow(
      `GitHub repository listing failed for username "${GITHUB_USERNAME}"`,
    );
  });
});
