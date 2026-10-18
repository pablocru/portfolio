import { RequestError } from "@octokit/request-error";
import { Octokit } from "@octokit/rest";
import { GITHUB_USERNAME } from "../constants";
import { mapProfile } from "../mappers/profile.mapper";
import type { Profile } from "../types/profile.type";

export async function getProfile(): Promise<Profile> {
  const octokit = new Octokit();

  try {
    const { data } = await octokit.rest.users.getByUsername({
      username: GITHUB_USERNAME,
    });

    return mapProfile(data);
  } catch (error) {
    const reason =
      error instanceof RequestError
        ? `${error.status} ${error.message}`
        : "an unknown error";

    throw new Error(
      `GitHub profile lookup failed for username "${GITHUB_USERNAME}": ${reason}`,
      { cause: error },
    );
  }
}
