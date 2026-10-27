# AGENTS.md

Permanent instructions for coding agents working in this repository. Keep this
file accurate: if you change tooling, scripts or conventions, update it in the
same commit. State the outcome a rule protects, not the implementation that
achieves it.

## Project

This project is a static Astro site: the home page of everything published on
GitHub Pages by `pablocru`. Code, content and commits are in **English**.

## Where each rule lives

- `AGENTS.md`: invariants (what must always be true), policy (what is forbidden)
  and boundaries (where code lives and what may import what). A rule belongs
  here when it protects an invariant, a policy, or a boundary. A boundary may be
  falsified by a behavior-preserving move; stating it is the point. A rule that
  only dictates a technique belongs in the change that needs it.
- `docs/plan/`: what a milestone delivers and how it is checked. It defines the
  outcome, not the technique.
- Code and tests: how the outcome is built and the proof that it holds. A rule
  that dictates a technique belongs to the change that needs it.

## Milestone specs

- A milestone is required for new behavior, content, or data scope. Dependency
  and security updates, documentation, and fixes that restore intended behavior
  do not need a milestone.
- Specs live in `docs/plan/` and are versioned with the repository. Do not add
  version suffixes to file names: Git history is the versioning. Do not keep
  implementation plans in the repository.
- A spec contains context, user stories (`US-XXX.Y`), constraints with
  acceptance criteria (`C-XXX.Y`), and verification.
- Acceptance criteria state the observable outcome only; the procedure used to
  check it belongs to verification.
- Report the result per requirement ID as `PASS`, `FAIL`, or `NOT VERIFIED` with
  evidence, in the acceptance criteria table of the pull request template, and
  together with the completion report described in "Working method". Never
  report `PASS` for a criterion that was not checked, and never fake inputs or
  mutate real data to make a check pass.
- Do not weaken or omit a requirement to simplify the implementation.

## Commands

- **Do not use npm, yarn, or any package manager other than pnpm.**
- Ensure tooling with `mise install`; install dependencies with
  `pnpm safe-install` (frozen lockfile).
- Run, build, preview, test and check the project with the scripts declared in
  `package.json`; that file is the source of truth for available scripts.
- After changes that affect generated or content types, run `pnpm type:sync`.

## Code conventions

- Formatting and line endings are defined by `.editorconfig` and
  `.gitattributes`; consult them when needed.
- Each file type has one configured formatter; do not reformat files by hand or
  add another tool.
- The developer works on Linux and Windows: scripts must not rely on bash-only
  syntax.
- KISS: make the smallest change that meets the acceptance criteria. Do not add
  options, flags or extension points that nothing requires, and no CSS resets,
  frameworks or authored styles: use browser default styles unless a milestone
  asks for styling. Styles a framework generates for a feature are part of that
  feature. Never invent content (names, dates, links, images); ask the developer
  instead.
- Keep raw GitHub payloads and portfolio domain objects distinguishable by name
  so each file can be read in isolation; fields may rely on their owner for
  context.
- When creating domain code, use the project layers (`src/types`, `src/mappers`,
  `src/services`, `src/utils`, `src/loaders`, `src/clients`) with suffixes
  `.type.ts`, `.mapper.ts`, `.service.ts`, `.util.ts`, `.client.ts`.
- Presentation logic that belongs to one component lives beside it under
  `src/components/<feature>/` and is tested in place; only the Astro layer may
  import it. Repository ordering is a core rule in `src/utils`; grouping, labels
  and section composition are presentation and live beside the repositories
  component.
- Each layer logs only the diagnostics it owns: a component logs its
  presentation warnings, and the content loader logs only the warnings of data
  selection.
- Build diagnostics delimit interpolated system values (repository names,
  usernames, topics, API error messages) so their boundaries stay unambiguous;
  user-facing copy follows its own presentation rules.
- Mappers transform and normalize one representation into another; they do not
  decide publication, classification, ordering or presentation. Validation and
  domain policy live in services.
- Build third-party clients in `src/clients` (composition: auth, plugins) and
  pass them to services and loaders, which take their collaborators as
  parameters and read no environment. Only the Astro layer (`src/pages`,
  `src/content.config.ts`, layouts) imports the wrapper, because it may read the
  environment.
