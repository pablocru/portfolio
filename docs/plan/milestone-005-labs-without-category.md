# Milestone 005: Labs without category

- Supersedes in part milestone 004: C-004.3 and C-004.12 no longer require a
  category for tier `Lab`

## Context

Milestone 004 requires a category for every published repository. Some
repositories belong to the `Lab` tier but fit no category, so the portfolio
cannot publish them today. This milestone makes the category optional for the
tiers that do not require one, starting with `Lab`. A repository that carries a
category keeps following the same rules as in the other tiers.

## User stories

| ID       | Role  | Action                                              | Benefit                                                                  | Acceptance criteria                                                                                             |
| -------- | ----- | --------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| US-005.1 | Owner | To publish a repository as `Lab` without a category | To show learning repositories that fit no category without inventing one | A repository tagged only `pf-show` and `pf-tier-lab` builds and renders in `Lab`                                |
| US-005.2 | Owner | To keep the category of a lab that has one          | To place a data experiment in `Data` in future views                     | A repository tagged `pf-show`, `pf-tier-lab` and `pf-cat-data` builds, renders only in `Lab`, and stores `data` |

## Constraints

| ID      | Requirement                   | Acceptance criteria                                                                                                                                                                                |
| ------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-005.1 | Category required by the tier | A published `Featured` or `Project` repository with no `pf-cat-*` topic fails the build with an error naming the repository                                                                        |
| C-005.2 | At most one category          | Two `pf-cat-*` topics on any published repository, labs included, fail the build with an error naming the repository and both topics                                                               |
| C-005.3 | Persistence                   | The stored entry carries the category id of the repository, or no category when the tier does not require one; the schema rejects an unknown category and a missing one on a tier that requires it |
| C-005.4 | Same output                   | With the repository topics unchanged, the generated HTML is identical to the one before the change; a lab without a category renders in the same section as a lab with one                         |
| C-005.5 | New tiers                     | Adding a tier that does not need a category requires no change to the classification rules                                                                                                         |
| C-005.6 | Documentation                 | The README describes the exemption, and milestone 004 points to this milestone from its header                                                                                                     |

## Verification

`pnpm quality:check` passes. The unit tests cover the classifier and the
collection schema:

- US-005.1 and US-005.2: `classifyRepo` returns tier `lab` with no category and
  with `data`, and `groupRepos` places both in the `Lab` section.
- C-005.1: `classifyRepo` rejects a `Featured` or `Project` repository with no
  category, naming it.
- C-005.2: `classifyRepo` rejects two category topics on a project, on a
  featured repository and on a lab, naming both topics.
- C-005.3: the collection schema accepts a lab with and without a category and
  rejects a project or featured entry without one and an unknown category.
- C-005.4: build before and after the change with the same topics and compare
  the `dist/` checksum manifests; they must match.
- C-005.5: inspect `src/config/tiers.ts` and the classifier; no code names `lab`
  and the decision reads the tier entry.
- C-005.6: inspect `README.md` and the milestone 004 header.

Build check for US-005.1 and US-005.2, applied and removed by the owner: tag one
public repository with only `pf-show` and `pf-tier-lab`, run `pnpm build` and
confirm it renders in `Lab`; add `pf-cat-data` and confirm it still renders only
in `Lab` and its stored entry carries `data`. Without `pf-tier-lab` the
repository defaults to `Project` and the build fails naming it, because it has
no category.

Report the result per ID as PASS, FAIL or NOT VERIFIED with evidence, as
described in `AGENTS.md`.
