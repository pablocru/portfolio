import type { Loader } from "astro/loaders";
import { GITHUB_USERNAME, PORTFOLIO_OPT_IN_TOPIC } from "../constants";
import type { RepoListing } from "../types/repo.type";

export function githubReposLoader(
  listRepos: () => Promise<RepoListing>,
): Loader {
  return {
    name: "github-repos",
    load: async ({ store, logger, parseData, generateDigest }) => {
      store.clear();

      const { repos, warnings } = await listRepos();

      for (const warning of warnings) {
        logger.warn(warning);
      }

      for (const repo of repos) {
        const data = await parseData({ id: repo.name, data: repo });

        store.set({
          id: repo.name,
          data,
          digest: generateDigest(data),
        });
      }

      if (repos.length === 0) {
        logger.warn(
          `No repository to publish: no public repository of ${GITHUB_USERNAME} carries the ${PORTFOLIO_OPT_IN_TOPIC} topic.`,
        );
      }
    },
  };
}
