import type { GitHubUserProfile, GitHubUserRaw } from "../types/github.type";
import { toUrlOrNull } from "../utils/url.util";

export function mapGitHubUser(raw: GitHubUserRaw): GitHubUserProfile {
  const fullname = raw.name;

  return {
    username: raw.login,
    fullname,
    displayName: fullname ?? raw.login,
    location: raw.location,
    bio: raw.bio,
    personalSite: toUrlOrNull(raw.blog),
    pictureUrl: new URL(raw.avatar_url),
    pageUrl: new URL(raw.html_url),
    repoCount: raw.public_repos,
    gistsCount: raw.public_gists,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
  };
}
