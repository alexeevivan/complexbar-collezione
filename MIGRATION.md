# Migration plan: ComplexBar Collezione under alexeevivan.com

## Goal

Publish this project as an independent section of the main portfolio site:

```text
https://alexeevivan.com/expert-studio/
```

All public pages should use extensionless URLs with a trailing slash:

```text
https://alexeevivan.com/expert-studio/collaboration/
https://alexeevivan.com/expert-studio/calendar/
https://alexeevivan.com/expert-studio/super-juice/
```

The intended slug is `expert-studio`. Do not introduce the misspelled variant `expert-stuido`.

## Recommended architecture

Keep the two projects in separate GitHub repositories and combine them only at the hosting level:

```text
CV-Bar repository
└── deploys to /www/alexeevivan.com/

complexbar-collezione repository
└── deploys to /www/alexeevivan.com/expert-studio/
```

This is preferable to a monorepo or Git submodule because:

- each project keeps its own dependencies, build and history;
- either project can be deployed or rolled back independently;
- changes to Expert Studio do not rebuild the portfolio site;
- the existing GitHub Pages deployment can remain available during migration;
- the main site's incremental deployment does not manage or delete the `expert-studio` directory.

## Current project facts

- Webpack 5 multi-page static site.
- Approximately 23 generated HTML pages.
- Current production output is about 159 MB.
- Pages are currently emitted as flat files such as `collaboration.html`.
- Internal navigation contains many relative `.html` links.
- Assets are emitted into `js/`, `css/` and `assets/`.
- The post-build image optimizer converts raster images to WebP and rewrites references.
- The site currently deploys to GitHub Pages from `main`.
- Registration forms submit to Google Apps Script and must be retested from the new origin.

## URL strategy

Each page should be emitted as a directory containing `index.html`:

| Current output | New production output | Public URL |
| --- | --- | --- |
| `index.html` | `main/index.html` | `/expert-studio/main/` |
| — | `index.html` (redirect to `main/`) | `/expert-studio/` → `/expert-studio/main/` |
| `collaboration.html` | `collaboration/index.html` | `/expert-studio/collaboration/` |
| `calendar.html` | `calendar/index.html` | `/expert-studio/calendar/` |
| `super-juice.html` | `super-juice/index.html` | `/expert-studio/super-juice/` |
| `pd-syrup-recipes.html` | `pd-syrup-recipes/index.html` | `/expert-studio/pd-syrup-recipes/` |

Apply the same rule to every other public page.

### Naming conflict

The project already contains `expert-studio.html`, while `/expert-studio/` will become the root of the whole project. Keeping both would produce an awkward URL:

```text
/expert-studio/expert-studio/
```

Resolved: the page is now `about.html` in the source and is published as:

```text
/expert-studio/about/
```

The landing page of the section is `main/index.html`, and the section root
`/expert-studio/` serves a small redirect page pointing to `main/`, so the
landing page itself never appears as `/expert-studio/expert-studio/`.

## Webpack changes (implemented)

All 23 `HtmlWebpackPlugin` entries now emit nested files, and the landing page is `main/index.html`:

```js
new HtmlWebpackPlugin({ template: './src/html/index.html', filename: 'main/index.html', chunks: ['main'] }),
new HtmlWebpackPlugin({ template: './src/html/classes/about.html', filename: 'about/index.html', chunks: ['main', 'expert'] }),
new HtmlWebpackPlugin({ template: './src/html/classes/calendar.html', filename: 'calendar/index.html', chunks: ['main', 'calendar'] }),
```

`output.publicPath` stays `'auto'`. html-webpack-plugin computes the prefix per output file (it returns `../` for pages one level deep), so pages reference `../js/...` and `../css/...` and the same build works both under `/expert-studio/` and under the GitHub Pages subfolder. **No `SITE_BASE_PATH` variable is needed**, and `output.clean: true` is kept.

`scripts/optimize-images.js` needed no changes: it walks `dist` recursively, its reference regex also matches `assets/img/...` inside `../assets/img/...`, and the last build reported no missing files.

Page renames:

| Before | After | Public URL |
| --- | --- | --- |
| `src/html/classes/expert-studio.html` | `src/html/classes/about.html` | `/expert-studio/about/` |
| `src/html/calculator/expert-studio-calculator.html` | `src/html/calculator/calculator.html` | `/expert-studio/calculator/` |

A new template `src/html/root-redirect.html` is emitted as `dist/index.html`: a `noindex` page with `<meta http-equiv="refresh" content="0; url=main/">` and a plain link fallback.

## Internal navigation changes (implemented)

Flat `.html` links were converted to trailing-slash directory links:

```html
<a href="collaboration.html">  →  <a href="../collaboration/">
<a href="index.html">         →  <a href="../main/">
```

