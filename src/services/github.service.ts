import { RequestError } from "@octokit/request-error";
import type { Octokit } from "@octokit/rest";
import { GITHUB_USERNAME } from "../constants";
import { mapProfile } from "../mappers/profile.mapper";
import { isPublishedRepo, mapRepo } from "../mappers/repo.mapper";
import type { Profile } from "../types/profile.type";
import type { Repo } from "../types/repo.type";

function describeError(error: unknown): string {
  return error instanceof RequestError
    ? `${error.status} ${error.message}`
    : "an unknown error";
}

export async function getProfile(client: Octokit): Promise<Profile> {
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

export async function getRepos(client: Octokit): Promise<Repo[]> {
  try {
    // The listing endpoint has no topic filter, and the search API would delay
    // new tags, so filter locally. 100 is the maximum per page; the API
    // defaults to 30.
    const repositories = await client.paginate(client.rest.repos.listForUser, {
      username: GITHUB_USERNAME,
      type: "owner",
      per_page: 100,
    });

    return repositories.filter(isPublishedRepo).map(mapRepo);
  } catch (error) {
    throw new Error(
      `GitHub repository listing failed for username "${GITHUB_USERNAME}": ${describeError(error)}`,
      { cause: error },
    );
  }
}
