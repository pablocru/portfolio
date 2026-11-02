import { describe, expect, test } from "vitest";
import { CATEGORIES } from "../../config/categories";
import { TIERS } from "../../config/tiers";
import { portfolioRepo } from "../../types/repo.fixture";
import type { PortfolioRepo } from "../../types/repo.type";
import { groupRepos } from "./repo-groups";

const [web, data, cloudDevOps] = CATEGORIES;
const [featured, project, lab] = TIERS;

function fullSet(): PortfolioRepo[] {
  return [
    portfolioRepo("web-project"),
    portfolioRepo("data-project", { category: data.id }),
    portfolioRepo("cloud-project", { category: cloudDevOps.id }),
    portfolioRepo("featured-project", { tier: featured.id }),
    portfolioRepo("lab-project", { tier: lab.id }),
  ];
}

describe("groupRepos", () => {
  test("orders the sections and leaves no group empty", () => {
    const grouping = groupRepos(fullSet());

    expect(grouping.groups.map((group) => group.label)).toEqual([
      featured.label,
      web.label,
      data.label,
      cloudDevOps.label,
      lab.label,
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
        category: data.id,
        tier: featured.id,
      }),
      portfolioRepo("lab-web", { tier: lab.id }),
    ]);

    expect(grouping.groups.map((group) => group.id)).toEqual([
      featured.id,
      lab.id,
    ]);
    expect(grouping.groups[0]?.repos.map((value) => value.name)).toEqual([
      "featured-data",
    ]);
    expect(grouping.groups[1]?.repos.map((value) => value.name)).toEqual([
      "lab-web",
    ]);
  });

  test("groups a lab with and without a category in the same section", () => {
    const grouping = groupRepos([
      portfolioRepo("lab-without-category", {
        category: null,
        tier: lab.id,
      }),
      portfolioRepo("lab-with-category", {
        category: data.id,
        tier: lab.id,
      }),
    ]);

    expect(grouping.groups.map((group) => group.id)).toEqual([lab.id]);
    expect(grouping.groups[0]?.repos.map((value) => value.name)).toEqual([
      "lab-with-category",
      "lab-without-category",
    ]);
  });

  test("orders entries by archived, push date and name", () => {
    const grouping = groupRepos([
      portfolioRepo("archived", {
        archived: true,
        pushedAt: "2026-12-01T00:00:00Z",
      }),
      portfolioRepo("archived-older", {
        archived: true,
        pushedAt: "2025-06-01T00:00:00Z",
      }),
      portfolioRepo("archived-undated", {
        archived: true,
        pushedAt: null,
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
      "archived-older",
      "archived-undated",
    ]);
  });

  test("warns about every group that stays empty", () => {
    const grouping = groupRepos([portfolioRepo("web-project")]);

    expect(grouping.groups.map((group) => group.id)).toEqual([web.id]);
    expect(grouping.warnings).toEqual([
      `The "${featured.label}" group has no repository; its section is omitted.`,
      `Category "${data.label}" has no ${project.label.toLowerCase()}-tier repository; its section is omitted.`,
      `Category "${cloudDevOps.label}" has no ${project.label.toLowerCase()}-tier repository; its section is omitted.`,
      `The "${lab.label}" group has no repository; its section is omitted.`,
    ]);
  });

  test("warns when a category only holds featured or lab repositories", () => {
    const grouping = groupRepos([
      portfolioRepo("featured-data", {
        category: data.id,
        tier: featured.id,
      }),
      portfolioRepo("lab-data", {
        category: data.id,
        tier: lab.id,
      }),
    ]);

    expect(grouping.warnings).toContain(
      `Category "${data.label}" has no ${project.label.toLowerCase()}-tier repository; its section is omitted.`,
    );
  });

  test("warns about every group without repositories", () => {
    expect(groupRepos([])).toEqual({
      groups: [],
      warnings: [
        `The "${featured.label}" group has no repository; its section is omitted.`,
        ...CATEGORIES.map(
          (category) =>
            `Category "${category.label}" has no ${project.label.toLowerCase()}-tier repository; its section is omitted.`,
        ),
        `The "${lab.label}" group has no repository; its section is omitted.`,
      ],
    });
  });
});
