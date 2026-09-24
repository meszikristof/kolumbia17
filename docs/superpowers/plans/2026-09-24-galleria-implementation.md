# Galéria Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a photo gallery section (`/galleria/`) to the Kolumbia 17 Astro website, allowing admins to manage photo albums via Sveltia CMS and visitors to browse, filter, and view photos in a lightbox.

**Architecture:** Astro content collection (`galleria`) with markdown+frontmatter files. Two Astro pages: album listing page with vanilla JS client-side filtering, album detail page with CSS masonry grid and GLightbox. All managed via Sveltia CMS (GitHub backend).

**Tech Stack:** Astro 7.x, Sveltia CMS (YAML config), Astro `<Image>`, GLightbox (CDN), vanilla JS, CSS variables (existing design system)

## Global Constraints

- Node ≥ 22.12.0 required
- Do NOT push to remote (user rule)
- All CSS uses existing CSS variables: `--bg-secondary`, `--border-light`, `--text-primary`, `--text-secondary`, `--accent-sky`, `--bg-accent`
- All styles in scoped `<style>` blocks inside `.astro` files — no separate CSS files
- Follow existing page patterns: `BaseLayout`, `getCollection`, `getUrl`, `<Image>` from `astro:assets`
- Verify with `astro build` after each task — the project uses static output (no SSR)
- Dev server management: use `astro dev --background` to start, `astro dev stop` to stop, `astro dev status` to check
- Commit after every task using English commit messages

---

### Task 1: Content Infrastructure

**Files:**
- Create dir: `src/content/galleria/` (with `.gitkeep`)
- Create dir: `src/assets/images/uploads/gallery/` (with `.gitkeep`)
- Modify: `src/content.config.ts`
- Modify: `public/admin/config.yml`

**Interfaces:**
- Produces: `galleriaCollection` exported as `'galleria'` from `content.config.ts`
  - Each entry has: `data.title: string`, `data.date: Date`, `data.tags?: string[]`, `data.coverImage: ImageMetadata`, `data.images: Array<{ image: ImageMetadata, caption?: string }>`
- Produces: Sveltia CMS `galleria` collection at `src/content/galleria/` with `media_folder: /src/assets/images/uploads/gallery`

- [ ] **Step 1: Create the content and image directories**

  ```powershell
  New-Item -ItemType Directory -Force "D:\git\kolumbia17\src\content\galleria"
  New-Item -ItemType File -Force "D:\git\kolumbia17\src\content\galleria\.gitkeep"
  New-Item -ItemType Directory -Force "D:\git\kolumbia17\src\assets\images\uploads\gallery"
  New-Item -ItemType File -Force "D:\git\kolumbia17\src\assets\images\uploads\gallery\.gitkeep"
  ```

- [ ] **Step 2: Add the `galleriaCollection` to `src/content.config.ts`**

  Find the end of the existing collections (after `dokumentumokCollection` and `pagesCollection`), and add before the `export const collections` block:

  ```typescript
  const galleriaCollection = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/galleria" }),
    schema: ({ image }) => z.object({
      title: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).optional(),
      coverImage: image(),
      images: z.array(z.object({
        image: image(),
        caption: z.string().optional(),
      })),
    }),
  });
  ```

  Then update the `export const collections` block to add `'galleria': galleriaCollection`:

  ```typescript
  export const collections = {
    'hirek': hirekCollection,
    'eredmenyek': eredmenyekCollection,
    'versenykiiras': versenykiirasCollection,
    'dokumentumok': dokumentumokCollection,
    'pages': pagesCollection,
    'galleria': galleriaCollection,
  };
  ```

