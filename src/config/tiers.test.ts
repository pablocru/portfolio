import { describe, expect, test } from "vitest";
import { PORTFOLIO_TOPIC_PREFIX } from "./portfolio";
import {
  isGroupedTier,
  TIERS,
  type TierEntry,
  tierRequiresCategory,
  tierTopic,
} from "./tiers";

describe("TIERS", () => {
  test("declares unique ids and labels", () => {
    expect(new Set(TIERS.map((tier) => tier.id)).size).toBe(TIERS.length);
    expect(new Set(TIERS.map((tier) => tier.label)).size).toBe(TIERS.length);
  });

  test("derives the topic from the id", () => {
    for (const tier of TIERS) {
      expect(tierTopic(tier.id)).toBe(
        `${PORTFOLIO_TOPIC_PREFIX}tier-${tier.id}`,
      );
    }
  });

  test("reads the category requirement of every tier entry", () => {
    for (const tier of TIERS) {
      expect(tierRequiresCategory(tier.id)).toBe(tier.requiresCategory);
    }
  });

  test("reads the grouped-by-category flag of every tier entry", () => {
    for (const tier of TIERS) {
      expect(isGroupedTier(tier)).toBe(
        tier.requiresCategory === true && tier.groupedByCategory === true,
      );
    }
  });

  test("a tier that does not require a category cannot be declared as grouped by category", () => {
    // @ts-expect-error A tier without a category cannot be grouped by category.
    const invalidTier: TierEntry = {
      id: "invalid",
      label: "Invalid",
      requiresCategory: false,
      groupedByCategory: true,
    };

    expect(invalidTier).toBeDefined();
  });

  test("a tier that requires a category declares whether it is grouped", () => {
    // @ts-expect-error A category-requiring tier must declare the grouping flag.
    const invalidTier: TierEntry = {
      id: "invalid",
      label: "Invalid",
      requiresCategory: true,
    };

    expect(invalidTier).toBeDefined();
  });
});
