import { RequestError } from "@octokit/request-error";
import { Octokit } from "@octokit/rest";
import { GITHUB_USERNAME } from "../constants";
import { mapProfile } from "../mappers/profile.mapper";
import { isPortfolioRepo, mapRepo } from "../mappers/repo.mapper";
import type { Profile } from "../types/profile.type";
import type { Repo } from "../types/repo.type";

function describeError(error: unknown): string {
  return error instanceof RequestError
    ? `${error.status} ${error.message}`
    : "an unknown error";
}

export async function getProfile(
  client: Octokit = new Octokit(),
): Promise<Profile> {
  try {
    const { data } = await client.rest.users.getByUsername({
      username: GITHUB_USERNAME,
    });

    return mapProfile(data);
  } catch (error) {
    throw new Error(
      `GitHub profile lookup failed for username "${GITHUB_USERNAME}": ${describeError(error)}`,
      { cause: error },
    );
  }
}

export async function getRepos(
  client: Octokit = new Octokit(),
): Promise<Repo[]> {
  try {
    const repositories = await client.paginate(client.rest.repos.listForUser, {
      username: GITHUB_USERNAME,
      type: "owner",
      per_page: 100,
    });

    return repositories.filter(isPortfolioRepo).map(mapRepo);
  } catch (error) {
    throw new Error(
      `GitHub repository listing failed for username "${GITHUB_USERNAME}": ${describeError(error)}`,
      { cause: error },
    );
  }
}
