import type { RestEndpointMethodTypes } from "@octokit/rest";
import type { Profile } from "../types/profile.type";

type GitHubUser =
  RestEndpointMethodTypes["users"]["getByUsername"]["response"]["data"];

export function mapProfile(user: GitHubUser): Profile {
  return {
    name: user.name?.trim() || user.login,
    avatarUrl: user.avatar_url,
    bio: user.bio?.trim() || null,
  };
}
