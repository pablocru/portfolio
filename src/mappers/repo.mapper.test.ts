import { describe, expect, test } from "vitest";
import { CATEGORIES, categoryTopic } from "../config/categories";
import { PORTFOLIO_OPT_IN_TOPIC } from "../config/portfolio";
import { TIERS } from "../config/tiers";
import { mapRepo } from "./repo.mapper";

const [web, data] = CATEGORIES;
const [, project, lab] = TIERS;

const githubRepo = {
  name: "portfolio",
  description: "A window to my projects",
  language: "TypeScript",
  html_url: "https://github.com/pablocru/portfolio",
  archived: false,
  private: false,
  pushed_at: "2026-10-20T09:00:00Z",
  topics: [PORTFOLIO_OPT_IN_TOPIC, categoryTopic(web.id)],
};

describe("mapRepo", () => {
  test("maps the repository fields", () => {
    expect(mapRepo(githubRepo, web.id, project.id)).toEqual({
      name: "portfolio",
      description: "A window to my projects",
      language: "TypeScript",
      url: "https://github.com/pablocru/portfolio",
      archived: false,
      pushedAt: "2026-10-20T09:00:00Z",
      category: web.id,
      tier: project.id,
    });
  });

  test("keeps the trimmed description", () => {
    expect(
      mapRepo(
        { ...githubRepo, description: "  A window  " },
        web.id,
        project.id,
      ).description,
    ).toBe("A window");
  });

  test.each([null, "", "   "])(
    "drops the description when it is %j",
    (description) => {
      expect(
        mapRepo({ ...githubRepo, description }, web.id, project.id).description,
      ).toBeNull();
    },
  );

  test("maps a repository without a language", () => {
    expect(
      mapRepo({ ...githubRepo, language: null }, web.id, project.id).language,
    ).toBeNull();
  });

  test("maps an archived repository", () => {
    expect(
      mapRepo({ ...githubRepo, archived: true }, web.id, project.id).archived,
    ).toBe(true);
  });

  test("maps a repository without a push date", () => {
    expect(
      mapRepo({ ...githubRepo, pushed_at: null }, web.id, project.id).pushedAt,
    ).toBeNull();
  });

  test("keeps the category and tier it receives", () => {
    expect(mapRepo(githubRepo, data.id, lab.id)).toMatchObject({
      category: data.id,
      tier: lab.id,
    });
  });
});
