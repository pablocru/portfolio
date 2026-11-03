import { describe, expect, test } from "vitest";
import { CATEGORIES } from "../../config/categories";
import { CATEGORIZED_TIER_ID, TIERS } from "../../config/tiers";
import { portfolioRepo } from "../../types/repo.fixture";
import type { PortfolioRepo } from "../../types/repo.type";
import { groupRepos } from "./repo-groups";

const [web, data] = CATEGORIES;
const nonCategorizedTiers = TIERS.filter(
  (tier) => tier.id !== CATEGORIZED_TIER_ID,
);
const categorizedTier = TIERS.find((tier) => tier.id === CATEGORIZED_TIER_ID);

const expectedSectionLabels = TIERS.flatMap((tier) =>
  tier.id === CATEGORIZED_TIER_ID
    ? CATEGORIES.map((category) => category.label)
    : [tier.label],
);

function fullSet(): PortfolioRepo[] {
  return [
    ...CATEGORIES.map((category) =>
      portfolioRepo(`${category.id}-project`, {
        category: category.id,
        tier: CATEGORIZED_TIER_ID,
      }),
    ),
    ...nonCategorizedTiers.map((tier) =>
      portfolioRepo(`${tier.id}-repo`, { tier: tier.id }),
    ),
  ];
}

describe("groupRepos", () => {
  test("orders the sections and leaves no group empty", () => {
    const grouping = groupRepos(fullSet());

    expect(grouping.groups.map((group) => group.label)).toEqual(
      expectedSectionLabels,
    );
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
    const [nonCategorizedTier] = nonCategorizedTiers;

    const grouping = groupRepos([
      portfolioRepo("tier-with-category", {
        category: data.id,
        tier: nonCategorizedTier.id,
      }),
      portfolioRepo("other-tier-repo", { tier: nonCategorizedTier.id }),
    ]);

    expect(grouping.groups.map((group) => group.id)).toEqual([
      nonCategorizedTier.id,
    ]);
    expect(grouping.groups[0]?.repos.map((value) => value.name)).toEqual([
      "other-tier-repo",
      "tier-with-category",
    ]);
  });

  test("groups a non-categorized tier with and without a category in the same section", () => {
    const [nonCategorizedTier] = nonCategorizedTiers;

    const grouping = groupRepos([
      portfolioRepo("tier-without-category", {
        category: null,
        tier: nonCategorizedTier.id,
      }),
      portfolioRepo("tier-with-category", {
        category: data.id,
        tier: nonCategorizedTier.id,
      }),
    ]);

    expect(grouping.groups.map((group) => group.id)).toEqual([
      nonCategorizedTier.id,
    ]);
    expect(grouping.groups[0]?.repos.map((value) => value.name)).toEqual([
      "tier-with-category",
      "tier-without-category",
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
    const grouping = groupRepos([
      portfolioRepo(`${web.id}-project`, {
        category: web.id,
        tier: CATEGORIZED_TIER_ID,
      }),
    ]);

    expect(grouping.groups.map((group) => group.id)).toEqual([web.id]);

    const expectedWarnings: string[] = [];
    for (const tier of TIERS) {
      if (tier.id === CATEGORIZED_TIER_ID) {
        for (const category of CATEGORIES) {
          if (category.id !== web.id) {
            expectedWarnings.push(
              `Category "${category.label}" has no ${categorizedTier?.label.toLowerCase()}-tier repository; its section is omitted.`,
            );
          }
        }
      } else {
        expectedWarnings.push(
          `The "${tier.label}" group has no repository; its section is omitted.`,
        );
      }
    }

    expect(grouping.warnings).toEqual(expectedWarnings);
  });

  test("warns when a category only holds non-categorized-tier repositories", () => {
    const [nonCategorizedTier] = nonCategorizedTiers;

    const grouping = groupRepos([
      portfolioRepo("non-categorized-tier-category", {
        category: data.id,
        tier: nonCategorizedTier.id,
      }),
    ]);

    expect(grouping.warnings).toContain(
      `Category "${data.label}" has no ${categorizedTier?.label.toLowerCase()}-tier repository; its section is omitted.`,
    );
  });

  test("warns about every group without repositories", () => {
    expect(groupRepos([])).toEqual({
      groups: [],
      warnings: TIERS.flatMap((tier) =>
        tier.id === CATEGORIZED_TIER_ID
          ? CATEGORIES.map(
              (category) =>
                `Category "${category.label}" has no ${tier.label.toLowerCase()}-tier repository; its section is omitted.`,
            )
          : [
              `The "${tier.label}" group has no repository; its section is omitted.`,
            ],
      ),
    });
  });
});
