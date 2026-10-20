# Milestone 004: Categorization

## Context

Milestone 003 publishes every public repository tagged with `pf-show` as a
single list. That list says nothing about the kind of work each repository
represents, and featuring a subset would require editing the site. This
milestone classifies each published repository with GitHub topics and groups the
page by that classification: one category per repository, an optional tier, and
one section per non-empty group. GitHub topics remain the only input, so the
owner classifies a repository by tagging it and the next build picks it up.

The category topics use the `pf-cat-*` prefix anticipated by milestone 003. The
tier topics use `pf-tier-*`, which replaces the provisional `pf-featured` and
`pf-lab` names mentioned there; no repository carries a tier topic yet.

Categories and tiers are persisted with each entry for later milestones. This
milestone adds no route and no category view: paths will be descriptive and will
be decided by the milestone that introduces them.

## User stories

| ID       | Role      | Action                                        | Benefit                                          | Acceptance criteria                                                                                                                                                                                                                    |
| -------- | --------- | --------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-004.1 | Visitor   | See the portfolio grouped by category         | Understand the kind of work at a glance          | The page renders one section per non-empty group, and each published repository appears in exactly one section                                                                                                                         |
| US-004.2 | Visitor   | See featured work first                       | Reach the most relevant repositories quickly     | Repositories tagged `pf-tier-featured` render in a `Featured` section placed before every category section                                                                                                                             |
| US-004.3 | Visitor   | Find experiments separately                   | Tell lab work from finished work                 | Repositories tagged `pf-tier-lab` render in a `Lab` section placed after every category section                                                                                                                                        |
| US-004.4 | Visitor   | Read a predictable list                       | Compare entries without scanning                 | Within a group, active repositories precede archived ones, then descending `pushed_at`, then ascending name; each entry keeps the data of milestone 003                                                                                |
| US-004.5 | Owner     | Classify a repository by tagging it           | Change the portfolio without editing the site    | A public repository tagged `pf-show` plus one category topic, and optionally one tier topic, renders in the matching section after a rebuild                                                                                           |
| US-004.6 | Owner     | Spot a misconfiguration in the build log      | Fix the topics before publishing                 | Every missing, duplicated or unknown control topic is reported with the repository name and the offending topic, as a warning or an error per the constraints                                                                          |
| US-004.7 | Visitor   | Never see an empty section                    | Not read the page as incomplete                  | A group without entries renders no heading and no list; the empty-portfolio message of US-003.4 is unchanged                                                                                                                           |
| US-004.8 | Developer | Trust the classification without the network  | Change the rules safely                          | Publication, classification, grouping, ordering, warnings and errors are covered by unit tests that run offline                                                                                                                        |

## Constraints

