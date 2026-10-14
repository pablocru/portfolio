import { Octokit } from "@octokit/rest";
import { USERNAME } from "../constants";
import { mapRepo } from "../mappers/repo.mapper";
import type { GhRepo, GhUserProfile, RepoEntry } from "../types/github.type";

function rateLimited(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const status = "status" in error ? Number(error.status) : Number.NaN;
  const response = "response" in error ? error.response : null;
  const remaining =
    typeof response === "object" && response !== null && "headers" in response
      ? (response.headers as Record<string, string | undefined>)[
          "x-ratelimit-remaining"
        ]
      : undefined;

  return status === 403 && remaining === "0";
}

function wrapGithubError(error: unknown, action: string): Error {
  if (rateLimited(error)) {
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
  const token = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env?.GITHUB_TOKEN;

  return token === undefined ? new Octokit() : new Octokit({ auth: token });
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
