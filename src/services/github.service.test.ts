import { Octokit } from "@octokit/rest";
import { describe, expect, test, vi } from "vitest";
import { GITHUB_USERNAME } from "../constants";
import { getProfile } from "./github.service";

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
