import { describe, expect, test } from "vitest";
import { CATEGORIES, categoryTopic } from "../config/categories";
import {
  PORTFOLIO_OPT_IN_TOPIC,
  PORTFOLIO_TOPIC_PREFIX,
} from "../config/portfolio";
import { TIERS, tierTopic } from "../config/tiers";
import { classifyRepo } from "./repo-classification.service";

const [web, data] = CATEGORIES;
const [featured, project, lab] = TIERS;
const webTopic = categoryTopic(web.id);
const dataTopic = categoryTopic(data.id);
const featuredTopic = tierTopic(featured.id);
const projectTopic = tierTopic(project.id);
const labTopic = tierTopic(lab.id);
const UNKNOWN_CATEGORY_TOPIC = `${PORTFOLIO_TOPIC_PREFIX}cat-desgin`;

const githubRepo = {
  name: "portfolio",
  description: "A window to my projects",
  language: "TypeScript",
  html_url: "https://github.com/pablocru/portfolio",
  archived: false,
  private: false,
  pushed_at: "2026-10-20T09:00:00Z",
  topics: [PORTFOLIO_OPT_IN_TOPIC, webTopic],
};

describe("classifyRepo", () => {
  test("publishes a repository with its classification", () => {
    expect(classifyRepo(githubRepo)).toEqual({
      kind: "published",
      category: web.id,
      tier: project.id,
    });
  });

  test("reads a featured tier", () => {
    expect(
      classifyRepo({
        ...githubRepo,
        topics: [...githubRepo.topics, featuredTopic],
      }),
    ).toMatchObject({ tier: featured.id });
  });

  test("treats an explicit project tier as the default", () => {
    const implicit = classifyRepo(githubRepo);
    const explicit = classifyRepo({
      ...githubRepo,
      topics: [...githubRepo.topics, projectTopic],
    });

    expect(explicit).toEqual(implicit);
  });

  test.each([
    [[featuredTopic, labTopic], `"${featuredTopic}", "${labTopic}"`],
    [[projectTopic, labTopic], `"${projectTopic}", "${labTopic}"`],
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
        topics: [...githubRepo.topics, dataTopic],
      }),
    ).toThrow(
      `Repository "portfolio" carries more than one category topic: "${webTopic}", "${dataTopic}"`,
    );
  });

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
    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [
          PORTFOLIO_OPT_IN_TOPIC,
          webTopic,
          dataTopic,
          featuredTopic,
          labTopic,
          UNKNOWN_CATEGORY_TOPIC,
        ],
      }),
    ).toThrow(
      /Repository "portfolio" has 3 classification faults:[\s\S]*unknown control topics[\s\S]*more than one category topic[\s\S]*more than one tier topic/,
    );
  });

  test("aggregates a missing category with duplicated tiers", () => {
    expect(() =>
      classifyRepo({
        ...githubRepo,
        topics: [PORTFOLIO_OPT_IN_TOPIC, featuredTopic, labTopic],
      }),
    ).toThrow(
      /Repository "portfolio" has 2 classification faults:[\s\S]*no category topic[\s\S]*more than one tier topic/,
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
      expect.stringContaining('carries "pf-show" but is private'),
    );
  });

  test("warns about a classified repository without the opt-in topic", () => {
    const result = classifyRepo({
      ...githubRepo,
      topics: [dataTopic, labTopic],
    });

    expect(result).toMatchObject({ kind: "warned" });
    expect(result).toHaveProperty(
      "warning",
      expect.stringContaining(
        `"${dataTopic}", "${labTopic}" but not "pf-show"`,
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
