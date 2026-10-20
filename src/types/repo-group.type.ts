import type { Repo } from "./repo.type";

export type RepoGroupId = "featured" | "web" | "data" | "cloud-devops" | "lab";

export type RepoGroup = {
  id: RepoGroupId;
  label: string;
  repos: Repo[];
};

/**
 * Sections of the page, in render order, plus the groups that stayed empty.
 */
export type RepoGrouping = {
  groups: RepoGroup[];
  warnings: string[];
};
