# Officials Contacts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the "Rólunk" (`/rolunk`) page contact details with structured elected officials (Elnökségi tagok, Ellenőrző Bizottság, Versenybizottság, Fegyelmi Bizottság) in the sidebar with interactive phone and email links.

**Architecture:** Add a structured `officials` schema to Astro Content Collections (`src/content.config.ts`) and Sveltia CMS config (`public/admin/config.yml`), populate data in `src/content/pages/rolunk.md`, and render grouped official cards in `src/pages/rolunk.astro` sidebar.

**Tech Stack:** Astro v5+, TypeScript, Zod, Sveltia CMS, Vanilla CSS.

## Global Constraints
- Never push to remote git repository (User rule: "Soha ne push-olj repoba").
- Commit messages must be in English (User rule: "Ha commit üzenetet kérek, azt mindig angolul írd").

---

### Task 1: Update Content Schema and CMS Configuration

**Files:**
- Modify: `src/content.config.ts:45-57`
- Modify: `public/admin/config.yml:73-82`

**Interfaces:**
- Consumes: None
- Produces: `officials` schema in `pagesCollection`

- [ ] **Step 1: Update `pagesCollection` schema in `src/content.config.ts`**

Add `officials` field to `pagesCollection`:
```ts
const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    logo: z.string().optional(),
    bgImage: z.string().optional(),
    bgVideo: z.string().optional(),
    hideHeroTitle: z.boolean().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    officials: z.array(
      z.object({
        groupName: z.string(),
        members: z.array(
          z.object({
            role: z.string(),
            name: z.string(),
            phone: z.string().optional(),
            email: z.string().optional(),
          })
        ),
      })
    ).optional(),
  }),
});
```

- [ ] **Step 2: Update Sveltia CMS config in `public/admin/config.yml`**

Add `officials` list widget to the `rolunk` file in `public/admin/config.yml`:
```yaml
      - label: "Rólunk & Kapcsolat"
        name: "rolunk"
        file: "src/content/pages/rolunk.md"
        fields:
          - { label: "Cím", name: "title", widget: "string" }
          - { label: "Tartalom", name: "body", widget: "markdown" }
          - { label: "Email", name: "email", widget: "string" }
          - { label: "Telefon", name: "phone", widget: "string", required: false }
          - { label: "Cím (lakcím)", name: "address", widget: "text", required: false }
          - label: "Választott tisztségviselők"
            name: "officials"
            widget: "list"
            required: false
            fields:
              - { label: "Csoport neve (pl. Elnökségi tagok)", name: "groupName", widget: "string" }
              - label: "Tagok"
                name: "members"
                widget: "list"
                fields:
                  - { label: "Tisztség (pl. Elnök, Tag, Póttag)", name: "role", widget: "string" }
                  - { label: "Név", name: "name", widget: "string" }
                  - { label: "Telefonszám", name: "phone", widget: "string", required: false }
                  - { label: "Email cím", name: "email", widget: "string", required: false }
```

- [ ] **Step 3: Commit schema & CMS configuration changes**

```bash
git add src/content.config.ts public/admin/config.yml
git commit -m "feat(cms): add officials schema to pages collection and CMS config"
```

---

### Task 2: Populate Officials Data in `src/content/pages/rolunk.md`

**Files:**
- Modify: `src/content/pages/rolunk.md`

**Interfaces:**
- Consumes: `officials` schema from Task 1
- Produces: Populated markdown frontmatter with all official groups and members

- [ ] **Step 1: Update frontmatter in `src/content/pages/rolunk.md`**

