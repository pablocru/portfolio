# Building and learning in public

[![Quality
Check](https://github.com/pablocru/portfolio/actions/workflows/quality-check.yml/badge.svg)](https://github.com/pablocru/portfolio/actions/workflows/quality-check.yml)
[![CI
Pipeline](https://github.com/pablocru/portfolio/actions/workflows/ci-pipeline.yml/badge.svg)](https://github.com/pablocru/portfolio/actions/workflows/ci-pipeline.yml)

This repository contains my personal portfolio website which is a window to my projects.
The goal of this project is to create a clear entry point to my work on GitHub. Here you
will find:

- Selected projects
- Experiments
- Ideas I am exploring
- Links to live demos (when available)

Not all projects are finished, and not all of them are deployed. This portfolio shows both
what I build and how I learn.

## Tech stack

- Node.js environment:
  - Node.js 24+
  - pnpm 10+
- Web framework
  - [Astro](https://astro.build/) 6+ with Server Side Generation (SSG)
  - TypeScript 5+
- Code quality:
  - Prettier and ESlint, both using their Astro plugin
  - Husky and lint-staged:
    - pre-commit: format, lint and typecheck
- GitHub Actions:
  - Quality check: format, lint and typecheck
  - CI pipeline: quality check, build and publish build artifact

## How to start

### Prerequisites

#### Node.js version

Ensure you are using a version compatible with this project which you can find in
`package.json`:

```json
"engines": {
  "node": ">=24 <25"
}
```

I recommend using [FNM](https://github.com/Schniz/fnm) as Node.js version manager. When it
is installed you can switch to the exact version I use that can be found in `.nvmrc` by a
simple command:

```bash
fnm use
```

> You can configure FNM to switch version automatically. Take a look at the [official
> documentation](https://github.com/Schniz/fnm/blob/master/docs/configuration.md#--use-on-cd).

#### Package manager

In this project I use [PNPM](https://pnpm.io/) because it is fast and saves disk space. In
order to use it, use [corepack](https://github.com/nodejs/corepack) instead of installing
PNPM globally in your computer. Then enable it and the first time you use a PNPM command
corepack will install the exact version I set in `package.json`:

```bash
corepack enable
```

### Installation

1. Clone this repository

   ```bash
   git clone https://github.com/pablocru/portfolio.git
   ```

1. Install dependencies

   ```bash
   pnpm install
   ```

1. Run development server

   ```bash
   pnpm dev
   ```

## Contribute

If you notice any mistakes or have suggestions, I’m all ears! I appreciate any feedback so
don't hesitate to [open an Issue on GitHub](https://github.com/pablocru/portfolio/issues)
or submit a `Pull Request`.

### Contribution guidelines

1. `Fork` the repository and make your changes in a `new branch`.
1. Document your additions.
1. Use [Conventional Commits](https://www.conventionalcommits.org).
1. Submit a `Pull Request` with a clear description of your changes.

Thank you for helping improve this project!
