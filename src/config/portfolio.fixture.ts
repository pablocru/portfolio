/** Neutral owner login for fixtures that do not assert the configured owner. */
export const neutralGitHubLogin = "test-owner";

/** Builds a neutral GitHub URL for a repository fixture. */
export function neutralGitHubUrl(repoName: string): string {
  return `https://github.com/${neutralGitHubLogin}/${repoName}`;
}
