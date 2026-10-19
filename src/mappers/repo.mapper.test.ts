import { describe, expect, test } from "vitest";
import { PORTFOLIO_TOPIC } from "../constants";
import { isPortfolioRepo, mapRepo } from "./repo.mapper";

const githubRepo = {
  name: "portfolio",
  description: "A window to my projects",
  language: "TypeScript",
  html_url: "https://github.com/pablocru/portfolio",
  archived: false,
  private: false,
  topics: [PORTFOLIO_TOPIC],
};

describe("isPortfolioRepo", () => {
  test("accepts a public repository tagged for the portfolio", () => {
    expect(isPortfolioRepo(githubRepo)).toBe(true);
  });

  test("rejects a repository without the portfolio topic", () => {
    expect(isPortfolioRepo({ ...githubRepo, topics: ["astro"] })).toBe(false);
  });

  test("rejects a repository without topics", () => {
    expect(isPortfolioRepo({ ...githubRepo, topics: undefined })).toBe(false);
  });

  test("rejects a private repository", () => {
    expect(isPortfolioRepo({ ...githubRepo, private: true })).toBe(false);
  });
});

describe("mapRepo", () => {
  test("maps the repository fields", () => {
    expect(mapRepo(githubRepo)).toEqual({
      name: "portfolio",
      description: "A window to my projects",
      language: "TypeScript",
      url: "https://github.com/pablocru/portfolio",
      archived: false,
    });
  });

  test("keeps the trimmed description", () => {
    expect(
      mapRepo({ ...githubRepo, description: "  A window  " }).description,
    ).toBe("A window");
  });

  test.each([null, "", "   "])(
    "drops the description when it is %j",
    (description) => {
      expect(mapRepo({ ...githubRepo, description }).description).toBeNull();
    },
  );

  test("maps a repository without a language", () => {
    expect(mapRepo({ ...githubRepo, language: null }).language).toBeNull();
  });

  test("maps an archived repository", () => {
    expect(mapRepo({ ...githubRepo, archived: true }).archived).toBe(true);
  });
});
