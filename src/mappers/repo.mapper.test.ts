import { describe, expect, test } from "vitest";
import { PORTFOLIO_OPT_IN_TOPIC, RepoCategory, RepoTier } from "../constants";
import { classifyRepo, isPublishedRepo } from "./repo.mapper";

const githubRepo = {
  name: "portfolio",
  description: "A window to my projects",
  language: "TypeScript",
  html_url: "https://github.com/pablocru/portfolio",
  archived: false,
  private: false,
  pushed_at: "2026-10-20T09:00:00Z",
  topics: [PORTFOLIO_OPT_IN_TOPIC, "pf-cat-web"],
};

describe("isPublishedRepo", () => {
  test("accepts a public repository tagged with the opt-in topic", () => {
    expect(isPublishedRepo(githubRepo)).toBe(true);
  });

  test("rejects a repository without the opt-in topic", () => {
    expect(isPublishedRepo({ ...githubRepo, topics: ["astro"] })).toBe(false);
  });

  test("rejects a repository without topics", () => {
    expect(isPublishedRepo({ ...githubRepo, topics: undefined })).toBe(false);
  });

  test("rejects a private repository even when tagged", () => {
    expect(isPublishedRepo({ ...githubRepo, private: true })).toBe(false);
  });
});

describe("classifyRepo", () => {
  test("maps a published repository with its classification", () => {
    expect(classifyRepo(githubRepo)).toEqual({
      kind: "published",
      repo: {
        name: "portfolio",
        description: "A window to my projects",
        language: "TypeScript",
        url: "https://github.com/pablocru/portfolio",
        archived: false,
        pushedAt: "2026-10-20T09:00:00Z",
        category: RepoCategory.Web,
        tier: RepoTier.Project,
      },
    });
  });

  test("keeps the trimmed description", () => {
    const result = classifyRepo({
      ...githubRepo,
      description: "  A window  ",
    });

    expect(result).toMatchObject({
      repo: { description: "A window" },
    });
  });

  test.each([null, "", "   "])(
    "drops the description when it is %j",
    (description) => {
      expect(classifyRepo({ ...githubRepo, description })).toMatchObject({
        repo: { description: null },
      });
    },
  );

  test("maps a repository without a language", () => {
    expect(classifyRepo({ ...githubRepo, language: null })).toMatchObject({
      repo: { language: null },
    });
  });

  test("maps an archived repository", () => {
    expect(classifyRepo({ ...githubRepo, archived: true })).toMatchObject({
      repo: { archived: true },
    });
  });

  test("maps a repository without a push date", () => {
    expect(classifyRepo({ ...githubRepo, pushed_at: null })).toMatchObject({
      repo: { pushedAt: null },
    });
  });

  test("reads a featured tier", () => {
    const result = classifyRepo({
      ...githubRepo,
      topics: [...githubRepo.topics, "pf-tier-featured"],
    });

    expect(result).toMatchObject({ repo: { tier: RepoTier.Featured } });
  });

  test("treats an explicit project tier as the default", () => {
    const implicit = classifyRepo(githubRepo);
    const explicit = classifyRepo({
      ...githubRepo,
      topics: [...githubRepo.topics, "pf-tier-project"],
    });

    expect(explicit).toEqual(implicit);
  });

  test.each([
    [["pf-tier-featured", "pf-tier-lab"], "pf-tier-featured, pf-tier-lab"],
    [["pf-tier-project", "pf-tier-lab"], "pf-tier-project, pf-tier-lab"],
  ])("rejects the tier topics %j", (tierTopics, expected) => {
    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [...githubRepo.topics, ...tierTopics],
      }),
    ).toThrow(
      `Repository "portfolio" carries more than one tier topic: ${expected}`,
    );
  });

  test("rejects a published repository without a category", () => {
    expect(() =>
      classifyRepo({ ...githubRepo, topics: [PORTFOLIO_OPT_IN_TOPIC] }),
    ).toThrow(
      'Repository "portfolio" is published but carries no category topic',
    );
  });

  test("rejects two category topics", () => {
    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [...githubRepo.topics, "pf-cat-data"],
      }),
    ).toThrow(
      'Repository "portfolio" carries more than one category topic: pf-cat-web, pf-cat-data',
    );
  });

  test("rejects an unknown control topic", () => {
    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [...githubRepo.topics, "pf-cat-desgin"],
      }),
    ).toThrow(
      'Repository "portfolio" carries unknown control topics: pf-cat-desgin',
    );
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
      expect.stringContaining("private"),
    );
  });

  test("warns about a classified repository without the opt-in topic", () => {
    const result = classifyRepo({
      ...githubRepo,
      topics: ["pf-cat-data", "pf-tier-lab"],
    });

    expect(result).toMatchObject({ kind: "warned" });
    expect(result).toHaveProperty(
      "warning",
      expect.stringContaining("pf-cat-data, pf-tier-lab but not pf-show"),
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
