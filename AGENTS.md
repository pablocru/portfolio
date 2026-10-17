# AGENTS.md

Permanent instructions for coding agents working in this repository. Keep this
file accurate: if you change tooling, scripts or conventions, update it in the
same commit.

## Project

This project is a static Astro site: the home page of everything published on
GitHub Pages by `pablocru`. Code, content and commits are in **English**.

## Milestone specs

- Specs live in `docs/plan/` and are versioned with the repository. Do not add
  version suffixes to file names: Git history is the versioning. Do not keep
  implementation plans in the repository; a spec defines _what_ to build, and
  the implementer chooses _how_ following this file.
- A spec contains context, user stories (`US-XXX.Y`), constraints with
  acceptance criteria (`C-XXX.Y`), and verification.
- Acceptance criteria state the observable outcome only; the procedure used to
  check it belongs to verification.
- Report the result per requirement ID as `PASS`, `FAIL`, or `NOT VERIFIED` with
  evidence, together with the completion report described in "Working method".
  Never report `PASS` for a criterion that was not checked, and never fake
  inputs or mutate real data to make a check pass.
- Do not weaken or omit a requirement to simplify the implementation.

## Commands

- **Do not use npm, yarn, or any package manager other than pnpm.**
- Ensure tooling with `mise install`; install dependencies with
  `pnpm safe-install` (frozen lockfile).
- Run, build, and preview the project: `pnpm dev`, `pnpm build`, `pnpm preview`.
- Quality: `pnpm quality:check` and `pnpm quality:fix`. These run Biome,
  Prettier (yml/yaml), rumdl, and `pnpm type:check` (`astro check`).
- Type generation: after changes that affect generated/content types, run
  `pnpm type:sync` (`astro sync`).
- `package.json` is the source of truth for available scripts.

## Code conventions

- TypeScript strict (`astro/tsconfigs/strict`).
- Formatting and line endings are defined by `.editorconfig` and
  `.gitattributes`; consult them when needed.
- Biome formats code (ts, astro, json, css); Prettier formats yml/yaml; rumdl
  formats and lints md.
- The developer works on Linux and Windows: scripts must not rely on bash-only
  syntax.
- KISS: no abstractions, options, or features that were not asked for. No CSS
  resets, frameworks, or custom styles: use browser default styles unless a
  milestone asks for styling. Never invent content (names, dates, links,
  images); ask the developer instead.
- When creating domain code, use the project layers (`src/types`, `src/mappers`,
  `src/services`, `src/utils`, `src/loaders`) with suffixes `.type.ts`,
  `.mapper.ts`, `.service.ts`, `.util.ts`.
- Closed vocabularies are plain TypeScript `enum`s, never `const enum`, defined
  in a shared constants module (e.g. `src/constants.ts`).
- Avoid duplicating facts that already have a source of truth; reference instead
  of repeating versions, scripts, or formatting rules already defined in
  `package.json`, tool configs, or workflows.
- **When adding or changing a rule, audit the repository for related stale or
  duplicated references and update them in the same change.**

### Astro

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
- `site` and `base` live in `astro.config.mjs`; derive links from
  `import.meta.env.BASE_URL` or `Astro.site`; never hardcode paths.
- Data goes through content collections (loaders and schemas); images go through
  Astro's asset pipeline.

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
  when the _why_ is not obvious.
  - Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `ci`, `build`, `style`.
  - Scopes: `config`, `types`, `utils`, `mappers`, `services`, `loader`,
    `content`, `ui`, `pages`, `ci`, `deps`, `docs`. It is optional but
    recommended.
- Atomic commits: one logical change each, and every commit leaves the repo
  green (`pnpm quality:check`, plus build/preview as applicable).
- The Lefthook pre-commit hook formats staged files. Never use `--no-verify`.
- If a check fails, fix it in a new commit or amend only the commit you just
  made.
- `main` uses squash merges, so the PR title is the final message.
- Open PRs following `.github/pull_request_template.md`; consult it for required
  sections and wording.
- PR titles and bodies are rendered by GitHub: write them as normal prose and
  never manually wrap or column-align them. `rumdl`'s `MD013` line-width limit
  (configured in `rumdl.toml`) applies only to Markdown files committed in the
  repository.
- **Never push, open PRs, or merge unless explicitly asked.**

## GitHub

- Prefer `gh` to inspect the remote (repos, PRs, runs, topics). If it is not
  installed or authenticated, warn the developer that it improves agentic work;
  do not work around it with raw API calls or tokens.
- Read-only commands (`view`, `list`, `status`, `api` with GET) are allowed.
- Commands that change remote state (create, edit, merge, close, comment,
  `workflow run`, `api` with POST/PUT/PATCH) require approval: show the exact
  command, use a native `--dry-run` if it exists, and wait for explicit
  confirmation.
- **Never delete anything on GitHub (repos, branches, tags, releases, secrets,
  tokens) and never run `gh auth` or any token command. If a deletion seems
  necessary, tell the developer and stop.**

## Dependencies and security

- Dependencies and supply chain:
  - `pnpm add --save-exact`; commit `package.json` with `pnpm-lock.yaml` in a
    `chore(deps)` commit.
  - Respect `minimumReleaseAge` and do not change allowances, `engineStrict`,
    `minimumReleaseAgeExclude`, or `overrides` in `pnpm-workspace.yaml` without
    asking. If a version is blocked, choose an older one.
  - Review supply-chain exceptions when adding or upgrading dependencies; remove
    entries no longer needed after validation. Node and pnpm versions are
    declared in `package.json`.
- Never print, log, or commit secrets. Use `.env` files and commit
  `.env.example` files with placeholders.
- In GitHub Actions, use minimal `permissions` and pin actions as the existing
  workflows do.

## Working method

- Verify APIs against the official docs **for the installed versions** before
  using them. Do not rely on memory.
- If the task conflicts with the repo, the tooling, or this file, or is
  ambiguous, stop and ask instead of improvising.
- When you finish, report what you changed, which checks you ran, and what you
  could not verify.