Relative `../<slug>/` was chosen over the absolute `/expert-studio/<slug>/` prefix: every generated page sits exactly one level below the section root, so it is correct everywhere and keeps working on GitHub Pages (`/complexbar-collezione/...`) without a second build. There are no flat `.html` `href`s left in `src/html` and no `.html` navigation inside the JavaScript.

Asset references in templates and JavaScript are relative too, because they are not processed by webpack:

- 47 `src="assets/..."` attributes in `src/html` → `src="../assets/..."`;
- 20 image paths in `src/js/recipes-data.js` → `'../assets/img/...'` (assigned to `img.src`, so they resolve against the page URL).

Asset URLs inside SCSS are resolved by webpack at build time and needed no change (they already come out as `../assets/img/...` relative to `dist/css/`).

Fragment links (`#registration-block`), `href="#"` controls and external links were not touched. No global `<base>` tag was introduced.

## Current state of the branch

Generated output:

```text
dist/index.html          → /expert-studio/          (redirect to main/)
dist/main/index.html     → /expert-studio/main/
dist/about/index.html    → /expert-studio/about/
dist/calculator/index.html → /expert-studio/calculator/
…20 more pages as <slug>/index.html
```

Files changed:

- `webpack.config.js` — nested filenames, `main/index.html`, root redirect plugin;
- `src/html/**/*.html` — links `../<slug>/`, assets `../assets/...`;
- `src/html/root-redirect.html` — new;
- `src/html/classes/about.html`, `src/html/calculator/calculator.html` — renamed;
- `src/js/recipes-data.js` — `../assets/img/...`;
- `.github/workflows/deploy-hoster.yml` — new deployment workflow;
- `MIGRATION.md` — this document.

Verification performed on the production build:

- `npm run build` passes (webpack + WebP: 49 files, 154 MB → 13.7 MB);
- all references in the built `dist` resolve: 127 HTML asset refs, 20 JS image refs, 72 CSS `url()` refs, 0 missing;
- every `../<slug>/` link points at an existing `<slug>/index.html`;
- a static server returns 200 for `/`, `/main/`, `/about/`, `/calculator/`, the bundled JS and CSS.

Local development: `npm start` serves from `dist`, so pages open at `http://localhost:8080/main/`, `/about/`, `/calculator/`, etc. Both projects use port 8080, so run one dev server at a time or change the port for one of them.

Known leftover: the “back to portfolio” link in the footer still points to `https://alexeevivan.github.io/CV-Bar/` and should become `https://alexeevivan.com/` after the main site is confirmed.

## Main portfolio integration

The CV-Bar project remains the owner of `alexeevivan.com/`.

Required change in that repository:

- add a visible link or project card pointing to `/expert-studio/`;
- do not copy the second project's source or dependencies into CV-Bar;
- do not add Expert Studio assets to the main project's `dist`.

## Hoster.by deployment

Add an independent GitHub Actions workflow to this repository.

Recommended deployment target:

```text
/www/alexeevivan.com/expert-studio/
```

Prefer a dedicated FTP/SFTP user whose home directory is restricted to that folder. If the existing `github-deploy` account is reused, the workflow must always prepend `/expert-studio/` and must never mirror or delete the domain root.

Implemented in `.github/workflows/deploy-hoster.yml`. Workflow sequence:

1. Check out the repository.
2. Run `npm ci`.
3. Run `npm run build` (webpack + WebP optimization).
4. Check that `dist/index.html`, `dist/main/index.html` and `dist/about/index.html` exist.
5. Mirror `dist/` into `/expert-studio/` with lftp:

```sh
mirror -R --delete --no-perms --parallel=3 dist/ /expert-studio/
```

6. Verify at least these remote files:

```text
/expert-studio/index.html
/expert-studio/main/index.html
```

Notes:

- A full mirror is used because `dist` is not committed to Git, so there is no
  reliable per-commit file list to diff. After WebP optimization `dist` is about
  22 MB, which is small enough to mirror on every push; lftp only transfers
  changed files.
- `--delete` is scoped to `/expert-studio/`, which contains nothing but this
  project, so the domain root can never be touched.
- No `SITE_BASE_PATH` is needed: `output.publicPath: 'auto'` makes
  html-webpack-plugin emit paths relative to each page (`../js/...`), so the same
  build works under `/expert-studio/` and under the GitHub Pages subfolder.
- No deployment marker is written, so the main site's root `/.deploy-sha` is
  never affected.
- The repository needs the `HOSTER_FTP_PASSWORD` secret (the same value used by
  CV-Bar); host and user are the ones already used by `github-deploy`.

## GitHub Pages compatibility

GitHub Pages can remain online during and after migration.

Use separate build-time base paths:

```text
Hoster.by:    /expert-studio/
GitHub Pages: /complexbar-collezione/
```

Both targets should build from the same source. Do not hardcode one hosting provider's path throughout the JavaScript and styles.

