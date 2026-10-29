# Milestone 003: Repositories

## Context

The site shows the owner's profile and nothing else. This milestone adds the
repositories the owner publishes, so the page becomes a window to their work.
Repositories are resolved at build time and reach the page through a content
collection: the home page reads a `repos` collection fed by a custom loader on
top of the GitHub API. The owner decides which repositories are published by
tagging them with the `pf-show` topic, so later milestones can classify and
group the same repositories by extending the mapping and the collection schema,
without changing the selection rule or the loader.

## User stories

| ID       | Role      | Action                                      | Benefit                                    | Acceptance criteria                                                                                                                                                                                                                                             |
| -------- | --------- | ------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-003.1 | Visitor   | See the repositories the owner publishes    | Discover the owner's work                  | The page renders one entry per public repository of `pablocru` whose topics include `pf-show`, and no entry for any other repository                                                                                                                            |
| US-003.2 | Visitor   | Recognize each repository                   | Decide which one to open                   | Every entry renders the repository name, its description when the API reports one, its primary language when the API reports one, and a link to the repository page on GitHub                                                                                   |
| US-003.3 | Visitor   | Spot repositories that are no longer active | Judge whether to rely on them              | An entry whose repository is archived on GitHub is marked as archived; an entry whose repository is not archived carries no such mark                                                                                                                           |
| US-003.4 | Visitor   | Understand an empty portfolio               | Not read the page as broken                | When no repository qualifies, the page renders a message stating that no repository is published yet, instead of an empty list                                                                                                                                  |
| US-003.5 | Developer | Build the site without credentials          | Work from a clean checkout                 | `pnpm build` completes without `GITHUB_TOKEN` while the public GitHub API is reachable                                                                                                                                                                          |
| US-003.6 | Developer | Trust the repository pipeline               | Change the selection or the mapping safely | The selection rules (public repository, `pf-show` topic), the field mapping, the failed listing message and the loader (one entry per repository, nothing left from a previous listing, warning when none qualifies) are covered by unit tests that run offline |

## Constraints

| ID       | Requirement              | Acceptance criteria                                                                                                                                                                                                          |
| -------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-003.1  | Only public repositories | No repository the API reports as private appears in the generated HTML, and the domain type carries no visibility field                                                                                                      |
| C-003.2  | Selection by topic       | Only repositories whose topics include `pf-show` are published; a public repository without that topic is absent from the generated HTML                                                                                     |
| C-003.3  | Content collection       | The repositories reach the page through a `repos` content collection declared in `src/content.config.ts` and loaded by the project's own loader under `src/loaders/`, with a schema that validates every entry at build time |
| C-003.4  | Resolved at build time   | The generated page requests no repository data at runtime and adds no script of its own                                                                                                                                      |
| C-003.5  | Failed listing           | When the repository listing fails, the build fails with an error message naming the failed lookup and the username                                                                                                           |
| C-003.6  | Empty collection         | When no repository qualifies, the build reports a warning naming the `pf-show` condition and still builds the page with the message of US-003.4                                                                              |
| C-003.7  | Optional token           | `GITHUB_TOKEN` is optional: without it the build succeeds and queries the GitHub API anonymously; with it the build queries the API with that token                                                                          |
| C-003.8  | Authenticated CI build   | The build in the CI pipeline receives the workflow token through the environment, and the pipeline declares the `contents: read` permission                                                                                  |
| C-003.9  | No classification yet    | The tier and category topics (`pf-featured`, `pf-lab`, `pf-cat-*`) are neither read nor rendered: the page renders a single ungrouped list                                                                                   |
| C-003.10 | No styling               | The repository list and its entries use plain HTML elements: this milestone adds no `class` attribute, stylesheet or `<style>` element                                                                                       |
| C-003.11 | Data reported by GitHub  | Every rendered field of an entry is the value the API reports for that repository; besides fixed labels such as `Archived`, the milestone introduces no hand-written repository content                                      |

The project-wide conventions this milestone relies on are defined in
`AGENTS.md`.

## Verification

Run `pnpm quality:check` and `pnpm build`, then inspect `dist/index.html`. The
page lists exactly the repositories this query returns:

```bash
gh api "users/pablocru/repos?per_page=100&type=owner" \
  --jq '[.[] | select(.private == false) | select(.topics | index("pf-show")) | .name]'
```

For each rendered entry, compare name, description and language with the API
data and follow the link:

```bash
gh api repos/pablocru/<name> \
  --jq '{description, language, archived, html_url}'
```

The acceptance criteria above define what to check. Report the result per
requirement ID as described in `AGENTS.md`.

- US-003.1 to US-003.3 and C-003.1 to C-003.3 need at least one public
  repository tagged with `pf-show`; without one, the positive case is reported
  as `NOT VERIFIED`.
- US-003.6: `pnpm test` covers the selection, the field mapping, the failed
  listing and the loader. The loader test seeds an entry left by a previous
  listing, loads the current repositories against a fake store and asserts that
  only those remain; it also asserts the warning when none qualifies, and the
  fake context keeps the test offline.
- C-003.4: confirm `dist/index.html` contains no `<script>` element added by
  this milestone and no repository data requested at runtime.
- C-003.6: build while no public repository carries `pf-show` and confirm both
  the warning and the message on the page.
- C-003.7: run `pnpm build` with and without `GITHUB_TOKEN` set.
- C-003.8: run the CI pipeline of the branch and confirm its build step.
