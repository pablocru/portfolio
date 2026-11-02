import { RequestError } from "@octokit/request-error";
import type { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { GITHUB_USERNAME } from "../config/portfolio";

type GitHubUserPayload =
  RestEndpointMethodTypes["users"]["getByUsername"]["response"]["data"];

type GitHubRepoPayload =
  RestEndpointMethodTypes["repos"]["listForUser"]["response"]["data"][number];

function describeError(error: unknown): string {
  return error instanceof RequestError
    ? `the API responded with ${error.status} "${error.message}"`
    : "unexpected error occurred";
}

export async function fetchGitHubUser(
  client: Octokit,
): Promise<GitHubUserPayload> {
  try {
    const { data } = await client.rest.users.getByUsername({
      username: GITHUB_USERNAME,
    });

    return data;
  } catch (error) {
    throw new Error(
      `GitHub profile lookup failed for username "${GITHUB_USERNAME}": ${describeError(error)}`,
      { cause: error },
    );
  }
}

export async function fetchGitHubRepos(
  client: Octokit,
): Promise<GitHubRepoPayload[]> {
  try {
    // listForUser returns public repositories only and the token only raises
    // the rate limit. The listing endpoint has no topic filter, and the search
    // API would delay new tags, so the portfolio service filters locally. 100
    // is the maximum per page; the API defaults to 30, so 101 repositories are
    // processed in two requests.
    return await client.paginate(client.rest.repos.listForUser, {
      username: GITHUB_USERNAME,
      type: "owner",
      per_page: 100,
    });
  } catch (error) {
    throw new Error(
      `GitHub repository listing failed for username "${GITHUB_USERNAME}": ${describeError(error)}`,
      { cause: error },
    );
  }
}
