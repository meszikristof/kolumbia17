# Galéria Feature — Design Specification

## Goal

Add a "Galéria" (Gallery) section to the Kolumbia 17 website where the admin can upload photos organized into photo albums via the existing Sveltia CMS. Visitors can browse albums, filter by year/tag, search by title/tags, and view photos in a lightbox.

## Architecture Overview

The gallery follows the same content collection pattern used by `hirek`, `eredmenyek`, etc. — markdown files with frontmatter managed through Sveltia CMS, stored in the git repo. Two new Astro pages provide the frontend: an album listing page with client-side filtering, and an album detail page with masonry layout and GLightbox integration.

## Data Model

### Content Collection: `galleria`

**Location:** `src/content/galleria/*.md`

**Frontmatter schema:**

| Field        | Type                     | Required | Description                                    |
|-------------|--------------------------|----------|------------------------------------------------|
| `title`     | `string`                 | ✅       | Album neve                                     |
| `date`      | `date` (coerce)          | ✅       | Album dátuma                                   |
| `tags`      | `string[]`               | ❌       | Szabadon írható címkék (pl. "Verseny", "Edzőtábor", "Közösségi") |
| `coverImage`| `image()`                | ✅       | Borítókép az album kártyáján                   |
| `images`    | array of `{ image: image(), caption?: string }` | ✅ | A fényképek listája, opcionális felirattal |
| `body`      | markdown                 | ❌       | Album leírás (opcionális)                      |

### CMS Media Folder

Images uploaded through the gallery CMS collection are stored in:
- **Media folder:** `src/assets/images/uploads/gallery`
- **Public folder:** `/src/assets/images/uploads/gallery`

This keeps gallery images separated from other uploads.

## Content Configuration

### `src/content.config.ts` — new collection

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

Register in `collections` export as `'galleria': galleriaCollection`.

## CMS Configuration

### `public/admin/config.yml` — new collection

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

## Navigation

### `src/components/Header.astro`

Add a new nav item between "Dokumentumok" and "Rólunk":

```typescript
const navItems = [
  { href: getUrl("/"), text: "Főoldal" },
  { href: getUrl("/hirek/"), text: "Hírek" },
  { href: getUrl("/eredmenyek/"), text: "Eredmények" },
  { href: getUrl("/versenykiiras/"), text: "Versenykiírás" },
  { href: getUrl("/dokumentumok/"), text: "Dokumentumok" },
  { href: getUrl("/galleria/"), text: "Galéria" },       // ← NEW
  { href: getUrl("/rolunk/"), text: "Rólunk" },
];
```

## Frontend Pages

### Page 1: Album Listing — `src/pages/galleria/index.astro`

**URL:** `/galleria/`

**Layout:** `BaseLayout` with title "Galéria"

**Sections:**

1. **Page header:** `<h1>Galéria</h1>` centered

2. **Filter bar** (sticky below header, or inline):
   - **Year buttons:** Auto-generated from album dates. "Mind" button to show all. Active button highlighted with `--accent-sky`.
   - **Tag buttons:** Collected from all albums' `tags` arrays, deduplicated, sorted alphabetically. Same toggle behavior as years.
   - **Search input:** Text input with magnifying glass icon. Filters albums client-side by title and tags on `input` event (debounced 200ms).

3. **Album grid:** CSS Grid, `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`, gap `2rem`.

4. **Album card** (per album):
   - Cover image (Astro `<Image>`, `loading="lazy"`, aspect ratio ~3:2, `object-fit: cover`)
   - Title overlay or below-image text
   - Date (formatted `hu-HU`)
   - Tag badges (small pill-style)
   - Hover: `translateY(-4px)` + box-shadow (matching existing `.news-card` pattern)
   - Link to `/galleria/{album.id}`

5. **Empty state:** "Nincs találat a megadott szűrőkkel." message when filters yield no results

**Client-side JS:**
- Filter logic: Each album card has `data-year`, `data-tags`, `data-title` attributes
- On filter change: hide/show cards with CSS class toggle (`display: none`)
- No framework needed — vanilla JS event listeners