- Closed domain vocabularies have one shared source of truth; component-local
  presentation identifiers may stay local.
- Avoid duplicating facts that already have a source of truth; reference instead
  of repeating versions, scripts, or formatting rules already defined in
  `package.json`, tool configs, or workflows.
- **When adding or changing a rule, audit the repository for related stale or
  duplicated references and update them in the same change.**

### Astro

- TypeScript runs in strict mode through `astro/tsconfigs/strict`.
- Prefer native Astro mechanisms over custom solutions.
- The site is static: resolve data at build time. Do not add client-side
  JavaScript or runtime network requests unless a milestone requires it.
- Keep the generator meta tag (`Astro.generator`) in every layout.
- Environment variables: declare them in `env.schema` and import them from
  `astro:env/*`; never read project variables from `process.env` or
  `import.meta.env`.
- `astro:env` and `import.meta.env` do not work inside `astro.config.mjs` (Astro
  evaluates it before loading other files); declare the schema there and, if a
  value is needed in the config, read it with Vite's `loadEnv`.
- `site` and `base` live in `astro.config.mjs` when the project needs them;
  derive links from `import.meta.env.BASE_URL` or `Astro.site`; never hardcode
  paths.
- Repeated data goes through content collections (loaders and schemas); single
  records are resolved directly from the service layer.
- Mutually exclusive UI states are one decision: render one branch or the other,
  never two independent conditions that can both hold. The invalid combination
  must be impossible, not merely unlikely.

### Images

- Content images go through Astro's asset pipeline.
- The first image on a page loads eagerly, so the largest contentful paint is
  not delayed.
- A displayed image is served at the density of the display it appears on, so it
  stays sharp on high-density screens.

### Accessibility

- Every page is usable with assistive technology: declare the page language,
  keep one `<main>` landmark, and order headings without skipping levels.
- Let native HTML carry the semantics: a list for an enumeration, a section
  named by its heading for a group, an article for a self-contained entry. Add
  ARIA only where no native element expresses the meaning.
- Styling never removes semantics: a list whose markers are hidden stays a list.
- Every image has a non-empty `alt`, and every link a name that makes sense out
  of context.

### GitHub data

- Read GitHub data with `@octokit/rest`; do not reach the API with native
  `fetch`.
- Derive payload types from the endpoint types the client exposes; hand-write
  only the domain types the project maps to.
- API failures name the failing lookup and the status the API returned.
- Declare in `package.json` every package imported directly, even when it
  arrives as a transitive dependency.

## Testing

- Tests are colocated with the code they cover, suffixed `.test.ts`, under
  `src/`.
- The suite is deterministic and offline: no test performs a network request or
  reads credentials.
- Run the suite with `pnpm test`.

### Unit testing

- When a unit declares a collaborator, inject it instead of mocking the module
  (for example, the Octokit client in the profile service, or the repository
  source in the content loader). A unit does not build its own collaborator,
  which is why a unit that imports `astro:env` cannot be tested.
- Name fixtures for the data they hold and reuse the same fixture for the same
  object across tests.

## Git

- **Branch `main` is readonly. Commits are forbidden there. Warn the
  developer.**
- **Force push is forbidden to any branch, including feature branches, and
  history already pushed to origin must not be rewritten.**
- Do not run commands that discard local work (`git reset --hard`, `git clean`,
  `git restore` without `--staged`, `git checkout -- <path>`, `git branch -D`)
  without asking.
- New additions to the project require a new branch from an up-to-date `main`.
  Names: `feat/…`, `fix/…`, `ci/…`, `docs/…`, `chore/…`.
