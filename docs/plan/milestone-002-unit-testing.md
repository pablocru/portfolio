# Milestone 002: Unit testing

## Context

The project has no automated tests. The profile logic added in milestone 001
(name fallback, bio normalization, GitHub lookup error handling) can regress
silently; milestone 001 verified it by hand. This milestone introduces a unit
test suite and covers that logic, so later milestones (repositories, projects)
can be validated automatically.

## User stories

| ID       | Role      | Action                               | Benefit                            | Acceptance criteria                                                                                               |
| -------- | --------- | ------------------------------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| US-002.1 | Developer | Run the whole suite with one command | Catch regressions before pushing   | `pnpm test` runs every test and exits non-zero when any test fails                                                |
| US-002.2 | Developer | Trust the profile name fallback      | The page never shows an empty name | `mapProfile` yields the login when the API name is null, empty or whitespace-only, and the trimmed name otherwise |
| US-002.3 | Developer | Trust the bio normalization          | A blank bio renders no paragraph   | `mapProfile` yields `null` for a null, empty or whitespace-only bio, and the trimmed text otherwise               |
| US-002.4 | Developer | Trust the lookup failure message     | Debug a failed build quickly       | `getProfile` rejects with a message naming the profile lookup and the username, with no network access            |

## Constraints

| ID      | Requirement               | Acceptance criteria                                                                                             |
| ------- | ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| C-002.1 | Deterministic and offline | Running the suite twice in a row gives the same result; no test performs a network request or reads credentials |
| C-002.2 | One command               | `pnpm test` runs every test and exits non-zero on failure                                                       |
| C-002.3 | Test location             | Test files are colocated with the code they cover, suffixed `.test.ts`, under `src/`                            |
| C-002.4 | Out of the build          | No test file is emitted into `dist/`                                                                            |
| C-002.5 | Single pinned runner      | Tests run under `vitest`, pinned to an exact version, with no native build step                                 |
| C-002.6 | Injectable service        | `getProfile` accepts an Octokit client so the failure path is driven without module mocking                     |
| C-002.7 | Quality gate and CI       | `pnpm quality:check` runs the suite, and the CI quality gate fails when the suite fails                         |
| C-002.8 | Documented convention     | `AGENTS.md` documents the command, the test location, and the commit scope (`test`)                             |

## Verification

Run `pnpm test`, `pnpm quality:check` and `pnpm build`, then confirm the CI run
on the branch. Report per requirement ID as in `AGENTS.md`.
