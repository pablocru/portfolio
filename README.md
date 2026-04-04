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
