export enum RepoTier {
  Featured = "Featured",
  Project = "Project",
  Lab = "Lab",
}

export const REPO_TIER_TOPIC: Record<RepoTier, string> = {
  [RepoTier.Featured]: "pf-tier-featured",
  [RepoTier.Project]: "pf-tier-project",
  [RepoTier.Lab]: "pf-tier-lab",
};
