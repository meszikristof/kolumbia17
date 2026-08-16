# Kolumbia Sport Klub Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a JAMstack website for Kolumbia Sport Klub using Astro, Vanilla CSS, Decap CMS, and GitHub Pages, based on the approved design spec.

**Architecture:** Astro for static site generation, Decap CMS for content management (with Netlify Identity for auth), GitHub Actions for deployment to GitHub Pages. All content is Markdown/JSON in the repo.

**Tech Stack:** Astro, Vanilla CSS, Decap CMS

## Global Constraints

- Cost: $0 (GitHub Pages, Netlify Identity free tier)
- Output must be in Hungarian (hu-HU)
- Existing `index.html` and `style.css` in the root should be deleted as they are replaced by the Astro project.
- Node.js version 20+

---

### Task 1: Project Initialization & Cleanup

**Files:**
- Delete: `index.html`, `style.css`
- Modify: `package.json`, `astro.config.mjs`, `tsconfig.json` (created by Astro)

- [ ] **Step 1: Clean up existing files**
```powershell
Remove-Item index.html, style.css
```

- [ ] **Step 2: Initialize Astro**
Initialize in the current directory.
```powershell
npx -y create-astro@latest . --template minimal --install --no-git --typescript strict
```

- [ ] **Step 3: Commit**
```powershell
git add .
git commit -m "chore: initialize Astro project and remove old placeholder"
```

### Task 2: Global Styles and Design System

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/ThemeToggle.astro`

**Interfaces:**
- Produces: `BaseLayout` for other pages to wrap their content.

- [ ] **Step 1: Create global CSS**
Create `src/styles/global.css` with the "Sky & Field" color palette (light/dark tokens), typography (Outfit & Inter), and basic resets. Add support for dark mode via a `.dark` class.

- [ ] **Step 2: Create Theme Toggle component**
Create `src/components/ThemeToggle.astro`. It should include a button and an inline script to toggle a `dark` class on the `html` element and save preference to `localStorage`.

- [ ] **Step 3: Create Base Layout**
Create `src/layouts/BaseLayout.astro`.
- Import `global.css`.
- Add Google Fonts links (Outfit and Inter).
- Add basic HTML shell, `<slot />`, and include an inline script in `<head>` to read the dark mode preference from `localStorage` on load (preventing a flash of incorrect theme).

- [ ] **Step 4: Commit**
```powershell
git add src/styles/global.css src/layouts/BaseLayout.astro src/components/ThemeToggle.astro
git commit -m "feat: design system, global styles and base layout"
```

### Task 3: Content Configuration & CMS Setup

**Files:**
- Create: `public/admin/index.html`
- Create: `public/admin/config.yml`
- Create: `src/content/config.ts`

- [ ] **Step 1: Setup Decap CMS HTML**
Create `public/admin/index.html` containing the Decap CMS script and Netlify Identity widget.
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tartalomkezelő (CMS)</title>
    <!-- Netlify Identity -->
    <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  </head>
  <body>
    <!-- Decap CMS -->
    <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
    <script>
      if (window.netlifyIdentity) {
        window.netlifyIdentity.on("init", user => {
          if (!user) {
            window.netlifyIdentity.on("login", () => { document.location.href = "/admin/"; });
          }
        });
      }
    </script>
  </body>
</html>
```

- [ ] **Step 2: Setup CMS Config**
Create `public/admin/config.yml` defining the backend (git-gateway), media_folder (`public/images/uploads`), public_folder (`/images/uploads`), and the following collections:
- `hirek`: folder `src/content/hirek`
- `eredmenyek`: folder `src/content/eredmenyek`
- `versenykiiras`: folder `src/content/versenykiiras`
- `dokumentumok`: folder `src/content/dokumentumok` (Fields: title, date, pdf (file widget), body)
- `pages`: A file collection with items for:
  - `home`: `src/content/pages/home.md` (Fields: title, logo (image), bgImage (image), bgVideo (file), body (markdown, representing the "Bemutatkozás" text))
  - `rolunk`: `src/content/pages/rolunk.md` (Fields: title, body, email, phone)

- [ ] **Step 3: Astro Content Collections**
Create `src/content/config.ts` using Astro's `defineCollection` and `zod` to match the CMS config. (hirek, eredmenyek, versenykiiras, dokumentumok). Use `type: 'content'`. Add a `pages` collection as well.

- [ ] **Step 4: Commit**
```powershell
git add public/admin/ src/content/config.ts
git commit -m "feat: configure Decap CMS and Astro content schemas"
```

