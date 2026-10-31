import { describe, expect, test } from "vitest";
import { CATEGORIES } from "../config/categories";
import { RepoTier } from "../constants";
import { mapRepo } from "./repo.mapper";

const [web, data] = CATEGORIES;

const githubRepo = {
  name: "portfolio",
  description: "A window to my projects",
  language: "TypeScript",
  html_url: "https://github.com/pablocru/portfolio",
  archived: false,
  private: false,
  pushed_at: "2026-10-20T09:00:00Z",
  topics: ["pf-show", "pf-cat-web"],
};

describe("mapRepo", () => {
  test("maps the repository fields", () => {
    expect(mapRepo(githubRepo, web.id, RepoTier.Project)).toEqual({
      name: "portfolio",
      description: "A window to my projects",
      language: "TypeScript",
      url: "https://github.com/pablocru/portfolio",
      archived: false,
      pushedAt: "2026-10-20T09:00:00Z",
      category: web.id,
      tier: RepoTier.Project,
    });
  });

  test("keeps the trimmed description", () => {
    expect(
      mapRepo(
        { ...githubRepo, description: "  A window  " },
        web.id,
        RepoTier.Project,
      ).description,
    ).toBe("A window");
  });

  test.each([null, "", "   "])(
    "drops the description when it is %j",
    (description) => {
      expect(
        mapRepo({ ...githubRepo, description }, web.id, RepoTier.Project)
          .description,
      ).toBeNull();
    },
  );

  test("maps a repository without a language", () => {
    expect(
      mapRepo({ ...githubRepo, language: null }, web.id, RepoTier.Project)
        .language,
    ).toBeNull();
  });

  test("maps an archived repository", () => {
    expect(
      mapRepo({ ...githubRepo, archived: true }, web.id, RepoTier.Project)
        .archived,
    ).toBe(true);
  });

  test("maps a repository without a push date", () => {
    expect(
      mapRepo({ ...githubRepo, pushed_at: null }, web.id, RepoTier.Project)
        .pushedAt,
    ).toBeNull();
  });

  test("keeps the category and tier it receives", () => {
    expect(mapRepo(githubRepo, data.id, RepoTier.Lab)).toMatchObject({
      category: data.id,
      tier: RepoTier.Lab,
    });
  });
});
