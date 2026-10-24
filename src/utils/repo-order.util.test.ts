import { describe, expect, test } from "vitest";
import { RepoCategory, RepoTier } from "../constants";
import type { PortfolioRepo } from "../types/repo.type";
import { comparePortfolioRepos } from "./repo-order.util";

function portfolioRepo(
  name: string,
  overrides: Partial<PortfolioRepo> = {},
): PortfolioRepo {
  return {
    name,
    description: null,
    language: null,
    url: `https://github.com/pablocru/${name}`,
    archived: false,
    pushedAt: "2026-01-01T00:00:00Z",
    category: RepoCategory.Web,
    tier: RepoTier.Project,
    ...overrides,
  };
}

function sortNames(portfolioRepos: PortfolioRepo[]): string[] {
  return [...portfolioRepos]
    .sort(comparePortfolioRepos)
    .map((value) => value.name);
}

describe("comparePortfolioRepos", () => {
  test("puts active repositories before archived ones", () => {
    expect(
      sortNames([
        portfolioRepo("archived", {
          archived: true,
          pushedAt: "2026-12-01T00:00:00Z",
        }),
        portfolioRepo("active", { pushedAt: "2025-01-01T00:00:00Z" }),
      ]),
    ).toEqual(["active", "archived"]);
  });

  test("orders by pushed_at descending and name ascending", () => {
    expect(
      sortNames([
        portfolioRepo("older", { pushedAt: "2025-01-01T00:00:00Z" }),
        portfolioRepo("newer", { pushedAt: "2026-01-01T00:00:00Z" }),
        portfolioRepo("bravo", { pushedAt: "2024-01-01T00:00:00Z" }),
        portfolioRepo("alpha", { pushedAt: "2024-01-01T00:00:00Z" }),
      ]),
    ).toEqual(["newer", "older", "alpha", "bravo"]);
  });

  test("puts entries without pushed_at last and breaks their ties by name", () => {
    expect(
      sortNames([
        portfolioRepo("undated-bravo", { pushedAt: null }),
        portfolioRepo("dated", { pushedAt: "2025-01-01T00:00:00Z" }),
        portfolioRepo("undated-alpha", { pushedAt: null }),
      ]),
    ).toEqual(["dated", "undated-alpha", "undated-bravo"]);
  });

  test("applies the same internal order to archived repositories", () => {
    expect(
      sortNames([
        portfolioRepo("archived-older", {
          archived: true,
          pushedAt: "2025-01-01T00:00:00Z",
        }),
        portfolioRepo("active", { pushedAt: "2024-01-01T00:00:00Z" }),
        portfolioRepo("archived-newer", {
          archived: true,
          pushedAt: "2026-01-01T00:00:00Z",
        }),
        portfolioRepo("archived-undated", {
          archived: true,
          pushedAt: null,
        }),
      ]),
    ).toEqual([
      "active",
      "archived-newer",
      "archived-older",
      "archived-undated",
    ]);
  });
});