### Task 4: Layout Components (Header & Footer)

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create Footer**
Create `src/components/Footer.astro`. Add basic copyright text and club contact email.

- [ ] **Step 2: Create Header**
Create `src/components/Header.astro`. Include the site logo (or text), navigation links (Főoldal, Hírek, Eredmények, Versenykiírás, Dokumentumok, Rólunk), and the `ThemeToggle` component. Ensure it's responsive (hamburger menu on mobile).

- [ ] **Step 3: Update BaseLayout**
Include `<Header />` and `<Footer />` in `src/layouts/BaseLayout.astro` around the `<slot />`.

- [ ] **Step 4: Commit**
```powershell
git add src/components/ src/layouts/BaseLayout.astro
git commit -m "feat: add header and footer navigation"
```

### Task 5: Homepage Implementation

**Files:**
- Create: `src/content/pages/home.md`
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create Dummy Home Content**
Create `src/content/pages/home.md` with frontmatter for `title`, `logo`, `bgImage`. Add some markdown text for the introduction ("Bemutatkozás").

- [ ] **Step 2: Create Hero Component**
Create `src/components/Hero.astro`. It should accept props for background image/video, logo, and title. Implement the full-width section with the background media and logo/title. Use conditional rendering: if video exists, use `<video>`, else use `bgImage`.

- [ ] **Step 3: Implement Homepage**
In `src/pages/index.astro`, use `getEntry('pages', 'home')` to fetch the homepage content.
Use `getCollection('hirek')` to fetch the 3 latest news items.
Display the `<Hero />`, followed by the "Bemutatkozás" text (rendered from `home.md` body).
Below that, display a grid of the 3 latest news cards.

- [ ] **Step 4: Commit**
```powershell
git add src/pages/index.astro src/components/Hero.astro src/content/pages/home.md
git commit -m "feat: implement homepage with hero, intro, and latest news"
```

### Task 6: News & Results Pages

**Files:**
- Create: `src/pages/hirek/index.astro`
- Create: `src/pages/hirek/[...slug].astro`
- Create: `src/pages/eredmenyek/index.astro`
- Create: `src/pages/eredmenyek/[...slug].astro`
- Create: dummy content in `src/content/hirek/` and `src/content/eredmenyek/`

- [ ] **Step 1: Create Dummy Content**
Create one markdown file in `src/content/hirek/` and one in `src/content/eredmenyek/` to test rendering.

- [ ] **Step 2: Implement News Pages**
Create `src/pages/hirek/index.astro` to list all news.
Create `src/pages/hirek/[...slug].astro` for single news view (use `getStaticPaths`).

- [ ] **Step 3: Implement Results Pages**
Create `src/pages/eredmenyek/index.astro` to list all results. Distinguish between external links and internal markdown based on frontmatter.
Create `src/pages/eredmenyek/[...slug].astro` for single result view.

- [ ] **Step 4: Commit**
```powershell
git add src/pages/hirek/ src/pages/eredmenyek/ src/content/
git commit -m "feat: implement news and results pages"
```

### Task 7: Race Announcements, Documents, and About

**Files:**
- Create: `src/pages/versenykiiras/index.astro`
- Create: `src/pages/versenykiiras/[...slug].astro`
- Create: `src/pages/dokumentumok.astro`
- Create: `src/pages/rolunk.astro`

- [ ] **Step 1: Race Announcements (Versenykiírás)**
Create listing and detail pages for race announcements, similar to news. Add a dummy markdown file in `src/content/versenykiiras/`.

- [ ] **Step 2: Documents (Dokumentumok)**
Create `src/pages/dokumentumok.astro`. Fetch all from `dokumentumok` collection. Display them as a list of downloadable links (using the `pdf` field from frontmatter) and show the description (`body`). Add a dummy markdown file in `src/content/dokumentumok/`.

- [ ] **Step 3: About (Rólunk)**
Create `src/pages/rolunk.astro`. Make it read from `src/content/pages/rolunk.md`. Include club description and contact info. Add a dummy markdown file.

- [ ] **Step 4: Commit**
```powershell
git add src/pages/versenykiiras/ src/pages/dokumentumok.astro src/pages/rolunk.astro src/content/
git commit -m "feat: implement race announcements, documents, and about pages"
```

### Task 8: GitHub Actions CI/CD Setup

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create Workflow File**
Create `.github/workflows/deploy.yml`.
```yaml
name: Deploy Astro to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: "pages"
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**
```powershell
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for Astro deployment"
```
