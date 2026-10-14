export const USERNAME = "pablocru";
export const HOME_REPO = `${USERNAME}.github.io`;
export const MAX_TAGS = 5;

export enum Tier {
  Featured = "featured",
  Project = "project",
  Lab = "lab",
}

export enum Category {
  Web = "web",
  Data = "data",
  Cloud = "cloud",
}

export const CATEGORY_LABEL: Record<Category, string> = {
  [Category.Web]: "Web",
  [Category.Data]: "Data",
  [Category.Cloud]: "Cloud & DevOps",
};

export const TOPIC = {
  show: "pf-show",
  prefix: "pf-",
  categoryPrefix: "pf-cat-",
} as const;

export const TIER_TOPICS: Record<string, Tier> = {
  "pf-featured": Tier.Featured,
  "pf-lab": Tier.Lab,
};
