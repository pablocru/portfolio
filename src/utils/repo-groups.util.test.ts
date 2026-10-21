import { describe, expect, test } from "vitest";
import { RepoCategory, RepoTier } from "../constants";
import type { PortfolioRepo } from "../types/repo.type";
import { groupRepos } from "./repo-groups.util";

function portfolioRepo(
  name: string,
  overrides: Partial<PortfolioRepo> = {},
): PortfolioRepo {
  return {
    name,
    description: null,
    language: null,
    url: `https://github.com/pablocru/${name}`,
    archived: false,
    pushedAt: "2026-01-01T00:00:00Z",
    category: RepoCategory.Web,
    tier: RepoTier.Project,
    ...overrides,
  };
}

function fullSet(): PortfolioRepo[] {
  return [
    portfolioRepo("web-project"),
    portfolioRepo("data-project", { category: RepoCategory.Data }),
    portfolioRepo("cloud-project", { category: RepoCategory.CloudDevOps }),
    portfolioRepo("featured-project", { tier: RepoTier.Featured }),
    portfolioRepo("lab-project", { tier: RepoTier.Lab }),
  ];
}

describe("groupRepos", () => {
  test("orders the sections and leaves no group empty", () => {
    const grouping = groupRepos(fullSet());

    expect(grouping.groups.map((group) => group.label)).toEqual([
      RepoTier.Featured,
      RepoCategory.Web,
      RepoCategory.Data,
      RepoCategory.CloudDevOps,
      RepoTier.Lab,
    ]);
    expect(grouping.warnings).toEqual([]);
  });

  test("puts every repository in exactly one group", () => {
    const grouping = groupRepos(fullSet());
    const names = grouping.groups.flatMap((group) =>
      group.repos.map((value) => value.name),
    );

    expect(names).toHaveLength(fullSet().length);
    expect(new Set(names).size).toBe(names.length);
  });

  test("lets the tier win over the category", () => {
    const grouping = groupRepos([
      portfolioRepo("featured-data", {
        category: RepoCategory.Data,
        tier: RepoTier.Featured,
      }),
      portfolioRepo("lab-web", { tier: RepoTier.Lab }),
    ]);

    expect(grouping.groups.map((group) => group.id)).toEqual([
      "featured",
      "lab",
    ]);
    expect(grouping.groups[0]?.repos.map((value) => value.name)).toEqual([
      "featured-data",
    ]);
    expect(grouping.groups[1]?.repos.map((value) => value.name)).toEqual([
      "lab-web",
    ]);
  });

  test("orders entries by archived, push date and name", () => {
    const grouping = groupRepos([
      portfolioRepo("archived", {
        archived: true,
        pushedAt: "2026-12-01T00:00:00Z",
      }),
      portfolioRepo("older", { pushedAt: "2025-01-01T00:00:00Z" }),
      portfolioRepo("newer", { pushedAt: "2026-01-01T00:00:00Z" }),
      portfolioRepo("undated", { pushedAt: null }),
      portfolioRepo("bravo", { pushedAt: "2024-01-01T00:00:00Z" }),
      portfolioRepo("alpha", { pushedAt: "2024-01-01T00:00:00Z" }),
    ]);

    expect(grouping.groups[0]?.repos.map((value) => value.name)).toEqual([
      "newer",
      "older",
      "alpha",
      "bravo",
      "undated",
      "archived",
    ]);
  });

  test("warns about every group that stays empty", () => {
    const grouping = groupRepos([portfolioRepo("web-project")]);

    expect(grouping.groups.map((group) => group.id)).toEqual(["web"]);
    expect(grouping.warnings).toEqual([
      'The "Featured" group has no repository; its section is omitted.',
      'Category "Data" has no project-tier repository; its section is omitted.',
      'Category "Cloud & DevOps" has no project-tier repository; its section is omitted.',
      'The "Lab" group has no repository; its section is omitted.',
    ]);
  });

  test("warns when a category only holds featured or lab repositories", () => {
    const grouping = groupRepos([
      portfolioRepo("featured-data", {
        category: RepoCategory.Data,
        tier: RepoTier.Featured,
      }),
      portfolioRepo("lab-data", {
        category: RepoCategory.Data,
        tier: RepoTier.Lab,
      }),
    ]);

    expect(grouping.warnings).toContain(
      'Category "Data" has no project-tier repository; its section is omitted.',
    );
  });

  test("reports nothing without repositories", () => {
    expect(groupRepos([])).toEqual({ groups: [], warnings: [] });
  });
});
