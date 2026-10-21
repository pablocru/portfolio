import { Octokit } from "@octokit/rest";
import { describe, expect, test, vi } from "vitest";
import { GITHUB_USERNAME } from "../constants";
import { fetchGitHubRepos, fetchGitHubUser } from "./github.service";

describe("fetchGitHubUser", () => {
  test("reports the failed lookup and the username", async () => {
    const client = new Octokit();
    vi.spyOn(client.rest.users, "getByUsername").mockRejectedValue(
      new Error("boom"),
    );

    await expect(fetchGitHubUser(client)).rejects.toThrow(
      `GitHub profile lookup failed for username "${GITHUB_USERNAME}"`,
    );
  });
});

describe("fetchGitHubRepos", () => {
  test("reports the failed listing and the username", async () => {
    const client = new Octokit();
    vi.spyOn(client.rest.repos, "listForUser").mockRejectedValue(
      new Error("boom"),
    );

    await expect(fetchGitHubRepos(client)).rejects.toThrow(
      `GitHub repository listing failed for username "${GITHUB_USERNAME}"`,
    );
  });
});
