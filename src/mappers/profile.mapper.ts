import type { RestEndpointMethodTypes } from "@octokit/rest";
import type { Profile } from "../types/profile.type";

type GitHubUser = Pick<
  RestEndpointMethodTypes["users"]["getByUsername"]["response"]["data"],
  "login" | "name" | "avatar_url" | "bio"
>;

export function mapProfile(githubUser: GitHubUser): Profile {
  return {
    name: githubUser.name?.trim() || githubUser.login,
    avatarUrl: githubUser.avatar_url,
    bio: githubUser.bio?.trim() || null,
  };
}
