import type { Octokit } from "@octokit/rest";
import { mapProfile } from "../mappers/profile.mapper";
import { mapRepo } from "../mappers/repo.mapper";
import type { Profile } from "../types/profile.type";
import type { Repo, RepoListing } from "../types/repo.type";
import { fetchGitHubRepos, fetchGitHubUser } from "./github.service";
import { classifyRepo } from "./repo-classification.service";

export async function getProfile(client: Octokit): Promise<Profile> {
  const githubUser = await fetchGitHubUser(client);

  return mapProfile(githubUser);
}

export async function getRepositories(client: Octokit): Promise<RepoListing> {
  const githubRepos = await fetchGitHubRepos(client);
  const repos: Repo[] = [];
  const warnings: string[] = [];

  for (const githubRepo of githubRepos) {
    const classification = classifyRepo(githubRepo);

    if (classification.kind === "published") {
      repos.push(
        mapRepo(githubRepo, classification.category, classification.tier),
      );
    } else if (classification.kind === "warned") {
      warnings.push(classification.warning);
    }
  }

  return { repos, warnings };
}
