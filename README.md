# Building and learning in public

[![Quality Gate](https://github.com/pablocru/portfolio/actions/workflows/quality-gate.yml/badge.svg)](https://github.com/pablocru/portfolio/actions/workflows/quality-gate.yml)
[![CI Pipeline](https://github.com/pablocru/portfolio/actions/workflows/ci-pipeline.yml/badge.svg)](https://github.com/pablocru/portfolio/actions/workflows/ci-pipeline.yml)

This repository contains my personal portfolio website which is a window to my
projects. The goal of this project is to create a clear entry point to my work
on GitHub. The page groups the repositories I publish by category, and gives
featured work and experiments a section of their own. Here you will find:

- Featured work, before the categories
- The `Web`, `Data` and `Cloud & DevOps` categories
- The `Lab` section, for the experiments
- A link to each repository on GitHub

Not all projects are finished, and not all of them are deployed. This portfolio
shows both what I build and how I learn.

## Publishing a repository

The portfolio lists the public repositories I tag with `pf-show`. Add the topic
that describes the kind of work, and optionally the topic for its tier:

| Topic                 | Effect                                             |
| --------------------- | -------------------------------------------------- |
| `pf-show`             | Publishes the repository                           |
| `pf-cat-web`          | `Web` category                                     |
| `pf-cat-data`         | `Data` category                                    |
| `pf-cat-cloud-devops` | `Cloud & DevOps` category                          |
| `pf-tier-featured`    | `Featured` section, before the categories          |
| `pf-tier-project`     | `Project` tier, the same grouping as no tier topic |
| `pf-tier-lab`         | `Lab` section, after the categories                |

A published repository needs exactly one category and at most one tier. The next
build picks the change up, and a repository with a missing, duplicated or
unknown topic fails the build with an error that names it. The vocabulary is
declared in `src/constants.ts`.

## Tech stack

- Runtime and tooling versions are declared in `package.json`.
- Web framework: [Astro](https://astro.build/) with SSG and TypeScript.
- Quality tooling: Biome, Prettier (YAML), rumdl, and Lefthook.
- Testing: [Vitest](https://vitest.dev/).
- Automation: GitHub Actions workflows in `.github/workflows`.

## How to start

1. Clone the repository

   ```bash
   git clone https://github.com/pablocru/portfolio.git
   ```

1. Prepare the toolchain

   The toolchain is pinned in `package.json`: Node.js via `devEngines.runtime`
   and pnpm via `packageManager`. This keeps local and CI on the same versions.

   The recommended way is [mise](https://mise.jdx.dev/), which reads those
   versions from `package.json` and installs them for you:

   ```bash
   # installs the pinned Node.js and pnpm
   mise install
   ```

   Without `mise`, install the `Node.js` and `pnpm` versions declared in
   `package.json` manually. The pre-commit hook runs the pinned toolchain
   through `mise`, so `mise` must be installed to commit.

   The quality gate fails when the pinned `Node.js` version has a known
   vulnerability or sits on a release line that no longer receives security
   fixes.

1. Install dependencies

   ```bash
   pnpm safe-install
   ```

   > I use a custom install script to ensure dependencies are installed with a
   > frozen lockfile. Lefthook's own `postinstall` script registers the git
   > hooks.

1. Develop and build

   ```bash
   # starts the local dev server
   pnpm dev
   # builds the static site into dist/
   pnpm build
   ```

   > The GitHub token is optional: the build reads the public GitHub API
   > anonymously. Without it you can hit the anonymous rate limit; to raise it,
   > set `GITHUB_TOKEN` in a `.env` file, as shown in `.env.example`.

## Contribute

If you notice any mistakes or have suggestions, I’m all ears! I appreciate any
feedback so don't hesitate to
[open an Issue on GitHub](https://github.com/pablocru/portfolio/issues) or
submit a `Pull Request`.

### Contribution guidelines

1. `Fork` the repository and make your changes in a `new branch`.
1. Document your additions.
1. Use [Conventional Commits](https://www.conventionalcommits.org).
1. For a pull request that delivers a milestone, report every requirement in the
   acceptance criteria table of the pull request template.
1. Submit a `Pull Request` with a clear description of your changes.

Thank you for helping improve this project!
