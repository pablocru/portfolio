export type GitHubUserRaw = {
  login: string;
  name: string | null;
  location: string | null;
  bio: string | null;
  blog: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  public_gists: number;
  created_at: string;
  updated_at: string;
};

export interface GitHubUserProfile {
  username: string;
  fullname: string | null;
  displayName: string;
  location: string | null;
  bio: string | null;
  personalSite: URL | null;
  pictureUrl: URL;
  pageUrl: URL;
  repoCount: number;
  gistsCount: number;
  createdAt: Date;
  updatedAt: Date;
}