- [ ] **Step 3: Add the `galleria` collection to `public/admin/config.yml`**

  Append at the end of the `collections:` list (after the `pages` collection block):

  ```yaml
    - name: "galleria"
      label: "Galéria"
      folder: "src/content/galleria"
      media_folder: "/src/assets/images/uploads/gallery"
      public_folder: "/src/assets/images/uploads/gallery"
      create: true
      slug: "{{year}}-{{month}}-{{slug}}"
      fields:
        - { label: "Album neve", name: "title", widget: "string" }
        - { label: "Dátum", name: "date", widget: "datetime" }
        - label: "Címkék"
          name: "tags"
          widget: "list"
          required: false
          hint: "Szabadon megadható címkék (pl. Verseny, Edzőtábor, Közösségi)"
        - label: "Borítókép"
          name: "coverImage"
          widget: "image"
          media_folder: "/src/assets/images/uploads/gallery"
          public_folder: "/src/assets/images/uploads/gallery"
        - label: "Fényképek"
          name: "images"
          widget: "list"
          fields:
            - label: "Kép"
              name: "image"
              widget: "image"
              media_folder: "/src/assets/images/uploads/gallery"
              public_folder: "/src/assets/images/uploads/gallery"
            - { label: "Felirat (opcionális)", name: "caption", widget: "string", required: false }
        - { label: "Leírás", name: "body", widget: "markdown", required: false }
  ```

- [ ] **Step 4: Verify the build passes**

  ```powershell
  cd D:\git\kolumbia17
  npm run build
  ```

  Expected: build completes without errors. The empty `galleria` collection produces zero pages — that's fine.

- [ ] **Step 5: Commit**

  ```powershell
  git add src/content.config.ts public/admin/config.yml src/content/galleria/.gitkeep src/assets/images/uploads/gallery/.gitkeep
  git commit -m "feat: add galleria content collection and CMS config"
  ```

---

### Task 2: Navigation — Add "Galéria" Menu Item

**Files:**
- Modify: `src/components/Header.astro:10-17`

**Interfaces:**
- Consumes: `getUrl` utility from `../utils/url` (already imported)
- Produces: New nav link `{ href: getUrl("/galleria/"), text: "Galéria" }` visible in desktop and mobile menus

- [ ] **Step 1: Add the nav item to `navItems` in `src/components/Header.astro`**

  Find the `navItems` array (lines 10–17). Replace the array so "Galéria" appears between "Dokumentumok" and "Rólunk":

  ```typescript
  const navItems = [
    { href: getUrl("/"), text: "Főoldal" },
    { href: getUrl("/hirek/"), text: "Hírek" },
    { href: getUrl("/eredmenyek/"), text: "Eredmények" },
    { href: getUrl("/versenykiiras/"), text: "Versenykiírás" },
    { href: getUrl("/dokumentumok/"), text: "Dokumentumok" },
    { href: getUrl("/galleria/"), text: "Galéria" },
    { href: getUrl("/rolunk/"), text: "Rólunk" },
  ];
  ```

- [ ] **Step 2: Start dev server and verify nav item appears**

  ```powershell
  cd D:\git\kolumbia17
  astro dev --background
  ```

  Open `http://localhost:4321` in browser. Verify "Galéria" link appears in the nav between "Dokumentumok" and "Rólunk". Check mobile menu (resize viewport to <768px). Clicking "Galéria" will show a 404 — that's expected (page doesn't exist yet).

- [ ] **Step 3: Stop dev server**

  ```powershell
  astro dev stop
  ```

- [ ] **Step 4: Commit**

  ```powershell
  git add src/components/Header.astro
  git commit -m "feat: add Galeria nav link to header"
  ```

---

### Task 3: Album Listing Page (`/galleria/`)

**Files:**
- Create: `src/pages/galleria/index.astro`

**Interfaces:**
- Consumes: `getCollection('galleria')` → entries with `data.title`, `data.date`, `data.tags`, `data.coverImage`, `data.images` (from Task 1)
- Consumes: `getUrl` from `../../utils/url`
- Consumes: `<Image>` from `astro:assets`
- Consumes: `BaseLayout` from `../../layouts/BaseLayout.astro`
- Produces: Static page at `/galleria/` listing all albums as cards with year/tag/search filtering

