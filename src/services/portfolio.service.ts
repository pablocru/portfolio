import type { Octokit } from "@octokit/rest";
import { mapProfile } from "../mappers/profile.mapper";
import { mapRepo } from "../mappers/repo.mapper";
import type { PortfolioProfile } from "../types/profile.type";
import type { PortfolioRepo, PortfolioRepoSelection } from "../types/repo.type";
import { fetchGitHubRepos, fetchGitHubUser } from "./github.service";
import { classifyRepo } from "./repo-classification.service";

export async function getProfile(client: Octokit): Promise<PortfolioProfile> {
  const githubUser = await fetchGitHubUser(client);

  return mapProfile(githubUser);
}

/**
 * Fetches the GitHub repositories, selects the ones marked for the portfolio,
 * classifies and maps them, and returns the selection with its warnings. It
 * does not write to the content store; the loader does.
 */
export async function getPortfolioRepos(
  client: Octokit,
): Promise<PortfolioRepoSelection> {
  const githubRepos = await fetchGitHubRepos(client);
  const portfolioRepos: PortfolioRepo[] = [];
  const warnings: string[] = [];

  for (const githubRepo of githubRepos) {
    const classification = classifyRepo(githubRepo);

    if (classification.kind === "published") {
      portfolioRepos.push(
        mapRepo(githubRepo, classification.category, classification.tier),
      );
    } else if (classification.kind === "warned") {
      warnings.push(classification.warning);
    }
  }

  return { repos: portfolioRepos, warnings };
}
