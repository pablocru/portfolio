/**
 * Neutral owner login for fixtures that do not assert the configured owner.
 * It must not match `GITHUB_USERNAME`, so a test accidentally coupled to the
 * real owner fails instead of passing by coincidence.
 */
export const neutralGitHubLogin = "test-owner";

/** Builds a neutral GitHub URL for a repository fixture. */
export function neutralGitHubUrl(repoName: string): string {
  return `https://github.com/${neutralGitHubLogin}/${repoName}`;
}