- [ ] **Step 1: Create `src/pages/galleria/index.astro` with the full content**

  ```astro
  ---
  import BaseLayout from '../../layouts/BaseLayout.astro';
  import { getCollection } from 'astro:content';
  import { getUrl } from '../../utils/url';
  import { Image } from 'astro:assets';

  const allAlbums = await getCollection('galleria');
  const sortedAlbums = allAlbums.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  // Collect unique years from all albums
  const allYears = [...new Set(
    sortedAlbums.map(a => a.data.date.getFullYear())
  )].sort((a, b) => b - a);

  // Collect unique tags from all albums, sorted alphabetically
  const allTags = [...new Set(
    sortedAlbums.flatMap(a => a.data.tags ?? [])
  )].sort((a, b) => a.localeCompare(b, 'hu'));
  ---

  <BaseLayout title="Galéria">
    <div class="container page-content">
      <h1 class="page-title">Galéria</h1>

      <div class="filter-bar">
        <div class="filter-group">
          <button class="filter-btn active" data-filter-year="all" id="year-all">Mind</button>
          {allYears.map(year => (
            <button class="filter-btn" data-filter-year={year} id={`year-${year}`}>{year}</button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div class="filter-group">
            {allTags.map(tag => (
              <button class="filter-btn tag-btn" data-filter-tag={tag} id={`tag-${tag.replace(/\s+/g, '-')}`}>{tag}</button>
            ))}
          </div>
        )}

        <div class="search-wrap">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="search"
            id="gallery-search"
            class="search-input"
            placeholder="Keresés albumok között..."
            aria-label="Keresés albumok között"
          />
        </div>
      </div>

      <div class="album-grid" id="album-grid">
        {sortedAlbums.length > 0 ? (
          sortedAlbums.map((album) => (
            <a
              href={getUrl(`/galleria/${album.id}`)}
              class="album-card"
              data-year={album.data.date.getFullYear()}
              data-tags={JSON.stringify(album.data.tags ?? [])}
              data-title={album.data.title.toLowerCase()}
            >
              <div class="album-cover">
                <Image
                  src={album.data.coverImage}
                  alt={album.data.title}
                  class="album-cover-img"
                  loading="lazy"
                  width={400}
                  height={267}
                />
                <div class="album-photo-count">{album.data.images.length} fénykép</div>
              </div>
              <div class="album-info">
                <time class="album-date">{album.data.date.toLocaleDateString('hu-HU')}</time>
                <h2 class="album-title">{album.data.title}</h2>
                {album.data.tags && album.data.tags.length > 0 && (
                  <div class="album-tags">
                    {album.data.tags.map(tag => <span class="tag">{tag}</span>)}
                  </div>
                )}
              </div>
            </a>
          ))
        ) : (
          <p class="no-content">Jelenleg nincsenek fotóalbumok.</p>
        )}
      </div>

      <p class="no-results" id="no-results" style="display:none;">Nincs találat a megadott szűrőkkel.</p>
    </div>
  </BaseLayout>

  <style>
    .page-content {
      padding: 3rem 1.5rem 5rem;
    }

    .page-title {
      margin-bottom: 2rem;
      font-size: 2.5rem;
    }

    /* Filter bar */
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2.5rem;
      align-items: center;
    }

    .filter-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .filter-btn {
      background-color: var(--bg-accent);
      color: var(--text-secondary);
      border: 1px solid var(--border-light);
      border-radius: 999px;
      padding: 0.35rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      font-family: inherit;
    }

    .filter-btn:hover,
    .filter-btn.active {
      background-color: var(--accent-sky);
      color: #fff;
      border-color: var(--accent-sky);
    }

    /* Search */
    .search-wrap {
      position: relative;
      flex: 1;
      min-width: 200px;
      max-width: 320px;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.4rem 0.75rem 0.4rem 2.25rem;
      border: 1px solid var(--border-light);
      border-radius: 999px;
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 0.875rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .search-input:focus {
      border-color: var(--accent-sky);
    }

    /* Album grid */
    .album-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    /* Album card */
    .album-card {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-light);
      border-radius: 12px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: block;
    }

    .album-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    }

    .album-card.hidden {
      display: none;
    }

    .album-cover {
      position: relative;
      overflow: hidden;
    }

    .album-cover-img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      display: block;
      transition: transform 0.3s ease;
    }

    .album-card:hover .album-cover-img {
      transform: scale(1.04);
    }

    .album-photo-count {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      backdrop-filter: blur(4px);
    }

    .album-info {
      padding: 1.25rem 1.5rem 1.5rem;
    }

    .album-date {
      display: block;
      font-size: 0.875rem;
      color: var(--accent-sky);
      font-weight: 600;
      margin-bottom: 0.35rem;
    }

    .album-title {
      font-size: 1.2rem;
      margin: 0 0 0.75rem;
      color: var(--text-primary);
    }

    .album-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .tag {
      background-color: var(--bg-accent);
      color: var(--accent-sky);
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
    }

    .no-content,
    .no-results {
      color: var(--text-secondary);
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem 0;
    }
  </style>

  <script>
    // Client-side filtering for album grid
    const grid = document.getElementById('album-grid');
    const noResults = document.getElementById('no-results');
    const cards = Array.from(grid?.querySelectorAll('.album-card') ?? []) as HTMLElement[];

    let activeYear = 'all';
    let activeTags: string[] = [];
    let searchQuery = '';

    function applyFilters() {
      let visible = 0;
      cards.forEach(card => {
        const cardYear = card.dataset.year ?? '';
        const cardTags: string[] = JSON.parse(card.dataset.tags ?? '[]');
        const cardTitle = card.dataset.title ?? '';

        const yearMatch = activeYear === 'all' || cardYear === activeYear;
        const tagMatch = activeTags.length === 0 || activeTags.every(t => cardTags.includes(t));
        const searchMatch = searchQuery === '' || cardTitle.includes(searchQuery) || cardTags.some(t => t.toLowerCase().includes(searchQuery));

        if (yearMatch && tagMatch && searchMatch) {
          card.classList.remove('hidden');
          visible++;
        } else {
          card.classList.add('hidden');
        }
      });

      if (noResults) {
        noResults.style.display = visible === 0 ? 'block' : 'none';
      }
    }

    // Year filter buttons
    document.querySelectorAll<HTMLButtonElement>('[data-filter-year]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-year]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeYear = btn.dataset.filterYear ?? 'all';
        applyFilters();
      });
    });

    // Tag filter buttons (multi-select toggle)
    document.querySelectorAll<HTMLButtonElement>('[data-filter-tag]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.filterTag ?? '';
        if (activeTags.includes(tag)) {
          activeTags = activeTags.filter(t => t !== tag);
          btn.classList.remove('active');
        } else {
          activeTags.push(tag);
          btn.classList.add('active');
        }
        applyFilters();
      });
    });

    // Search input (debounced 200ms)
    let searchTimer: ReturnType<typeof setTimeout>;
    document.getElementById('gallery-search')?.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchQuery = (e.target as HTMLInputElement).value.toLowerCase().trim();
        applyFilters();
      }, 200);
    });
  </script>
  ```

