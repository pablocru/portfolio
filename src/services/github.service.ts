import { GITHUB_TOKEN } from "astro:env/server";
import { RequestError } from "@octokit/request-error";
import { Octokit } from "@octokit/rest";
import { USERNAME } from "../constants";
import { mapRepo } from "../mappers/repo.mapper";
import type { GhRepo, GhUserProfile, RepoEntry } from "../types/github.type";

function wrapGithubError(error: unknown, action: string): Error {
  if (
    error instanceof RequestError &&
    error.status === 403 &&
    error.response?.headers?.["x-ratelimit-remaining"] === "0"
  ) {
    return new Error(
      "GitHub API rate limit reached. Try again later, or set GITHUB_TOKEN " +
        "before running the command: GITHUB_TOKEN=$(gh auth token) pnpm dev",
    );
  }

  if (error instanceof Error) {
    return new Error(`GitHub API ${action} failed: ${error.message}`, {
      cause: error,
    });
  }

  return new Error(`GitHub API ${action} failed with an unknown error.`);
}

function createOctokit(): Octokit {
  return GITHUB_TOKEN === undefined
    ? new Octokit()
    : new Octokit({ auth: GITHUB_TOKEN });
}

export async function getPortfolioRepos(): Promise<RepoEntry[]> {
  const octokit = createOctokit();

  try {
    const repositories = await octokit.paginate(octokit.repos.listForUser, {
      username: USERNAME,
      type: "owner",
      per_page: 100,
    });

    const entries: RepoEntry[] = [];

    for (const repository of repositories as GhRepo[]) {
      const entry = mapRepo(repository);

      if (entry !== null) {
        entries.push(entry);
      }
    }

    return entries;
  } catch (error) {
    throw wrapGithubError(error, "repository listing");
  }
}

export async function getUserProfile(): Promise<GhUserProfile> {
  const octokit = createOctokit();

  try {
    const response = await octokit.users.getByUsername({
      username: USERNAME,
    });

    return {
      name: response.data.name ?? USERNAME,
      bio: response.data.bio ?? "",
      avatarUrl: response.data.avatar_url,
      location: response.data.location ?? null,
    };
  } catch (error) {
    throw wrapGithubError(error, "profile lookup");
  }
}
