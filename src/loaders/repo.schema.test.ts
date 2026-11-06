import { describe, expect, test } from "vitest";
import { CATEGORIES } from "../config/categories";
import { TIERS, type TierId, tierTopic } from "../config/tiers";
import { optionalTiers, requiredTiers } from "../config/tiers.fixture";
import { githubRepo } from "../mappers/repo.fixture";
import { classifyRepo } from "../services/repo-classification.service";
import { portfolioRepo } from "../types/repo.fixture";
import type { PortfolioRepo } from "../types/repo.type";
import { repoSchema } from "./repo.schema";

const [firstCategory] = CATEGORIES;

function parse(overrides: Partial<PortfolioRepo> = {}) {
  return repoSchema.safeParse(portfolioRepo("portfolio", overrides));
}

/** Classifies a repository tagged only with one tier topic. */
function classificationOutcome(tier: TierId): "published" | "rejected" {
  try {
    classifyRepo({
      ...githubRepo,
      topics: [tierTopic(tier)],
    });

    return "published";
  } catch {
    return "rejected";
  }
}

describe("repoSchema", () => {
  test("covers at least one tier of each category requirement", () => {
    expect(requiredTiers.length).toBeGreaterThan(0);
    expect(optionalTiers.length).toBeGreaterThan(0);
  });

  test.each(optionalTiers)(
    "accepts a %s-tier repository without a category",
    (tier) => {
      expect(parse({ category: null, tier: tier.id }).success).toBe(true);
    },
  );

  test.each(optionalTiers)(
    "stores the category of a %s-tier repository that has one",
    (tier) => {
      const result = parse({ category: firstCategory.id, tier: tier.id });

      expect(result.success).toBe(true);
      expect(result.data?.category).toBe(firstCategory.id);
    },
  );

  test.each(requiredTiers)(
    "rejects a %s-tier repository without a category, naming the tier",
    (tier) => {
      const result = parse({ category: null, tier: tier.id });

      expect(result.success).toBe(false);
      expect(result.error?.issues).toContainEqual(
        expect.objectContaining({
          message: `Tier "${tier.id}" requires a category`,
          path: ["category"],
        }),
      );
    },
  );

  test("rejects an unknown category", () => {
    const result = repoSchema.safeParse({
      ...portfolioRepo("portfolio"),
      category: "design",
    });

    expect(result.success).toBe(false);
  });

  test.each(TIERS)(
    "reads a null category of tier $id as required only when the tier says so",
    (tier) => {
      expect(classificationOutcome(tier.id)).toBe(
        tier.requiresCategory ? "rejected" : "published",
      );
      expect(
        repoSchema.safeParse(
          portfolioRepo("portfolio", { category: null, tier: tier.id }),
        ).success,
      ).toBe(!tier.requiresCategory);
    },
  );
});
