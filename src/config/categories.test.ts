import { describe, expect, test } from "vitest";
import { CATEGORIES, categoryTopic } from "./categories";
import { PORTFOLIO_TOPIC_PREFIX } from "./portfolio";

describe("CATEGORIES", () => {
  test("declares unique ids and labels", () => {
    expect(new Set(CATEGORIES.map((category) => category.id)).size).toBe(
      CATEGORIES.length,
    );
    expect(new Set(CATEGORIES.map((category) => category.label)).size).toBe(
      CATEGORIES.length,
    );
  });

  test("derives the topic from the id", () => {
    for (const category of CATEGORIES) {
      expect(categoryTopic(category.id)).toBe(
        `${PORTFOLIO_TOPIC_PREFIX}cat-${category.id}`,
      );
    }
  });
});
