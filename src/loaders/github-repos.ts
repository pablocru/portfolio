import type { Loader } from "astro/loaders";
import { getPortfolioRepos } from "../services/github.service";

function isCiFlagSet(): boolean {
  const environment = (
    globalThis as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process;

  return environment?.env?.CI !== undefined;
}

export function githubReposLoader(): Loader {
  return {
    name: "github-repos",
    load: async ({ store, parseData, generateDigest }) => {
      store.clear();

      const repositories = await getPortfolioRepos();

      for (const repository of repositories) {
        const data = await parseData({
          id: repository.name,
          data: repository,
        });

        const digest = generateDigest(data);

        store.set({
          id: repository.name,
          data,
          digest,
        });
      }

      if (repositories.length === 0 && isCiFlagSet()) {
        throw new Error(
          "GitHub repos collection is empty: no public pablocru repos include the pf-show topic.",
        );
      }
    },
  };
}
