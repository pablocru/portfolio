import { RequestError } from "@octokit/request-error";
import type { Octokit } from "@octokit/rest";
import { GITHUB_USERNAME } from "../constants";
import { mapProfile } from "../mappers/profile.mapper";
import { classifyRepo } from "../mappers/repo.mapper";
import type { Profile } from "../types/profile.type";
import type { Repo, RepoListing } from "../types/repo.type";

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

async function listUserRepositories(client: Octokit) {
  try {
    // The listing endpoint has no topic filter, and the search API would delay
    // new tags, so filter locally. 100 is the maximum per page; the API
    // defaults to 30.
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

export async function getRepos(client: Octokit): Promise<RepoListing> {
  const repositories = await listUserRepositories(client);
  const repos: Repo[] = [];
  const warnings: string[] = [];

  for (const repository of repositories) {
    const classification = classifyRepo(repository);

    if (classification.kind === "published") {
      repos.push(classification.repo);
    } else if (classification.kind === "warned") {
      warnings.push(classification.warning);
    }
  }

  return { repos, warnings };
}
