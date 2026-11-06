import { describe, expect, test } from "vitest";
import { CATEGORIES, categoryTopic } from "../config/categories";
import { PORTFOLIO_TOPIC_PREFIX } from "../config/portfolio";
import { TIERS, tierTopic } from "../config/tiers";
import { githubRepo } from "../mappers/repo.fixture";
import { classifyRepo } from "./repo-classification.service";

const [firstCategory, secondCategory] = CATEGORIES;
const firstCategoryTopic = categoryTopic(firstCategory.id);
const secondCategoryTopic = categoryTopic(secondCategory.id);
const UNKNOWN_CATEGORY_TOPIC = `${PORTFOLIO_TOPIC_PREFIX}cat-desgin`;
const UNKNOWN_TIER_TOPIC = `${PORTFOLIO_TOPIC_PREFIX}tier-desgin`;
const RETIRED_OPT_IN_TOPIC = `${PORTFOLIO_TOPIC_PREFIX}show`;

const requiredTiers = TIERS.filter((tier) => tier.requiresCategory);
const optionalTiers = TIERS.filter((tier) => !tier.requiresCategory);

describe("classifyRepo", () => {
  test("publishes a repository with its classification", () => {
    expect(classifyRepo(githubRepo)).toEqual({
      kind: "published",
      category: firstCategory.id,
      tier: "project",
    });
  });

  test.each(TIERS)(
    "publishes a public repository with the %s tier topic",
    (tier) => {
      expect(
        classifyRepo({
          ...githubRepo,
          topics: [tierTopic(tier.id), firstCategoryTopic],
        }),
      ).toEqual({
        kind: "published",
        category: firstCategory.id,
        tier: tier.id,
      });
    },
  );

  test.each(requiredTiers)(
    "rejects a %s-tier repository without a category",
    (tier) => {
      expect(() =>
        classifyRepo({
          ...githubRepo,
          topics: [tierTopic(tier.id)],
        }),
      ).toThrow(
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
          topics: [tierTopic(tier.id)],
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
          topics: [tierTopic(tier.id), firstCategoryTopic],
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
        topics: [tierTopic("project"), firstCategoryTopic, secondCategoryTopic],
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
          topics: [tierTopic(tier.id), firstCategoryTopic, secondCategoryTopic],
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
        topics: [
          tierTopic("project"),
          firstCategoryTopic,
          UNKNOWN_CATEGORY_TOPIC,
        ],
      }),
    ).toThrow(
      `Repository "portfolio" carries unknown control topics: "${UNKNOWN_CATEGORY_TOPIC}"`,
    );
  });

  test("rejects an unknown tier topic naming the repository and the topic", () => {
    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [UNKNOWN_TIER_TOPIC],
      }),
    ).toThrow(
      `Repository "portfolio" carries unknown tier topic: "${UNKNOWN_TIER_TOPIC}"`,
    );
  });

  test("rejects two tier topics naming the repository and the topics", () => {
    const [firstTier, secondTier] = TIERS;
    const topics = [tierTopic(firstTier.id), tierTopic(secondTier.id)];

    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [...topics, firstCategoryTopic],
      }),
    ).toThrow(
      `Repository "portfolio" carries more than one tier topic: "${topics[0]}", "${topics[1]}"`,
    );
  });

  test("reports every classification fault in one error", () => {
    const [firstTier, secondTier] = TIERS;

    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [
          tierTopic(firstTier.id),
          tierTopic(secondTier.id),
          firstCategoryTopic,
          secondCategoryTopic,
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
        topics: [tierTopic(firstTier.id), tierTopic(secondTier.id)],
      }),
    ).toThrow(/Repository "portfolio" carries more than one tier topic:/);
  });

  test("warns about a private repository tagged for publication", () => {
    const [firstTier] = TIERS;
    const result = classifyRepo({
      ...githubRepo,
      private: true,
      topics: [tierTopic(firstTier.id), firstCategoryTopic],
    });

    expect(result).toMatchObject({ kind: "warned" });
    expect(result).toHaveProperty(
      "warning",
      expect.stringContaining('Repository "portfolio"'),
    );
    expect(result).toHaveProperty(
      "warning",
      expect.stringContaining(
        `carries "${tierTopic(firstTier.id)}" but is private`,
      ),
    );
  });

  test.each(requiredTiers)(
    "warns about a private %s-tier repository without a category",
    (tier) => {
      const result = classifyRepo({
        ...githubRepo,
        private: true,
        topics: [tierTopic(tier.id)],
      });

      expect(result).toMatchObject({ kind: "warned" });
      expect(result).toHaveProperty(
        "warning",
        expect.stringContaining(
          `carries "${tierTopic(tier.id)}" but is private`,
        ),
      );
    },
  );

  test("warns about a private repository with an unknown tier topic", () => {
    const result = classifyRepo({
      ...githubRepo,
      private: true,
      topics: [UNKNOWN_TIER_TOPIC],
    });

    expect(result).toMatchObject({ kind: "warned" });
    expect(result).toHaveProperty(
      "warning",
      expect.stringContaining(`carries "${UNKNOWN_TIER_TOPIC}" but is private`),
    );
  });

  test("warns about a private repository with two tier topics naming both", () => {
    const [firstTier, secondTier] = TIERS;
    const topics = [tierTopic(firstTier.id), tierTopic(secondTier.id)];
    const result = classifyRepo({
      ...githubRepo,
      private: true,
      topics,
    });

    expect(result).toMatchObject({ kind: "warned" });
    expect(result).toHaveProperty(
      "warning",
      expect.stringContaining(
        `carries "${topics[0]}", "${topics[1]}" but is private`,
      ),
    );
  });

  test("warns about a private repository with an unknown control topic", () => {
    const [firstTier] = TIERS;
    const result = classifyRepo({
      ...githubRepo,
      private: true,
      topics: [
        tierTopic(firstTier.id),
        firstCategoryTopic,
        RETIRED_OPT_IN_TOPIC,
      ],
    });

    expect(result).toMatchObject({ kind: "warned" });
    expect(result).toHaveProperty(
      "warning",
      expect.stringContaining(
        `carries "${tierTopic(firstTier.id)}" but is private`,
      ),
    );
  });

  test("warns about a classified repository without a tier topic", () => {
    const result = classifyRepo({
      ...githubRepo,
      topics: [firstCategoryTopic],
    });

    expect(result).toMatchObject({ kind: "warned" });
    expect(result).toHaveProperty(
      "warning",
      expect.stringContaining(`"${firstCategoryTopic}" but no tier topic`),
    );
  });

  test("treats pf-show as an unknown control topic without a tier topic", () => {
    const result = classifyRepo({
      ...githubRepo,
      topics: [RETIRED_OPT_IN_TOPIC],
    });

    expect(result).toMatchObject({ kind: "warned" });
    expect(result).toHaveProperty(
      "warning",
      expect.stringContaining(`"${RETIRED_OPT_IN_TOPIC}" but no tier topic`),
    );
  });

  test("treats pf-show as an unknown control topic with a tier topic", () => {
    const [firstTier] = TIERS;

    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [
          tierTopic(firstTier.id),
          firstCategoryTopic,
          RETIRED_OPT_IN_TOPIC,
        ],
      }),
    ).toThrow(
      `Repository "portfolio" carries unknown control topics: "${RETIRED_OPT_IN_TOPIC}"`,
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

  const noControlTopics = ["astro"];
  const controlTopicsWithoutTier = [firstCategoryTopic];
  const validTierTopics = [tierTopic("project"), firstCategoryTopic];
  const invalidTierTopics = [tierTopic("project")];

  const classificationCases = [
    {
      visibility: "public",
      private: false,
      state: "no control topics",
      topics: noControlTopics,
      expected: "ignored",
    },
    {
      visibility: "public",
      private: false,
      state: "control topics without a tier topic",
      topics: controlTopicsWithoutTier,
      expected: "warned",
    },
    {
      visibility: "public",
      private: false,
      state: "a tier topic with valid topics",
      topics: validTierTopics,
      expected: "published",
    },
    {
      visibility: "public",
      private: false,
      state: "a tier topic with invalid topics",
      topics: invalidTierTopics,
      expected: "error",
    },
    {
      visibility: "private",
      private: true,
      state: "no control topics",
      topics: noControlTopics,
      expected: "ignored",
    },
    {
      visibility: "private",
      private: true,
      state: "control topics without a tier topic",
      topics: controlTopicsWithoutTier,
      expected: "warned",
    },
    {
      visibility: "private",
      private: true,
      state: "a tier topic with valid topics",
      topics: validTierTopics,
      expected: "warned",
    },
    {
      visibility: "private",
      private: true,
      state: "a tier topic with invalid topics",
      topics: invalidTierTopics,
      expected: "warned",
    },
  ] as const;

  test.each(classificationCases)(
    "handles a $visibility repository with $state",
    ({ private: isPrivate, topics, expected }) => {
      const repo = { ...githubRepo, private: isPrivate, topics: [...topics] };

      switch (expected) {
        case "ignored":
          expect(classifyRepo(repo)).toEqual({ kind: "ignored" });
          break;
        case "warned": {
          const result = classifyRepo(repo);

          expect(result).toMatchObject({ kind: "warned" });
          expect(result).toHaveProperty(
            "warning",
            expect.stringContaining('Repository "portfolio"'),
          );
          break;
        }
        case "published":
          expect(classifyRepo(repo)).toMatchObject({ kind: "published" });
          break;
        case "error":
          expect(() => classifyRepo(repo)).toThrow();
          break;
      }
    },
  );
});
