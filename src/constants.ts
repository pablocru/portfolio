export enum RepoCategory {
  Web = "Web",
  Data = "Data",
  CloudDevOps = "Cloud & DevOps",
}

export enum RepoTier {
  Featured = "Featured",
  Project = "Project",
  Lab = "Lab",
}

export const REPO_CATEGORY_TOPIC: Record<RepoCategory, string> = {
  [RepoCategory.Web]: "pf-cat-web",
  [RepoCategory.Data]: "pf-cat-data",
  [RepoCategory.CloudDevOps]: "pf-cat-cloud-devops",
};

export const REPO_TIER_TOPIC: Record<RepoTier, string> = {
  [RepoTier.Featured]: "pf-tier-featured",
  [RepoTier.Project]: "pf-tier-project",
  [RepoTier.Lab]: "pf-tier-lab",
};
