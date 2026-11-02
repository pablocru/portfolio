import { describe, expect, test } from "vitest";
import { PORTFOLIO_TOPIC_PREFIX } from "./portfolio";
import {
  CATEGORIZED_TIER_ID,
  DEFAULT_TIER_ID,
  TIERS,
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

  test("declares the default and categorized tier ids", () => {
    const ids = TIERS.map((tier) => tier.id);

    expect(ids).toContain(DEFAULT_TIER_ID);
    expect(ids).toContain(CATEGORIZED_TIER_ID);
  });

  test("reads the category requirement of every tier entry", () => {
    for (const tier of TIERS) {
      expect(tierRequiresCategory(tier.id)).toBe(tier.requiresCategory);
    }
  });
});