- [ ] **Step 2: Create a temporary dummy album for smoke testing**

  Create `src/content/galleria/2024-06-test-album.md` with this content (use a real image from `src/assets/images/uploads/` or any existing image path the project has):

  ```markdown
  ---
  title: "Teszt Album"
  date: 2024-06-15
  tags:
    - Verseny
    - Teszt
  coverImage: ../../assets/images/uploads/gallery/.gitkeep
  images:
    - image: ../../assets/images/uploads/gallery/.gitkeep
      caption: "Teszt kép"
  ---
  ```

  > **Note:** `.gitkeep` is not a real image — this step is only to verify the routing and page render. If Astro throws an image error, comment out `coverImage` and `images` temporarily and add dummy text to the body instead. Remove this test file after Task 4 is complete.

- [ ] **Step 3: Start dev server and verify listing page**

  ```powershell
  astro dev --background
  ```

  Open `http://localhost:4321/galleria/`. Verify:
  - Page loads with title "Galéria"
  - Filter bar shows "Mind" year button
  - If dummy album works: album card appears with title, date, tags
  - No JS console errors

- [ ] **Step 4: Stop dev server and verify build**

  ```powershell
  astro dev stop
  npm run build
  ```

  Expected: build succeeds, `/galleria/index.html` generated in `dist/`.

