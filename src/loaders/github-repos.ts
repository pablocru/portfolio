import { GITHUB_TOKEN } from "astro:env/server";
import { Octokit } from "@octokit/rest";
import type { Loader } from "astro/loaders";
import { GITHUB_USERNAME, PORTFOLIO_TOPIC } from "../constants";
import { getRepos } from "../services/github.service";

/**
 * Publishes the repositories the owner tagged for the portfolio. The loader
 * only moves what the service returns into the content store.
 */
export function githubReposLoader(): Loader {
  return {
    name: "github-repos",
    load: async ({ store, logger, parseData, generateDigest }) => {
      store.clear();

      const repos = await getRepos(new Octokit({ auth: GITHUB_TOKEN }));

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
          `No repository to publish: no public repository of ${GITHUB_USERNAME} carries the ${PORTFOLIO_TOPIC} topic.`,
        );
      }
    },
  };
}
