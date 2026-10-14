import type { Category, Tier } from "../constants";

export type GhRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  pushed_at: string;
  archived: boolean;
  topics?: string[];
};

export type RepoEntry = {
  name: string;
  description: string;
  language: string | null;
  pushedAt: Date;
  tier: Tier;
  category?: Category;
  status: "active" | "archived";
  tags: string[];
  links: {
    label: string;
    href: string;
  }[];
};