| ID       | Requirement          | Acceptance criteria                                                                                                                                                                                                                                                                                                           |
| -------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-004.1  | Closed vocabulary    | The categories `Web`, `Data` and `Cloud & DevOps` map to `pf-cat-web`, `pf-cat-data` and `pf-cat-cloud-devops`; the tiers `Featured`, `Project` and `Lab` map to `pf-tier-featured`, `pf-tier-project` and `pf-tier-lab`. Both vocabularies are TypeScript enums in the shared constants module and are declared nowhere else |
| C-004.2  | Sole gate            | `pf-show` remains the only publication gate: a public repository tagged only with classification topics does not appear in the generated HTML                                                                                                                                                                                 |
| C-004.3  | One category         | A published repository with no `pf-cat-*` topic fails the build with an error naming the repository; the same happens with two different category topics, and the message names both                                                                                                                                          |
| C-004.4  | Tiers                | Any two `pf-tier-*` topics on a published repository, including `pf-tier-project`, fail the build with an error naming both. `pf-tier-project` alone groups exactly as no tier topic does                                                                                                                                     |
| C-004.5  | Control topics       | On a published repository, any topic beginning with `pf-` other than `pf-show` or a vocabulary topic fails the build with an error naming the repository and the topic. Without `pf-show`, a repository carrying `pf-*` topics is not published and the build warns naming them                                               |
| C-004.6  | Private repositories | A private repository carrying `pf-show` does not appear in the generated HTML and the build warns naming it                                                                                                                                                                                                                   |
| C-004.7  | One group each       | A featured repository renders only in `Featured`, a lab repository only in `Lab`, and every other published repository only in its category section                                                                                                                                                                           |
| C-004.8  | Section order        | The sections, when present, appear in this order: `Featured`, `Web`, `Data`, `Cloud & DevOps`, `Lab`                                                                                                                                                                                                                          |
| C-004.9  | Entry order          | Archived entries come last; among active entries the most recently pushed comes first, ties broken by ascending name; an entry without `pushed_at` sorts after those with a value                                                                                                                                             |
| C-004.10 | Empty groups         | A category with no project-tier repository, a `Featured` group with no featured repository and a `Lab` group with no lab repository each produce a warning naming the group and render no section                                                                                                                             |
| C-004.11 | Headings             | The page keeps one `h2` named `Repositories`; each group is a section named by an `h3` whose entries are a list; each entry remains an article whose heading is an `h4`; no heading level is skipped                                                                                                                          |
| C-004.12 | Persistence          | The repository type and the collection schema carry the category, the tier and the GitHub `pushed_at` value of every entry; the schema rejects an entry with an unknown category or tier. No collection, route, request or script is added                                                                                    |
| C-004.13 | Warnings and errors  | A warning leaves the build green and the page in place; an error stops the build. Every misconfiguration produces a message naming the repository and the offending topic                                                                                                                                                     |
| C-004.14 | Scope                | The page gains no tags, demo links, `class` attributes, stylesheet or `<style>` element, and renders no repository field beyond the milestone 003 set                                                                                                                                                                         |

The project-wide conventions this milestone relies on are defined in
`AGENTS.md`.

## Verification

Run `pnpm quality:check` and `pnpm build`, then inspect `dist/index.html`.
Compare the rendered groups with the classification the API reports:

```bash
gh api "users/pablocru/repos?per_page=100&type=owner" --jq '
  [.[] | select(.private == false) | select(.topics | index("pf-show"))
  | {name, pushed_at, archived,
     categories: [.topics[] | select(startswith("pf-cat-"))],
     tiers: [.topics[] | select(startswith("pf-tier-"))]}]'
```

For every published repository, confirm that it appears once, in the expected
section, and that the order of its group matches C-004.8 and C-004.9.

The acceptance criteria above define what to check. Report the result per
requirement ID as described in `AGENTS.md`.

- US-004.1 to US-004.5, C-004.7 to C-004.10 and C-004.12: these need at least
  one public repository tagged with `pf-show` and a valid category. Today
  `pablocru/portfolio` is the only one and carries no category, so the build
  fails by C-004.3 until it is tagged. Without a valid category the positive
  cases are reported as `NOT VERIFIED`.
- US-004.6, C-004.2 to C-004.6 and C-004.13: the warning and error paths are
  covered by `pnpm test` with an in-memory repository source. To observe them in
  a build, add a topic to a real repository, rebuild and revert the tag
  afterwards.
- C-004.1: inspect the shared constants module and confirm that it declares both
  enums and all six topics.
- C-004.11: inspect the heading levels in `dist/index.html` and confirm the page
  has one `main` landmark.
- C-004.14: confirm `dist/index.html` adds no `class` attribute, no `<style>`
  element and no `<script>` element from this milestone.

### Test data

The positive cases need tagged repositories. Adding or removing a topic is a
remote change: the owner approves each `gh repo edit --add-topic` or
`--remove-topic` command before it runs. Tags used only for verification are
removed afterwards, and the owner re-adds the definitive topics by hand once the
pull request is merged.
