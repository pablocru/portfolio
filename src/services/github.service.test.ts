import { Octokit } from "@octokit/rest";
import { describe, expect, test, vi } from "vitest";
import { GITHUB_USERNAME, PORTFOLIO_TOPIC } from "../constants";
import { getProfile, getRepos } from "./github.service";

const published = {
  name: "portfolio",
  description: "A window to my projects",
  language: "TypeScript",
  html_url: "https://github.com/pablocru/portfolio",
  archived: false,
  private: false,
  topics: [PORTFOLIO_TOPIC],
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

describe("getRepos", () => {
  test("lists only the public repositories tagged for the portfolio", async () => {
    const client = new Octokit();
    vi.spyOn(client, "paginate").mockResolvedValue([
      published,
      { ...published, name: "hidden", topics: ["astro"] },
      { ...published, name: "secret", private: true },
    ]);

    await expect(getRepos(client)).resolves.toEqual([
      {
        name: "portfolio",
        description: "A window to my projects",
        language: "TypeScript",
        url: "https://github.com/pablocru/portfolio",
        archived: false,
      },
    ]);
  });

  test("reports the failed listing and the username", async () => {
    const client = new Octokit();
    vi.spyOn(client.rest.repos, "listForUser").mockRejectedValue(
      new Error("boom"),
    );

    await expect(getRepos(client)).rejects.toThrow(
      `GitHub repository listing failed for username "${GITHUB_USERNAME}"`,
    );
  });
});
