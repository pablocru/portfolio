import { describe, expect, test } from "vitest";
import { firstCategory, secondCategory } from "../config/categories.fixture";
import { firstOptionalTier, firstRequiredTier } from "../config/tiers.fixture";
import { githubRepo } from "./repo.fixture";
import { mapRepo } from "./repo.mapper";

const requiredTier = firstRequiredTier();
const optionalTier = firstOptionalTier();

describe("mapRepo", () => {
  test("maps the repository fields", () => {
    expect(mapRepo(githubRepo, firstCategory().id, requiredTier.id)).toEqual({
      name: "portfolio",
      description: "A window to my projects",
      language: "TypeScript",
      url: githubRepo.html_url,
      archived: false,
      pushedAt: "2026-10-20T09:00:00Z",
      category: firstCategory().id,
      tier: requiredTier.id,
    });
  });

  test("keeps the trimmed description", () => {
    expect(
      mapRepo(
        { ...githubRepo, description: "  A window  " },
        firstCategory().id,
        requiredTier.id,
      ).description,
    ).toBe("A window");
  });

  test.each([null, "", "   "])(
    "drops the description when it is %j",
    (description) => {
      expect(
        mapRepo(
          { ...githubRepo, description },
          firstCategory().id,
          requiredTier.id,
        ).description,
      ).toBeNull();
    },
  );

  test("maps a repository without a language", () => {
    expect(
      mapRepo(
        { ...githubRepo, language: null },
        firstCategory().id,
        requiredTier.id,
      ).language,
    ).toBeNull();
  });

  test("maps an archived repository", () => {
    expect(
      mapRepo(
        { ...githubRepo, archived: true },
        firstCategory().id,
        requiredTier.id,
      ).archived,
    ).toBe(true);
  });

  test("maps a repository without a push date", () => {
    expect(
      mapRepo(
        { ...githubRepo, pushed_at: null },
        firstCategory().id,
        requiredTier.id,
      ).pushedAt,
    ).toBeNull();
  });

  test("keeps the category and tier it receives", () => {
    expect(
      mapRepo(githubRepo, secondCategory().id, optionalTier.id),
    ).toMatchObject({
      category: secondCategory().id,
      tier: optionalTier.id,
    });
  });
});
