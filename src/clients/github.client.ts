import { GITHUB_TOKEN } from "astro:env/server";
import { Octokit } from "@octokit/rest";

/**
 * Builds the GitHub client. It reads the token, so it is only importable from
 * the Astro layer: `astro:env` does not resolve in the offline tests.
 */
export function createGitHubClient(): Octokit {
  return new Octokit({ auth: GITHUB_TOKEN });
}
