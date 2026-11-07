import { describe, expect, test } from "vitest";
import { CATEGORIES } from "../../config/categories";
import { firstCategory, secondCategory } from "../../config/categories.fixture";
import { isGroupedTier, TIERS } from "../../config/tiers";
import {
  firstGroupedTier,
  firstNonGroupedTier,
  nonGroupedTiers,
} from "../../config/tiers.fixture";
import { portfolioRepo } from "../../types/repo.fixture";
import type { PortfolioRepo } from "../../types/repo.type";
import { groupRepos } from "./repo-groups";

const groupedTier = firstGroupedTier();
const nonGroupedTier = firstNonGroupedTier();

const expectedSectionLabels = TIERS.flatMap((tier) =>
  isGroupedTier(tier)
    ? CATEGORIES.map((category) => category.label)
    : [tier.label],
);

function fullSet(): PortfolioRepo[] {
  return [
    ...CATEGORIES.map((category) =>
      portfolioRepo(`${category.id}-project`, {
        category: category.id,
        tier: groupedTier.id,
      }),
    ),
    ...nonGroupedTiers.map((tier) =>
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
    const grouping = groupRepos([
      portfolioRepo("tier-with-category", {
        category: secondCategory().id,
        tier: nonGroupedTier.id,
      }),
      portfolioRepo("other-tier-repo", { tier: nonGroupedTier.id }),
    ]);

    expect(grouping.groups.map((group) => group.id)).toEqual([
      nonGroupedTier.id,
    ]);
    expect(grouping.groups[0]?.repos.map((value) => value.name)).toEqual([
      "other-tier-repo",
      "tier-with-category",
    ]);
  });

  test("groups a non-grouped tier with and without a category in the same section", () => {
    const grouping = groupRepos([
      portfolioRepo("tier-without-category", {
        category: null,
        tier: nonGroupedTier.id,
      }),
      portfolioRepo("tier-with-category", {
        category: secondCategory().id,
        tier: nonGroupedTier.id,
      }),
    ]);

    expect(grouping.groups.map((group) => group.id)).toEqual([
      nonGroupedTier.id,
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
      portfolioRepo(`${firstCategory().id}-project`, {
        category: firstCategory().id,
        tier: groupedTier.id,
      }),
    ]);

    expect(grouping.groups.map((group) => group.id)).toEqual([
      firstCategory().id,
    ]);

    const expectedWarnings: string[] = [];
    for (const tier of TIERS) {
      if (isGroupedTier(tier)) {
        for (const category of CATEGORIES) {
          if (category.id !== firstCategory().id) {
            expectedWarnings.push(
              `Category "${category.label}" has no ${groupedTier.label.toLowerCase()}-tier repository; its section is omitted.`,
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

  test("warns when a category only holds non-grouped-tier repositories", () => {
    const grouping = groupRepos([
      portfolioRepo("non-grouped-tier-category", {
        category: secondCategory().id,
        tier: nonGroupedTier.id,
      }),
    ]);

    expect(grouping.warnings).toContain(
      `Category "${secondCategory().label}" has no ${groupedTier.label.toLowerCase()}-tier repository; its section is omitted.`,
    );
  });

  test("warns about every group without repositories", () => {
    expect(groupRepos([])).toEqual({
      groups: [],
      warnings: TIERS.flatMap((tier) =>
        isGroupedTier(tier)
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