Replace content of `src/content/pages/rolunk.md` with:
```markdown
---
title: "Rólunk és Kapcsolat"
email: "m.janoskol@gmail.com"
phone: "+36 70 9490646"
address: "2225 Üllő, Gyömrői út 9."
officials:
  - groupName: "Elnökségi tagok"
    members:
      - role: "Elnök"
        name: "Mészáros János"
        phone: "+36 70 949-0646"
        email: "m.janoskol@gmail.com"
      - role: "Alelnök"
        name: "Mihalik András"
        phone: "+36 20 573-9808"
        email: "mihalik1979andras@gmail.com"
      - role: "VB. Elnök"
        name: "Hortai András"
        phone: "+36 70 321-3177"
        email: "hortaimeister@gmail.com"
      - role: "Pénztáros"
        name: "Paulik Géza"
        phone: "+36 20 540-8886"
      - role: "Elnökségi tag"
        name: "Takács Lajos"
        phone: "+36 20 261-6093"
  - groupName: "Ellenőrző Bizottság"
    members:
      - role: "Elnök"
        name: "Kovács Ferenc"
        phone: "+36 30 961-0697"
      - role: "Tag"
        name: "Kondics Csaba"
        phone: "+36 30 289-4869"
      - role: "Tag"
        name: "Szántai István"
        phone: "+36 30 224-0409"
      - role: "Póttag"
        name: "Fábián István"
  - groupName: "Versenybizottság"
    members:
      - role: "Elnök"
        name: "Hortai András"
        phone: "+36 70 321-3177"
      - role: "Tag"
        name: "Budai Géza"
        phone: "+36 20 594-0509"
      - role: "Tag"
        name: "Kemenczei János"
        phone: "+36 30 371-8163"
      - role: "Póttag"
        name: "Kulcsár László"
  - groupName: "Fegyelmi Bizottság"
    members:
      - role: "Elnök"
        name: "Ifj. Szomora Attila"
        phone: "+36 70 242-3504"
      - role: "Tag"
        name: "Fábus Gábor"
        phone: "+36 30 725-2661"
      - role: "Tag"
        name: "Paulovicz Szabolcs"
        phone: "+36 70 322-5067"
      - role: "Póttag"
        name: "Varga János"
---
A **Kolumbia Sport Klub Versenykerület** évtizedek óta fogja össze a galambversenyzés szerelmeseit. Célunk nem csak a versenyeztetés, hanem egy összetartó, szakmailag felkészült közösség építése is.

Várjuk minden érdeklődő jelentkezését! Lépj velünk kapcsolatba az alábbi elérhetőségeken.
```

- [ ] **Step 2: Commit data changes**

```bash
git add src/content/pages/rolunk.md
git commit -m "feat(content): add officials data to rolunk page"
```

---

### Task 3: Render Officials in Sidebar on `src/pages/rolunk.astro`

**Files:**
- Modify: `src/pages/rolunk.astro`

**Interfaces:**
- Consumes: `rolunkEntry.data.officials`
- Produces: Rendered sidebar with officials contact list and responsive styling

- [ ] **Step 1: Update `src/pages/rolunk.astro`**

Implement helper for phone link formatting (`tel:...` strips non-digit characters except `+`) and render the officials groups beneath the general contact information in `.about-sidebar`.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEntry, render } from 'astro:content';

const rolunkEntry = await getEntry('pages', 'rolunk');
const { Content } = rolunkEntry ? await render(rolunkEntry) : { Content: () => null };

const formatTelHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
---

