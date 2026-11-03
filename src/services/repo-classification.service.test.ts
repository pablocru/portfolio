import { describe, expect, test } from "vitest";
import { CATEGORIES, categoryTopic } from "../config/categories";
import {
  PORTFOLIO_OPT_IN_TOPIC,
  PORTFOLIO_TOPIC_PREFIX,
} from "../config/portfolio";
import { DEFAULT_TIER_ID, TIERS, tierTopic } from "../config/tiers";
import { githubRepo } from "../mappers/repo.fixture";
import { classifyRepo } from "./repo-classification.service";

const [firstCategory, secondCategory] = CATEGORIES;
const firstCategoryTopic = categoryTopic(firstCategory.id);
const secondCategoryTopic = categoryTopic(secondCategory.id);
const UNKNOWN_CATEGORY_TOPIC = `${PORTFOLIO_TOPIC_PREFIX}cat-desgin`;

const requiredTiers = TIERS.filter((tier) => tier.requiresCategory);
const optionalTiers = TIERS.filter((tier) => !tier.requiresCategory);

describe("classifyRepo", () => {
  test("publishes a repository with its classification", () => {
    expect(classifyRepo(githubRepo)).toEqual({
      kind: "published",
      category: firstCategory.id,
      tier: DEFAULT_TIER_ID,
    });
  });

  test.each(TIERS.filter((tier) => tier.id !== DEFAULT_TIER_ID))(
    "reads the %s tier topic",
    (tier) => {
      expect(
        classifyRepo({
          ...githubRepo,
          topics: [...githubRepo.topics, tierTopic(tier.id)],
        }),
      ).toMatchObject({ tier: tier.id });
    },
  );

  test("treats an explicit default tier as the default", () => {
    const implicit = classifyRepo(githubRepo);
    const explicit = classifyRepo({
      ...githubRepo,
      topics: [...githubRepo.topics, tierTopic(DEFAULT_TIER_ID)],
    });

    expect(explicit).toEqual(implicit);
  });

  test.each(
    TIERS.flatMap((first, index) =>
      TIERS.slice(index + 1).map((second) => [first.id, second.id]),
    ),
  )("rejects the tier topics pf-tier-%s and pf-tier-%s", (first, second) => {
    const topics = [tierTopic(first), tierTopic(second)];

    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [...githubRepo.topics, ...topics],
      }),
    ).toThrow(
      `Repository "portfolio" carries more than one tier topic: "${topics[0]}", "${topics[1]}"`,
    );
  });

  test.each(requiredTiers)(
    "rejects a %s-tier repository without a category",
    (tier) => {
      const topics =
        tier.id === DEFAULT_TIER_ID
          ? [PORTFOLIO_OPT_IN_TOPIC]
          : [PORTFOLIO_OPT_IN_TOPIC, tierTopic(tier.id)];

      expect(() => classifyRepo({ ...githubRepo, topics })).toThrow(
        'Repository "portfolio" is published but carries no category topic',
      );
    },
  );

  test.each(optionalTiers)(
    "publishes a %s-tier repository without a category",
    (tier) => {
      expect(
        classifyRepo({
          ...githubRepo,
          topics: [PORTFOLIO_OPT_IN_TOPIC, tierTopic(tier.id)],
        }),
      ).toEqual({ kind: "published", category: null, tier: tier.id });
    },
  );

  test.each(optionalTiers)(
    "keeps the category of a %s-tier repository that has one",
    (tier) => {
      expect(
        classifyRepo({
          ...githubRepo,
          topics: [
            PORTFOLIO_OPT_IN_TOPIC,
            tierTopic(tier.id),
            firstCategoryTopic,
          ],
        }),
      ).toEqual({
        kind: "published",
        category: firstCategory.id,
        tier: tier.id,
      });
    },
  );

  test("rejects two category topics", () => {
    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [
          PORTFOLIO_OPT_IN_TOPIC,
          firstCategoryTopic,
          secondCategoryTopic,
        ],
      }),
    ).toThrow(
      `Repository "portfolio" carries more than one category topic: "${firstCategoryTopic}", "${secondCategoryTopic}"`,
    );
  });

  test.each(TIERS)(
    "rejects two category topics on a %s-tier repository",
    (tier) => {
      expect(() =>
        classifyRepo({
          ...githubRepo,
          topics: [
            PORTFOLIO_OPT_IN_TOPIC,
            tierTopic(tier.id),
            firstCategoryTopic,
            secondCategoryTopic,
          ],
        }),
      ).toThrow(
        `Repository "portfolio" carries more than one category topic: "${firstCategoryTopic}", "${secondCategoryTopic}"`,
      );
    },
  );

  test("rejects an unknown control topic", () => {
    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [...githubRepo.topics, UNKNOWN_CATEGORY_TOPIC],
      }),
    ).toThrow(
      `Repository "portfolio" carries unknown control topics: "${UNKNOWN_CATEGORY_TOPIC}"`,
    );
  });

  test("reports every classification fault in one error", () => {
    const [firstTier, secondTier] = TIERS;

    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [
          PORTFOLIO_OPT_IN_TOPIC,
          firstCategoryTopic,
          secondCategoryTopic,
          tierTopic(firstTier.id),
          tierTopic(secondTier.id),
          UNKNOWN_CATEGORY_TOPIC,
        ],
      }),
    ).toThrow(
      /Repository "portfolio" has 3 classification faults:[\s\S]*unknown control topics[\s\S]*more than one category topic[\s\S]*more than one tier topic/,
    );
  });

  test("reports only the tier fault when the category requirement is unknown", () => {
    const [firstTier, secondTier] = TIERS;

    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [
          PORTFOLIO_OPT_IN_TOPIC,
          tierTopic(firstTier.id),
          tierTopic(secondTier.id),
        ],
      }),
    ).toThrow(/Repository "portfolio" carries more than one tier topic:/);
  });

  test("warns about a private repository tagged for publication", () => {
    const result = classifyRepo({ ...githubRepo, private: true });

    expect(result).toMatchObject({ kind: "warned" });
    expect(result).toHaveProperty(
      "warning",
      expect.stringContaining('Repository "portfolio"'),
    );
    expect(result).toHaveProperty(
      "warning",
      expect.stringContaining('carries "pf-show" but is private'),
    );
  });

  test("warns about a classified repository without the opt-in topic", () => {
    const [firstTier] = TIERS;
    const result = classifyRepo({
      ...githubRepo,
      topics: [firstCategoryTopic, tierTopic(firstTier.id)],
    });

    expect(result).toMatchObject({ kind: "warned" });
    expect(result).toHaveProperty(
      "warning",
      expect.stringContaining(
        `"${firstCategoryTopic}", "${tierTopic(firstTier.id)}" but not "pf-show"`,
      ),
    );
  });

  test("warns about an unknown control topic without the opt-in topic", () => {
    const result = classifyRepo({
      ...githubRepo,
      topics: [UNKNOWN_CATEGORY_TOPIC],
    });

    expect(result).toMatchObject({ kind: "warned" });
    expect(result).toHaveProperty(
      "warning",
      expect.stringContaining(`"${UNKNOWN_CATEGORY_TOPIC}" but not "pf-show"`),
    );
  });

  test("ignores a repository the owner did not classify", () => {
    expect(classifyRepo({ ...githubRepo, topics: ["astro"] })).toEqual({
      kind: "ignored",
    });
  });

  test("ignores a repository without topics", () => {
    expect(classifyRepo({ ...githubRepo, topics: undefined })).toEqual({
      kind: "ignored",
    });
  });
});
