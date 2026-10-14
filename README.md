# Building and learning in public

[![Quality Gate](https://github.com/pablocru/portfolio/actions/workflows/quality-gate.yml/badge.svg)](https://github.com/pablocru/portfolio/actions/workflows/quality-gate.yml)
[![CI Pipeline](https://github.com/pablocru/portfolio/actions/workflows/ci-pipeline.yml/badge.svg)](https://github.com/pablocru/portfolio/actions/workflows/ci-pipeline.yml)

This repository contains my personal portfolio website which is a window to my
projects. The goal of this project is to create a clear entry point to my work
on GitHub. Here you will find:

- Selected projects
- Experiments
- Ideas I am exploring
- Links to live demos (when available)

Not all projects are finished, and not all of them are deployed. This portfolio
shows both what I build and how I learn.

## Tech stack

- Node.js environment:
  - Node.js 24+ (pinned via `devEngines.runtime`)
  - pnpm 12+ (pinned via `packageManager`)
- Web framework
  - [Astro](https://astro.build/) with Server Side Generation (SSG; version
    pinned in `package.json`)
  - TypeScript 5+
- Code quality:
  - Biome for code quality checks and formatting
  - Prettier for YAML formatting
  - rumdl for Markdown linting and formatting
  - Lefthook:
    - pre-commit: format and lint
- GitHub Actions:
  - Quality gate: Biome, Prettier (YAML), rumdl and typecheck
  - CI pipeline: quality gate, build and publish build artifact

## How to start

### Prerequisites

#### Toolchain

The toolchain is pinned in `package.json`: Node.js via `devEngines.runtime` and
pnpm via `packageManager`. This keeps local and CI on the same versions.

The recommended way is [mise](https://mise.jdx.dev/), which reads those versions
from `package.json` and installs them for you:

```bash
# installs the pinned Node.js and pnpm
mise install
# installs dependencies
pnpm install
# starts the local dev server
pnpm dev
# builds the static site into dist/
pnpm build
```

Without `mise`, install the `Node.js` and `pnpm` versions declared in
`package.json` manually, then run the same `pnpm` commands.

### Installation

1. Clone this repository

   ```bash
   git clone https://github.com/pablocru/portfolio.git
   ```

1. Install dependencies

   ```bash
   pnpm safe-install
   ```

   > I use a custom install script to ensure dependencies are installed with a
   > frozen lockfile. Lefthook's own `postinstall` script registers the git
   > hooks.

1. Run development server

   ```bash
   pnpm dev
   ```

## Contribute

If you notice any mistakes or have suggestions, I’m all ears! I appreciate any
feedback so don't hesitate to
[open an Issue on GitHub](https://github.com/pablocru/portfolio/issues) or
submit a `Pull Request`.

### Contribution guidelines

1. `Fork` the repository and make your changes in a `new branch`.
1. Document your additions.
1. Use [Conventional Commits](https://www.conventionalcommits.org).
1. Submit a `Pull Request` with a clear description of your changes.

Thank you for helping improve this project!