<BaseLayout title={rolunkEntry?.data.title || "Rólunk"}>
  <div class="container page-content">
    <div class="about-grid">
      <article class="about-main">
        <h1 class="page-title">{rolunkEntry?.data.title || "Rólunk"}</h1>
        <div class="about-body prose">
          {rolunkEntry ? <Content /> : <p>Rólunk szöveg feltöltés alatt...</p>}
        </div>
      </article>
      
      <aside class="about-sidebar">
        <div class="contact-card">
          <h2>Kapcsolat</h2>
          <ul class="contact-list">
            {rolunkEntry?.data.email && (
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="contact-icon">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <a href={`mailto:${rolunkEntry.data.email}`}>{rolunkEntry.data.email}</a>
              </li>
            )}
            {rolunkEntry?.data.phone && (
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="contact-icon">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <a href={formatTelHref(rolunkEntry.data.phone)}>{rolunkEntry.data.phone}</a>
              </li>
            )}
            {rolunkEntry?.data.address && (
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="contact-icon">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{rolunkEntry.data.address}</span>
              </li>
            )}
          </ul>

          {rolunkEntry?.data.officials && rolunkEntry.data.officials.length > 0 && (
            <div class="officials-section">
              <h2 class="officials-heading">Választott tisztségviselők</h2>
              
              <div class="officials-groups">
                {rolunkEntry.data.officials.map((group) => (
                  <div class="official-group">
                    <h3 class="group-title">{group.groupName}</h3>
                    <ul class="members-list">
                      {group.members.map((member) => (
                        <li class="member-item">
                          <div class="member-header">
                            <span class="member-role">{member.role}</span>
                            <span class="member-name">{member.name}</span>
                          </div>
                          {(member.phone || member.email) && (
                            <div class="member-contacts">
                              {member.phone && (
                                <a href={formatTelHref(member.phone)} class="member-contact-link" title={`Hívás: ${member.phone}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                  </svg>
                                  <span>{member.phone}</span>
                                </a>
                              )}
                              {member.email && (
                                <a href={`mailto:${member.email}`} class="member-contact-link" title={`Email küldése: ${member.email}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                  </svg>
                                  <span>{member.email}</span>
                                </a>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  </div>
</BaseLayout>

<style>
  .page-content {
    padding: 3rem 1.5rem 5rem;
  }
  
  .about-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  @media (min-width: 900px) {
    .about-grid {
      grid-template-columns: 1fr 380px;
    }
  }
  
  .page-title {
    margin-bottom: 2rem;
    font-size: 2.5rem;
  }
  
  .about-body {
    font-size: 1.125rem;
    color: var(--text-primary);
    line-height: 1.7;
  }
  
  .about-body :global(p) {
    margin-bottom: 1.5rem;
  }
  
  .contact-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    padding: 1.5rem;
  }
  
  .contact-card h2 {
    margin-bottom: 1.25rem;
    font-size: 1.25rem;
    border-bottom: 1px solid var(--border-light);
    padding-bottom: 0.5rem;
    color: var(--text-primary);
  }
  
  .contact-list {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem 0;
  }
  
  .contact-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 0.875rem;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
  
  .contact-icon {
    color: var(--accent-sky);
    flex-shrink: 0;
    margin-top: 0.15rem;
  }
  
  .contact-list a {
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.15s ease;
  }
  
  .contact-list a:hover {
    color: var(--accent-sky);
  }

  .officials-section {
    margin-top: 1.5rem;
    border-top: 1px solid var(--border-light);
    padding-top: 1.5rem;
  }

  .officials-heading {
    font-size: 1.15rem;
    margin-bottom: 1.25rem;
    color: var(--text-primary);
    border-bottom: none !important;
    padding-bottom: 0 !important;
  }

  .officials-groups {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .official-group {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 1rem;
  }

  .group-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--accent-sky);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.75rem 0;
    padding-bottom: 0.4rem;
    border-bottom: 1px dashed var(--border-light);
  }

  .members-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .member-item {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .member-item:not(:last-child) {
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .member-header {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .member-role {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    background: rgba(56, 189, 248, 0.1);
    color: var(--accent-sky);
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    letter-spacing: 0.02em;
  }

  .member-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .member-contacts {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-left: 0.25rem;
  }

  .member-contact-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.15s ease;
    word-break: break-all;
  }

  .member-contact-link:hover {
    color: var(--accent-sky);
  }

  .member-contact-link svg {
    color: var(--accent-sky);
    flex-shrink: 0;
  }
</style>
```

- [ ] **Step 2: Commit UI changes in `rolunk.astro`**

```bash
git add src/pages/rolunk.astro
git commit -m "feat(pages): render structured officials list with contacts in rolunk sidebar"
```

---

### Task 4: Verification and Build Validation

**Files:**
- None (verification step)

- [ ] **Step 1: Execute `npm run build`**

Run build to ensure all types, schemas, and templates compile without error:
```bash
npm run build
```
Expected: Build passes with 0 errors.

- [ ] **Step 2: Verify live dev output**

Check the rendered `/rolunk` page locally.
