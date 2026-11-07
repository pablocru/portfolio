import {
  CATEGORIES,
  type CategoryId,
  type CategoryLabel,
  categoryTopic,
} from "./categories";

/**
 * Category representatives the tests pick by shape. They are derived here
 * rather than in the configuration because the site reads `CATEGORIES`; only
 * the tests need to ask for "a category of this shape".
 */
function mustFindCategory<T>(category: T | undefined, description: string): T {
  if (category === undefined) {
    throw new Error(`The category configuration declares no ${description}.`);
  }

  return category;
}

/** The first declared category. */
export function firstCategory(): {
  readonly id: CategoryId;
  readonly label: CategoryLabel;
} {
  return mustFindCategory(CATEGORIES[0], "category");
}

/** A second category, distinct from the first one. */
export function secondCategory(): {
  readonly id: CategoryId;
  readonly label: CategoryLabel;
} {
  return mustFindCategory(CATEGORIES[1], "second category");
}

/** The topic of the first declared category. */
export function firstCategoryTopic(): string {
  return categoryTopic(firstCategory().id);
}

/** The topic of the second declared category. */
export function secondCategoryTopic(): string {
  return categoryTopic(secondCategory().id);
}