- [ ] **Step 5: Commit**

  ```powershell
  git add src/pages/galleria/index.astro
  git commit -m "feat: add galleria album listing page with filtering"
  ```

---

### Task 4: Album Detail Page (`/galleria/[...slug]`)

**Files:**
- Create: `src/pages/galleria/[...slug].astro`

**Interfaces:**
- Consumes: `getCollection('galleria')` for `getStaticPaths()`
- Consumes: `render(entry)` for optional body markdown
- Consumes: `entry.data.title: string`, `entry.data.date: Date`, `entry.data.tags?: string[]`, `entry.data.images: Array<{ image: ImageMetadata, caption?: string }>`
- Consumes: `getUrl` from `../../utils/url`
- Consumes: `<Image>` from `astro:assets`
- Consumes: `BaseLayout` from `../../layouts/BaseLayout.astro`
- Produces: Static page at `/galleria/{album-slug}` with masonry photo grid and GLightbox

- [ ] **Step 1: Create `src/pages/galleria/[...slug].astro` with the full content**

  ```astro
  ---
  import BaseLayout from '../../layouts/BaseLayout.astro';
  import { getCollection, render } from 'astro:content';
  import { getUrl } from '../../utils/url';
  import { Image, getImage } from 'astro:assets';

  export async function getStaticPaths() {
    const albums = await getCollection('galleria');
    return albums.map(entry => ({
      params: { slug: entry.id },
      props: { entry },
    }));
  }

  const { entry } = Astro.props;
  const { Content } = await render(entry);

  // Pre-process full-size image URLs for lightbox
  const processedImages = await Promise.all(
    entry.data.images.map(async (item) => {
      const optimized = await getImage({ src: item.image, width: 1920, format: 'webp' });
      return {
        src: item.image,
        fullSrc: optimized.src,
        caption: item.caption,
      };
    })
  );
  ---

  <BaseLayout title={entry.data.title}>
    <link slot="head" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css" />

    <div class="container page-content">
      <div class="album-back">
        <a href={getUrl('/galleria/')} class="back-link">&larr; Vissza a galériához</a>
      </div>

      <header class="album-header">
        <time class="album-date">{entry.data.date.toLocaleDateString('hu-HU')}</time>
        <h1 class="album-title">{entry.data.title}</h1>

        {entry.data.tags && entry.data.tags.length > 0 && (
          <div class="album-tags">
            {entry.data.tags.map(tag => <span class="tag">{tag}</span>)}
          </div>
        )}

        <div class="album-meta">
          <span class="photo-count">{entry.data.images.length} fénykép</span>
        </div>

        {entry.body && (
          <div class="album-description prose">
            <Content />
          </div>
        )}
      </header>

      {processedImages.length > 0 ? (
        <div class="masonry-grid">
          {processedImages.map((item, i) => (
            <div class="masonry-item">
              <a
                href={item.fullSrc}
                class="glightbox"
                data-gallery="album"
                data-title={item.caption ?? ''}
              >
                <Image
                  src={item.src}
                  alt={item.caption ?? `${entry.data.title} – ${i + 1}. kép`}
                  class="masonry-img"
                  loading={i < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                  width={800}
                />
                {item.caption && (
                  <p class="img-caption">{item.caption}</p>
                )}
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p class="no-content">Az album jelenleg üres.</p>
      )}
    </div>

    <script>
      import GLightbox from 'https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.esm.js';
      GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        autoplayVideos: false,
      });
    </script>
  </BaseLayout>

  <style>
    .page-content {
      padding: 3rem 1.5rem 5rem;
    }

    .album-back {
      margin-bottom: 2rem;
    }

    .back-link {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.95rem;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: var(--accent-sky);
    }

    .album-header {
      margin-bottom: 3rem;
    }

    .album-date {
      display: block;
      color: var(--accent-sky);
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .album-title {
      font-size: 2.5rem;
      margin: 0 0 1rem;
    }

    .album-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 0.75rem;
    }

    .tag {
      background-color: var(--bg-accent);
      color: var(--accent-sky);
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
    }

    .album-meta {
      margin-bottom: 1.5rem;
    }

    .photo-count {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .album-description {
      color: var(--text-secondary);
      font-size: 1rem;
      line-height: 1.7;
      max-width: 700px;
    }

    /* CSS Masonry */
    .masonry-grid {
      columns: 4;
      column-gap: 1rem;
    }

    @media (max-width: 1200px) {
      .masonry-grid { columns: 3; }
    }

    @media (max-width: 768px) {
      .masonry-grid { columns: 2; }
    }

    @media (max-width: 576px) {
      .masonry-grid { columns: 1; }
    }

    .masonry-item {
      break-inside: avoid;
      margin-bottom: 1rem;
    }

    .masonry-item a {
      display: block;
      text-decoration: none;
      border-radius: 8px;
      overflow: hidden;
      background-color: var(--bg-accent);
    }

    .masonry-img {
      width: 100%;
      height: auto;
      display: block;
      transition: transform 0.3s ease, opacity 0.2s ease;
    }

    .masonry-item a:hover .masonry-img {
      transform: scale(1.03);
      opacity: 0.9;
    }

    .img-caption {
      font-size: 0.8rem;
      color: var(--text-secondary);
      padding: 0.4rem 0.6rem;
      margin: 0;
      background-color: var(--bg-secondary);
    }

    .no-content {
      color: var(--text-secondary);
      text-align: center;
      padding: 3rem 0;
    }
  </style>
  ```

  > **Note on GLightbox import:** The ESM CDN import in `<script>` may not work with Astro's build pipeline. If the build fails with an import error, replace the script block with the UMD/global approach:
  > ```astro
  > <script is:inline src="https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js"></script>
  > <script is:inline>
  >   document.addEventListener('DOMContentLoaded', () => {
  >     GLightbox({ selector: '.glightbox', touchNavigation: true, loop: true, autoplayVideos: false });
  >   });
  > </script>
  > ```
  > Also remove the `<link slot="head" ...>` for GLightbox CSS and instead add it directly to BaseLayout or inline in the script if `slot="head"` is not supported — check `src/layouts/BaseLayout.astro` for the `<slot name="head" />` presence first.

