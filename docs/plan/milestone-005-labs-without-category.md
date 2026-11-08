# Milestone 005: Labs without category

- Supersedes in part milestone 004 (C-004.3 and C-004.12)
- Superseded in part by milestone 006: US-005.1, US-005.2 and the default-tier
  fallback in verification

## Context

Milestone 004 requires a category for every published repository. Some
repositories belong to the `Lab` tier but fit no category, so the portfolio
cannot publish them today. This milestone lets each tier declare whether it
requires a category, so any tier can opt out without changing the classifier.
`Lab` is the first tier that opts out. A repository that carries a category
keeps following the same rules as in the other tiers.

## User stories

| ID       | Role  | Action                                                               | Benefit                                                  | Acceptance criteria                                                                                                                                                                                                |
| -------- | ----- | -------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| US-005.1 | Owner | To publish a repository in a tier that does not require a category   | To show work that fits no category without inventing one | A repository tagged only `pf-show` and the topic of a tier that does not require a category builds and renders in that tier                                                                                        |
| US-005.2 | Owner | To keep the category of a repository whose tier does not require one | To keep that classification for future views             | A repository tagged `pf-show`, the topic of a tier that does not require a category and a category topic builds, renders only in that tier, and stores the category                                                |

## Constraints

| ID      | Requirement                   | Acceptance criteria                                                                                                                                                                                                          |
| ------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-005.1 | Category required by the tier | A published repository whose tier requires a category and has no `pf-cat-*` topic fails the build with an error naming the repository                                                                                        |
| C-005.2 | At most one category          | Two `pf-cat-*` topics on any published repository, whatever its tier, fail the build with an error naming the repository and both topics                                                                                     |
| C-005.3 | Persistence                   | The stored entry carries the category id of the repository, or no category when the tier does not require one; the schema rejects an unknown category and a missing one on a tier that requires it                           |
| C-005.4 | Same output                   | With the repository topics unchanged, the generated HTML is identical to the one before the change; a repository of a tier that does not require a category renders in the same section whether it carries a category or not |
| C-005.5 | New tiers                     | Adding a tier that does not need a category requires no change to the classifier, the schema or the grouping rules                                                                                                           |
| C-005.6 | Documentation                 | The README describes the rule without hardcoding the current categories or tiers, and milestone 004 points to this milestone from its header                                                                                 |
| C-005.7 | Single source of truth        | Which tiers require a category is declared only in `src/config/tiers.ts`; no other code repeats or overrides a tier's requirement                                                                                            |

## Verification

`pnpm quality:check` passes. The unit tests cover the classifier and the
collection schema, and they iterate over `TIERS`:

- US-005.1 and US-005.2: for every tier whose `requiresCategory` is false,
  `classifyRepo` returns that tier with no category and with a category, the
  schema stores the category, and `groupRepos` places both entries in that
  tier's section.
- C-005.1: for every tier whose `requiresCategory` is true, `classifyRepo`
  rejects a repository with no category, naming it.
- C-005.2: for every tier, `classifyRepo` rejects two category topics, naming
  both topics.
- C-005.3: the collection schema accepts an entry of every optional tier with
  and without a category, rejects an entry of every required tier without one,
  and rejects an unknown category.
- C-005.4: build before and after the change with the same topics and compare
  the `dist/` checksum manifests; they must match. `groupRepos` places a tier's
  entries in the same section whether they carry a category or not.
- C-005.5: inspect the classifier, the schema and the grouping; no logic outside
  the tier entry names `lab`, and every category decision reads the tier entry.
- C-005.6: inspect `README.md` and the milestone 004 header.
- C-005.7: `grep -rn "requiresCategory" src`; every match is the declaration or
  accessor in `src/config/tiers.ts` or a read of the tier entry.

Build check for US-005.1 and US-005.2, applied and removed by the owner: pick a
tier whose `requiresCategory` is false in `src/config/tiers.ts`, tag one public
repository with only `pf-show` and that tier's topic, run `pnpm build` and
confirm it renders in that tier. Add a category topic and confirm it still
renders only in that tier and its stored entry carries the category. Without the
tier topic the repository falls back to the default tier; if that tier requires
a category, the build fails naming the repository.

Report the result per ID as PASS, FAIL or NOT VERIFIED with evidence, as
described in `AGENTS.md`.