### Page 2: Album Detail — `src/pages/galleria/[...slug].astro`

**URL:** `/galleria/{slug}`

**Layout:** `BaseLayout` with title = album title

**Sections:**

1. **Back navigation:** `← Vissza a galériához` link to `/galleria/`

2. **Album header:**
   - Title (`<h1>`)
   - Date
   - Tag badges
   - Optional description (rendered from markdown body)

3. **Photo grid — Masonry layout:**
   - CSS-only masonry using `columns` property
   - Responsive breakpoints:
     - Mobile (≤576px): 1 column
     - Tablet (577–768px): 2 columns
     - Desktop (769–1200px): 3 columns
     - Wide (>1200px): 4 columns
   - Each image wrapped in `<a>` linking to the full-size image
   - `<Image>` component with `loading="lazy"`, `decoding="async"`
   - Caption displayed below each image (if provided)
   - Column gap: `1rem`, image margin-bottom: `1rem`

4. **Lightbox — GLightbox:**
   - Loaded from CDN: `https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js`
   - CSS: `https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css`
   - Initialized on all gallery links with class `.glightbox`
   - Config: `{ touchNavigation: true, loop: true, autoplayVideos: false }`
   - Captions displayed from `data-title` attribute on each link

**Photo count:** Display total count, e.g. "12 fénykép"

## Styling

All styles follow existing project conventions:
- CSS variables: `--bg-secondary`, `--border-light`, `--text-primary`, `--text-secondary`, `--accent-sky`, `--bg-accent`
- Scoped `<style>` blocks in each `.astro` file
- Border radius: `12px` for cards (matching `.news-card`)
- Transitions: `0.2s ease` for hover effects

### Filter bar specific styles:
- Button pills: `border-radius: 999px`, small font, `--bg-accent` background, `--accent-sky` when active
- Search input: Same border-radius, subtle border, focus ring with `--accent-sky`

### Tag badges:
- Small pills: `font-size: 0.75rem`, `padding: 0.25rem 0.75rem`, `border-radius: 999px`
- Background: `var(--bg-accent)`, color: `var(--accent-sky)`

## File Structure Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/content.config.ts` | Modify | Add `galleriaCollection` |
| `public/admin/config.yml` | Modify | Add `galleria` CMS collection |
| `src/components/Header.astro` | Modify | Add "Galéria" nav item |
| `src/pages/galleria/index.astro` | Create | Album listing page |
| `src/pages/galleria/[...slug].astro` | Create | Album detail page |
| `src/content/galleria/` | Create (dir) | Content directory for album .md files |
| `src/assets/images/uploads/gallery/` | Create (dir) | Gallery image uploads |

## Error Handling

- **No albums:** "Jelenleg nincsenek fotóalbumok." centered message (matching `.no-content` pattern from index page)
- **Album not found (404):** Astro's default 404 handling
- **No images in album:** "Az album jelenleg üres." message
- **Image load failure:** CSS placeholder background (`var(--bg-accent)`) with alt text visible
- **GLightbox CDN failure:** Gallery still works, images are normal `<a>` links to full-size — graceful degradation

## Performance

- All images processed through Astro's `<Image>` component (auto-resized, WebP, srcset)
- `loading="lazy"` on all images except above-the-fold cover images
- GLightbox CSS/JS loaded only on album detail page (not listing page)
- No JS framework dependencies — vanilla JS for filtering
- Client-side filtering avoids page reloads

## Scope Boundaries (YAGNI)

**In scope:**
- Album CRUD through Sveltia CMS
- Year + tag filtering + text search on listing page
- Masonry grid + GLightbox on detail page
- Responsive design (mobile/tablet/desktop)

**Out of scope (not building):**
- Slideshow/carousel mode
- Image download buttons
- Social sharing per album
- Comments/likes
- Image drag-and-drop reordering in CMS (Sveltia handles list reorder)
- Pagination (not needed until album count grows significantly)
- Server-side search
