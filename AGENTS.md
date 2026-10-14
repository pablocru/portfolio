# AGENTS.md

Permanent instructions for coding agents working in this repository. Keep this
file accurate: if you change tooling, scripts or conventions, update it in the
same commit.

## Project

This project is a static Astro site: the home page of everything published on
GitHub Pages by `pablocru`. Code, content and commits are in **English**.
Portfolio-specific functionality is tracked outside this file; see the active
plan for its current scope.

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
- KISS: no abstractions, options, or features that were not asked for. No CSS
  frameworks unless asked. Never invent content (names, dates, links, images);
  ask the developer instead.
- When creating domain code, use the project layers (`src/types`, `src/mappers`,
  `src/services`, `src/utils`, `src/loaders`) with suffixes `.type.ts`,
  `.mapper.ts`, `.service.ts`, `.util.ts`.
- Closed vocabularies are plain TypeScript `enum`s, never `const enum`, defined
  in a shared constants module (e.g. `src/constants.ts`).
- Avoid duplicating facts that already have a source of truth; reference instead
  of repeating versions, scripts, or formatting rules already defined in
  `package.json`, tool configs, or workflows.

## Git

- **Branch `main` is readonly. Commits are forbidden there. Warn the
  developer.**
- **Force push is forbidden to any branch, including feature branches, and
  history already pushed to origin must not be rewritten.**
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
- **Never push, open PRs, or merge unless explicitly asked.**

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
