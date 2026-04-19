import { Octokit } from "@octokit/rest";
import { mapGitHubUser } from "../mappers/github.mapper";
import type { GitHubUserProfile } from "../types/github.type";

export class GitHubService {
  private readonly octokit: Octokit = new Octokit();

  constructor(private username: string) {}

  async getUserProfile(): Promise<GitHubUserProfile> {
    const { data } = await this.octokit.rest.users.getByUsername({
      username: this.username,
    });

    return mapGitHubUser(data);
  }
}
