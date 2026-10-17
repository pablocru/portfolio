# Milestone 001: Profile

## Context

The site is the home page of everything `pablocru` publishes on GitHub Pages.
This milestone replaces the Astro starter page with the owner's GitHub profile:
displayed name, avatar, and bio. The profile is resolved at build time, so
visitors receive static HTML. The source of truth for the profile data is the
public GitHub profile of [pablocru](https://github.com/pablocru).

## User stories

| ID       | Role                                          | Action                                         | Benefit                                    | Acceptance criteria                                                                                                       |
| -------- | --------------------------------------------- | ---------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| US-001.1 | Visitor                                       | See the owner's name                           | Know whose portfolio it is                 | The displayed name is the profile name, falling back to the GitHub login when the name is null, empty, or whitespace-only |
| US-001.2 | Visitor                                       | See the owner's avatar                         | Identify the owner                         | The profile picture is displayed with a non-empty `alt` attribute that describes it                                       |
| US-001.3 | Visitor                                       | See the owner's bio                            | Read about the owner                       | The displayed bio is the profile bio; no bio paragraph is rendered when the bio is null, empty, or whitespace-only        |
| US-001.4 | Visitor on a phone                            | Read the page without zooming                  | Use the page on any device                 | The viewport meta tag is present with `width=device-width, initial-scale=1`                                               |
| US-001.5 | Visitor using a screen reader                 | Have the page language and structure announced | Navigate the page                          | `<html lang="en">` is set; exactly one `<h1>` contains the displayed name; the page content is inside `<main>`            |
| US-001.6 | Visitor using a search engine or browser tabs | Recognize the site from its title              | Identify the owner's portfolio at a glance | The document title is `Portfolio of {name}`, using the displayed name                                                     |

## Constraints

| ID      | Requirement                                                                          | Acceptance criteria                                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-001.2 | The build fails with a useful error message when the GitHub profile lookup fails     | The build exits with a non-zero status and the error message identifies the failed GitHub profile lookup and its username                                      |
| C-001.3 | Only the owner's name, avatar, and bio are displayed as profile information          | The generated HTML renders no other GitHub profile field                                                                                                       |
| C-001.5 | The avatar is served by the site itself, not loaded from an external host at runtime | The generated avatar `img[src]` references a local site asset instead of an external URL                                                                       |
| C-001.7 | Astro starter content is removed from the page and the source files                  | The generated page contains no `Welcome to Astro` text or other starter page content, and the starter component and starter SVG assets are removed from `src/` |
| C-001.8 | The build requires no GitHub token, secret, or project-specific environment variable | The build succeeds in a clean environment without project-specific environment variables or credentials, provided the public GitHub API is reachable           |

The project-wide conventions this milestone relies on are defined in
`AGENTS.md`.

## Verification

Run `pnpm quality:check` and `pnpm build`, then inspect `dist/index.html` and
compare the profile data against the public GitHub profile:

`gh api users/pablocru --jq '{name,login,avatar_url,bio}'`

The acceptance criteria above define what to check. Report the result per
requirement ID as described in `AGENTS.md`.

- C-001.2: run the build with network access disabled. This check is run by the
  developer; the implementer reports it as `NOT VERIFIED`.
- C-001.8: run `pnpm build` without GitHub credentials and without
  project-specific environment variables, with the public GitHub API reachable.