- [ ] **Step 2: Check if `BaseLayout.astro` supports a named `head` slot**

  Open `src/layouts/BaseLayout.astro` and look for `<slot name="head" />` inside the `<head>` tag. If it does **not** exist, do one of:
  - Add `<slot name="head" />` just before `</head>` in `BaseLayout.astro`
  - OR remove the `<link slot="head" ...>` line from the detail page and instead add GLightbox CSS inline in the `<style>` block using `@import`

- [ ] **Step 3: Start dev server and verify album detail page**

  ```powershell
  astro dev --background
  ```

  Navigate to `http://localhost:4321/galleria/` and click the test album card. Verify:
  - Album detail page loads with title, date, tags
  - Masonry grid renders (even with placeholder image)
  - "Vissza a galériához" link works
  - No console errors

- [ ] **Step 4: Stop dev server, build, and verify**

  ```powershell
  astro dev stop
  npm run build
  ```

  Expected: build succeeds. `dist/galleria/` contains `index.html` and the test album's directory with `index.html`.

- [ ] **Step 5: Remove the temporary test album**

  ```powershell
  Remove-Item "D:\git\kolumbia17\src\content\galleria\2024-06-test-album.md"
  ```

  Run build again to confirm it still passes with empty collection:

  ```powershell
  npm run build
  ```