- **Conventional Commits in English**: `type(scope): imperative summary`,
  lowercase after the colon, no trailing period, 72 characters max. Body only
  when the _why_ is not obvious. The types and the scope follow
  [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- Atomic commits: one logical change each, and every commit leaves the repo
  green (`pnpm quality:check`, which queries the public GitHub API, plus
  `pnpm build` when the change touches the site or its data pipeline).
- The pre-commit hook formats staged files; never bypass it with `--no-verify`.
- If a check fails, fix it in a new commit or amend only the commit you just
  made.
- `main` uses squash merges: the final commit message is the PR title with the
  pull request reference appended (`(#<number>)`) and the PR's `## Why` section
  as the body. Never pass a subject when merging a pull request: it drops the
  reference.
- The PR title is the commit that lands on `main`: write it as a Conventional
  Commit and decide it before opening the PR.
- Open PRs following `.github/pull_request_template.md`; consult it for required
  sections and wording.
- Commit messages, pull request titles and pull request bodies are rendered by
  GitHub: write them as normal prose and never manually wrap or column-align
  them, in every commit and in every pull request. The Markdown line-width limit
  (configured in `rumdl.toml`) applies only to Markdown files committed in the
  repository.
- **Never push or open a PR unless explicitly asked.**

## GitHub

- Prefer `gh` to inspect the remote (repos, PRs, runs, topics). If it is not
  installed or authenticated, warn the developer that it improves agentic work;
  do not work around it with raw API calls or tokens.
- Read-only commands (`view`, `list`, `status`, `api` with GET) are allowed.
- Commands that create or edit a remote object, or leave a note on it (create,
  edit, comment, `workflow run`, `api` with POST/PUT/PATCH) require approval:
  show the exact command, use a native `--dry-run` if it exists, and wait for
  explicit confirmation.
- Commands that end a remote object (merge, close) belong to the developer:
  prepare the change and hand it over, whatever the command. The command line
  has been observed to land the squash commit on `main` while the pull request
  stayed open, unmerged and ungated, so the history and the pull request
  disagree about what landed.
- **Never delete anything on GitHub (repos, branches, tags, releases, secrets,
  tokens) and never run `gh auth` or any token command. If a deletion seems
  necessary, tell the developer and stop.**

## Dependencies and security

- Dependencies and supply chain:
  - Add dependencies with pnpm; exact versions are enforced by the workspace
    configuration. Commit `package.json` with `pnpm-lock.yaml` in a
    `chore(deps)` commit.
  - Respect the release-age policy and do not change `minimumReleaseAge`,
    `engineStrict`, the build allowlist, or any pinned `overrides` in
    `pnpm-workspace.yaml` without asking. If a version is blocked, choose an
    older one. A security fix that must land before the window passes needs an
    explicit `minimumReleaseAgeExclude` entry.
  - Review supply-chain exceptions when adding or upgrading dependencies; remove
    entries no longer needed after validation. Node and pnpm versions are
    declared in `package.json`.
- Vulnerabilities:
  - A runtime advisory follows the same shape as a package advisory: the
    identifier in the branch name, and the identifier, severity and why in the
    commit body and the pull request body.
  - When Dependabot opens a fix for an alert, review it and keep its
    `dependabot/…` branch and its `chore(deps)` message, and hand the merge to
    the developer.
  - When Dependabot cannot handle it, use a `fix/deps-<package>-ghsa-<id>`
    branch with a `fix(deps): update <package> to <patched version>` commit;
    update a pinned `overrides` entry in the same change when it is affected.
  - When one audit pass leaves several packages vulnerable, fix them in a single
    `fix/deps-audit` branch, one such commit per package.
  - Describe every advisory in the PR body (id, severity, why the version fixes
    it); squash keeps the body, not the branch commits. Confirm they no longer
    appear in `pnpm audit`, then run `pnpm quality:check` and `pnpm build`.
  - The pinned Node runtime is reviewed when Node.js publishes a security
    release; the identifier, the severity and the why travel with the change.
  - For supply-chain hardening that is not tied to an advisory, use the
    `chore(security)` scope.
- Never print, log, or commit secrets. Use `.env` files and commit
  `.env.example` files with placeholders.
- In GitHub Actions, use minimal `permissions` and the same action version tags
  as the existing workflows.

## Working method

- Verify APIs against the official docs **for the installed versions** before
  using them. Do not rely on memory.
- If the task conflicts with the repo, the tooling, or this file, or is
  ambiguous, stop and ask instead of improvising.
- When you finish, report what you changed, which checks you ran, and what you
  could not verify.
