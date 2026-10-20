import { describe, expect, test } from "vitest";
import { RepoCategory, RepoTier } from "../constants";
import { mapRepo } from "./repo.mapper";

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
    expect(mapRepo(githubRepo, RepoCategory.Web, RepoTier.Project)).toEqual({
      name: "portfolio",
      description: "A window to my projects",
      language: "TypeScript",
      url: "https://github.com/pablocru/portfolio",
      archived: false,
      pushedAt: "2026-10-20T09:00:00Z",
      category: RepoCategory.Web,
      tier: RepoTier.Project,
    });
  });

  test("keeps the trimmed description", () => {
    expect(
      mapRepo(
        { ...githubRepo, description: "  A window  " },
        RepoCategory.Web,
        RepoTier.Project,
      ).description,
    ).toBe("A window");
  });

  test.each([null, "", "   "])(
    "drops the description when it is %j",
    (description) => {
      expect(
        mapRepo(
          { ...githubRepo, description },
          RepoCategory.Web,
          RepoTier.Project,
        ).description,
      ).toBeNull();
    },
  );

  test("maps a repository without a language", () => {
    expect(
      mapRepo(
        { ...githubRepo, language: null },
        RepoCategory.Web,
        RepoTier.Project,
      ).language,
    ).toBeNull();
  });

  test("maps an archived repository", () => {
    expect(
      mapRepo(
        { ...githubRepo, archived: true },
        RepoCategory.Web,
        RepoTier.Project,
      ).archived,
    ).toBe(true);
  });

  test("maps a repository without a push date", () => {
    expect(
      mapRepo(
        { ...githubRepo, pushed_at: null },
        RepoCategory.Web,
        RepoTier.Project,
      ).pushedAt,
    ).toBeNull();
  });

  test("keeps the category and tier it receives", () => {
    expect(mapRepo(githubRepo, RepoCategory.Data, RepoTier.Lab)).toMatchObject({
      category: RepoCategory.Data,
      tier: RepoTier.Lab,
    });
  });
});