- [ ] **Step 6: Commit**

  ```powershell
  git add src/pages/galleria/
  # If BaseLayout.astro was modified for the head slot:
  git add src/layouts/BaseLayout.astro
  git commit -m "feat: add galleria album detail page with masonry grid and GLightbox"
  ```

---

### Task 5: Final Smoke Test

**Files:** None (read-only verification)

**Interfaces:**
- Consumes: all changes from Tasks 1–4
- Produces: confidence that everything integrates cleanly

- [ ] **Step 1: Run a full clean build**

  ```powershell
  cd D:\git\kolumbia17
  npm run build
  ```

  Expected: zero errors, zero warnings about missing types.

- [ ] **Step 2: Start dev server and do a manual walkthrough**

  ```powershell
  astro dev --background
  ```

  Check the following in the browser at `http://localhost:4321`:

  | Check | Expected |
  |-------|----------|
  | Header nav | "Galéria" link visible between "Dokumentumok" and "Rólunk" |
  | `/galleria/` | Page loads, shows "Jelenleg nincsenek fotóalbumok." (empty state) |
  | Year filter "Mind" | Active/highlighted by default |
  | Search input | Renders and accepts input |
  | CMS at `/admin/` | "Galéria" collection appears in sidebar |

- [ ] **Step 3: Stop dev server**

  ```powershell
  astro dev stop
  ```

- [ ] **Step 4: Final commit**

  If any minor fixes were made during smoke testing that weren't committed earlier:

  ```powershell
  git add -A
  git commit -m "fix: post-integration smoke test fixes for galleria"
  ```

  If nothing changed, skip this step.

---

## Self-Review Checklist

- [x] **Spec coverage:** All spec requirements covered:
  - ✅ `galleria` content collection with `title`, `date`, `tags`, `coverImage`, `images`, optional `body`
  - ✅ CMS config with `media_folder: /src/assets/images/uploads/gallery`
  - ✅ Header nav item "Galéria" between "Dokumentumok" and "Rólunk"
  - ✅ Album listing at `/galleria/` with year buttons, tag buttons, search input
  - ✅ Client-side filtering: year (single-select), tags (multi-select toggle), search (debounced 200ms)
  - ✅ Album cards: cover image, title, date, tag badges, photo count overlay, hover effect
  - ✅ Empty state: "Jelenleg nincsenek fotóalbumok."
  - ✅ Album detail: back link, h1 title, date, tags, photo count, optional description
  - ✅ Masonry grid: CSS `columns`, 4→3→2→1 breakpoints
  - ✅ GLightbox: CDN, `touchNavigation: true`, `loop: true`, captions from `data-title`
  - ✅ Lazy loading (eager for first 4 images)
  - ✅ Error states: no albums, no images in album

- [x] **Placeholder scan:** No TBD, TODO, or vague steps found.

- [x] **Type consistency:**
  - `entry.data.images` → `Array<{ image: ImageMetadata, caption?: string }>` — consistent between schema (Task 1) and usage (Task 4)
  - `getUrl('/galleria/')` — consistent across Header.astro (Task 2), index.astro (Task 3), detail page (Task 4)
  - `getCollection('galleria')` — matches `'galleria': galleriaCollection` export key (Task 1)