Once hoster.by is verified, decide whether GitHub Pages remains:

- a fallback deployment;
- a preview environment;
- or is disabled to avoid duplicate public content.

## SEO and legacy URLs

- Add a canonical URL to every generated page using the new `alexeevivan.com` address.
- Keep trailing slashes consistent.
- If old GitHub Pages URLs have external traffic, retain them temporarily or add redirects where possible.
- Decide whether old `.html` URLs on the new host should redirect or simply remain unavailable.
- Add or update `sitemap.xml` and `robots.txt` after the final route map is approved.

## Functional risks

### High attention

- dozens of relative `.html` links can break after pages become nested directories;
- shared JS/CSS/image paths can resolve against the wrong page directory;
- the existing `expert-studio.html` slug conflicts with the new project root;
- the first FTP upload is still a full upload: about 22 MB after WebP optimization (`dist` is around 159 MB before conversion);
- an unrestricted FTP mirror could overwrite files belonging to the main portfolio — the workflow is therefore scoped to `/expert-studio/`.

### Must be retested

- registration forms and Google Apps Script submissions;
- calendar and event navigation;
- recipe search and recipe pages;
- all calculators;
- mobile and desktop menus;
- fonts, background images and WebP conversion;
- direct opening and refresh of every clean URL;
- browser back/forward navigation;
- links from Expert Studio back to the main portfolio.

## Suggested implementation phases

### Phase 1: Baseline

- build the current project without modifications;
- record all generated pages and key user flows;
- confirm the current GitHub Pages deployment is green;
- record current `dist` size and asset inventory.

### Phase 2: Route map

- approve the slug for every public page;
- resolve the `expert-studio.html` naming conflict;
- decide which experimental or unused files are not public pages;
- define canonical and legacy URLs.

### Phase 3: Build migration — done

- emit nested `<slug>/index.html` files;
- landing page at `main/index.html`, section root as a redirect;
- convert internal navigation to clean routes;
- rewrite asset references in templates and JS;
- verify the optimized production build locally.

Status: completed in this branch. Canonical metadata is still missing (see “SEO and legacy URLs”).

### Phase 4: Hoster.by deployment

- add the workflow targeting `/expert-studio/` on push to `main` — done (`.github/workflows/deploy-hoster.yml`, 22 MB mirror);
- add the `HOSTER_FTP_PASSWORD` secret to **this** repository — pending, GitHub secrets are per repository;
- confirm the `github-deploy` FTP user may create `/expert-studio/`;
- perform the first upload;
- confirm remote files before exposing a link from the main site.

### Phase 5: Production QA

- test all public pages at desktop and mobile widths;
- verify console and network errors;
- submit a controlled test registration;
- test direct URLs, refreshes and return links;
- verify SSL and the hoster.by protection layer.

### Phase 6: Main-site integration

- add the `/expert-studio/` entry point to CV-Bar;
- deploy CV-Bar independently;
- monitor both GitHub Actions workflows;
- keep rollback commits for both repositories.

## Rollback strategy

Because the repositories remain separate, rollback is straightforward:

1. Remove or hide the `/expert-studio/` link from the main portfolio.
2. Redeploy the previous CV-Bar commit if necessary.
3. Redeploy the previous ComplexBar Collezione commit or leave GitHub Pages active.
4. Do not delete the hoster.by directory until the cause is understood.

## Estimated effort

| Scope | Estimate |
| --- | --- |
| Upload the existing flat `.html` build under `/expert-studio/` | 3–5 hours |
| Clean URLs for all pages, dual base paths, deployment and full QA | 1–2 focused working days |
| Additional asset optimization and redirect/SEO work | Add 0.5–1 day |

## Decisions required before implementation

- [x] Confirm the canonical prefix: `/expert-studio/`.
- [x] Choose the replacement slug for the current `expert-studio.html` page: `about/`.
- [x] Decide the base-path approach: relative links plus `publicPath: 'auto'`, no `SITE_BASE_PATH`.
- [x] Keep recipes and calculators directly under `/expert-studio/<slug>/` (no grouped paths).
- [ ] Decide whether GitHub Pages stays as a fallback or preview.
- [ ] Decide whether old `.html` URLs need redirects.
- [ ] Confirm the FTP/SFTP deployment account and its restricted home directory.
- [ ] Confirm whether all 23 generated pages are public and still needed.

## Definition of done

- Every approved page opens directly at its canonical clean URL.
- Refreshing a nested page does not return 404.
- All JS, CSS, fonts and images load from the correct prefixed path.
- Internal navigation contains no unintended `.html` URLs.
- The main portfolio links to `/expert-studio/`.
- Both projects deploy independently.
- Incremental deployment never writes outside `/expert-studio/`.
- Registration forms and calculators work in production.
- GitHub Actions and production smoke checks are green.
