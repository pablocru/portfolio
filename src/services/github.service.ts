import { RequestError } from "@octokit/request-error";
import { Octokit } from "@octokit/rest";
import { mapGitHubUser } from "../mappers/github.mapper";
import type { GitHubUserProfile } from "../types/github.type";

export class GitHubService {
  private readonly octokit: Octokit = new Octokit();

  constructor(private username: string) {}

  async getUserProfile(): Promise<GitHubUserProfile> {
    try {
      const { data } = await this.octokit.rest.users.getByUsername({
        username: this.username,
      });

      return mapGitHubUser(data);
    } catch (error) {
      const errorMessage: string =
        error instanceof RequestError
          ? `GitHub API error (${error.status}): ${error.message}`
          : error instanceof Error
            ? error.message
            : "Unknown error";

      throw new Error(errorMessage, { cause: error });
    }
  }
}
