# Milestone 006: The tier publishes

- Supersedes in part milestone 004 (US-004.5, C-004.2, C-004.4 and C-004.5),
  milestone 003 (US-003.1, US-003.6, C-003.2 and C-003.6), milestone 005
  (US-005.1 and US-005.2), and the default-tier fallback described in the
  verification of milestone 005

## Context

Until now a repository is published by tagging `pf-show`, its tier is optional
with a default, and the page divides by category only the section of the one
tier that the code names. This milestone makes the tier the first classification
of a repository and the only thing that publishes it: the owner tags a tier, and
each tier declares in the configuration whether its section is divided by
category. The rendered page does not change.

## User stories

| ID       | Role  | Action                                                             | Benefit                                                | Acceptance criteria                                                                                                                                  |
| -------- | ----- | ------------------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-006.1 | Owner | To publish a repository by tagging it with its tier                | To read what is published, and where, from the topics  | A public repository with exactly one tier topic builds and renders in that tier; a repository with no tier topic is not published                    |
| US-006.2 | Owner | To hide a repository without losing its classification             | To pause its publication and resume it later           | Removing the tier topic and keeping a category topic leaves the repository out of the page, and the build warns naming the repository and the topics |
| US-006.3 | Owner | To choose in the configuration which tiers are divided by category | To change how a tier is shown without editing the code | A tier declared as divided by category renders one section per category that has repositories in it; any other tier renders a single section         |

## Constraints

| ID       | Requirement               | Acceptance criteria                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-006.1  | Tier is the gate          | Only a public repository with a tier topic is published; a private repository carrying one is not published, never fails the build, and the build warns naming the repository and the tier topics                                                                                                                                                                                                                                                                 |
| C-006.2  | Intent to publish         | For a public repository, any topic with the tier prefix counts as intent: an unknown tier topic, or two tier topics, fails the build with an error naming the repository and the topics                                                                                                                                                                                                                                                                           |
| C-006.3  | Retired topic             | `pf-show` is no longer part of the vocabulary and is handled like any other unknown control topic                                                                                                                                                                                                                                                                                                                                                                 |
| C-006.4  | No default tier           | No tier is assumed for a repository, and no code names a particular tier as the default                                                                                                                                                                                                                                                                                                                                                                           |
| C-006.5  | Section built by the tier | Whether a tier is divided by category is declared only in `src/config/tiers.ts`; a tier that requires a category must declare it, and a tier that does not require a category cannot be declared as divided by category: the quality checks fail                                                                                                                                                                                                                  |
| C-006.6  | Nothing is dropped        | Every published repository appears in exactly one section                                                                                                                                                                                                                                                                                                                                                                                                         |
| C-006.7  | Same output               | With the same published repositories, tiers and categories, the generated HTML is identical to the one before the change                                                                                                                                                                                                                                                                                                                                          |
| C-006.8  | New tiers                 | Adding a tier, or changing which tiers are divided by category, requires no change to the classifier, the schema or the grouping rules                                                                                                                                                                                                                                                                                                                            |
| C-006.9  | Documentation             | The README presents the tier topic as what publishes, without hardcoding the current tiers, and the headers of milestones 003, 004 and 005 point to this milestone                                                                                                                                                                                                                                                                                                |
| C-006.10 | Failure policy            | Only a public repository that shows intent to publish (a tier topic, known or unknown) can stop the build, and only when its topics are invalid, with every fault reported together in one error; every other case never stops the build: a repository with control topics but no tier topic, and a private repository carrying a tier topic, produce a warning naming the repository and the topics, and a repository with no control topics is ignored silently |

## Verification

`pnpm quality:check` passes. The unit tests iterate over `TIERS` and cover:

- US-006.1, C-006.1 to C-006.4: `classifyRepo` publishes a public repository
  with one tier topic for every tier, ignores one without, warns for a private
  one whatever its tier and control topics say (including an unknown or a
  duplicated tier topic, a missing required category and an unknown control
  topic), rejects an unknown tier topic and two tier topics on a public
  repository naming the repository and the topics, and treats `pf-show` as an
  unknown control topic; `grep -rn "DEFAULT_TIER_ID" src` finds nothing.
- US-006.2: a repository with a category topic and no tier topic is not
  published and produces the warning.
- US-006.3, C-006.5 and C-006.6: `groupRepos` returns one group per non-empty
  category for every tier divided by category and one group for every other
  tier, and with a fixture set covering every tier the groups hold exactly the
  published repositories; type-level tests in the config test prove that a tier
  that requires a category must declare whether it is divided by category, and
  that declaring a tier that does not require a category as divided by category
  does not compile.
- C-006.7: build before and after the change, the owner having removed `pf-show`
  between the two builds, and compare the `dist/` checksum manifests.
- C-006.8: inspect the classifier, the schema and the grouping; no logic outside
  the tier entry names a tier.
- C-006.9: inspect `README.md` and the headers of milestones 003, 004 and 005.
- C-006.10: a table-driven unit test covers every combination of visibility
  (public, private) and state (no control topics, control topics without a tier
  topic, a tier topic with valid topics, a tier topic with invalid topics) and
  asserts that the result is ignored, a warning, published or an error exactly
  as the table in the spec says; a private repository never throws, whatever its
  topics.

| Visibility | State                               | Result                    |
| ---------- | ----------------------------------- | ------------------------- |
| Public     | No control topics                   | Ignored                   |
| Public     | Control topics without a tier topic | Warning                   |
| Public     | Tier topic, everything valid        | Published                 |
| Public     | Tier topic, something invalid       | Error (every fault)       |
| Private    | No control topics                   | Ignored                   |
| Private    | Control topics without a tier topic | Warning                   |
| Private    | Tier topic, everything valid        | Warning (it is private)   |
| Private    | Tier topic, something invalid       | Warning, never an error   |

Build checks applied and removed by the owner: on one published repository,
misspell the tier topic and confirm the build fails naming it; remove the tier
topic and confirm the page omits it and the build warns.

Report the result per ID as PASS, FAIL or NOT VERIFIED with evidence, as
described in `AGENTS.md`.
