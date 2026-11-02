import { describe, expect, test } from "vitest";
import { CATEGORIES } from "../config/categories";
import { PORTFOLIO_OPT_IN_TOPIC } from "../config/portfolio";
import { TIERS, type TierId, tierTopic } from "../config/tiers";
import { githubRepo } from "../mappers/repo.fixture";
import { classifyRepo } from "../services/repo-classification.service";
import { portfolioRepo } from "../types/repo.fixture";
import type { PortfolioRepo } from "../types/repo.type";
import { repoSchema } from "./repo.schema";

const [, data] = CATEGORIES;
const [featured, project, lab] = TIERS;

function parse(overrides: Partial<PortfolioRepo> = {}) {
  return repoSchema.safeParse(portfolioRepo("portfolio", overrides));
}

/** Classifies a repository tagged only with the opt-in topic and one tier. */
function classificationOutcome(tier: TierId): "published" | "rejected" {
  try {
    classifyRepo({
      ...githubRepo,
      topics: [PORTFOLIO_OPT_IN_TOPIC, tierTopic(tier)],
    });

    return "published";
  } catch {
    return "rejected";
  }
}

describe("repoSchema", () => {
  test("accepts a lab without a category", () => {
    expect(parse({ category: null, tier: lab.id }).success).toBe(true);
  });

  test("stores the category of a lab that has one", () => {
    const result = parse({ category: data.id, tier: lab.id });

    expect(result.success).toBe(true);
    expect(result.data?.category).toBe(data.id);
  });

  test("rejects a project without a category, naming the tier", () => {
    const result = parse({ category: null, tier: project.id });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        message: `Tier "${project.id}" requires a category`,
        path: ["category"],
      }),
    );
  });

  test("rejects a featured repository without a category, naming the tier", () => {
    const result = parse({ category: null, tier: featured.id });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        message: `Tier "${featured.id}" requires a category`,
        path: ["category"],
      }),
    );
  });

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
