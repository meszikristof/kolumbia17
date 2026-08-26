# Választott tisztségviselők és kapcsolat adatok bővítése

## Összefoglaló
A Rólunk (`/rolunk`) oldalon található kapcsolat információk kibővítése a választott tisztségviselők (Elnökség, Ellenőrző Bizottság, Versenybizottság, Fegyelmi Bizottság) elérhetőségeivel. Az adatok strukturált formában kerülnek tárolásra a tartalomkezelőben (Astro Content Collections és Sveltia CMS), valamint az oldalsávban (sidebar) esztétikus, kattintható telefon- és email linkekkel ellátott csoportosított listaként jelennek meg.

---

## 1. Adatmodell és séma

### 1.1 `src/content.config.ts`
A `pagesCollection` sémája kiegészül egy `officials` mezővel:
```ts
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
).optional()
```

### 1.2 `public/admin/config.yml`
A `pages` kollekció `rolunk` fájl konfigurációja kibővül az `officials` lista mezőivel, hogy a Sveltia CMS adminisztrációs felületen keresztül is szerkeszthető legyen.

---

## 2. Tartalom (`src/content/pages/rolunk.md`)

A frontmatterbe felvitelre kerülnek a következő tisztségviselői csoportok és tagok:

1. **Elnökségi tagok**
   - Elnök: Mészáros János (`+36 70 949-0646`, `m.janoskol@gmail.com`)
   - Alelnök: Mihalik András (`+36 20 573-9808`, `mihalik1979andras@gmail.com`)
   - VB. Elnök: Hortai András (`+36 70 321-3177`, `hortaimeister@gmail.com`)
   - Pénztáros: Paulik Géza (`+36 20 540-8886`)
   - Elnökségi tag: Takács Lajos (`+36 20 261-6093`)

2. **Ellenőrző Bizottság**
   - Elnök: Kovács Ferenc (`+36 30 961-0697`)
   - Tag: Kondics Csaba (`+36 30 289-4869`)
   - Tag: Szántai István (`+36 30 224-0409`)
   - Póttag: Fábián István

3. **Versenybizottság**
   - Elnök: Hortai András (`+36 70 321-3177`)
   - Tag: Budai Géza (`+36 20 594-0509`)
   - Tag: Kemenczei János (`+36 30 371-8163`)
   - Póttag: Kulcsár László

4. **Fegyelmi Bizottság**
   - Elnök: Ifj. Szomora Attila (`+36 70 242-3504`)
   - Tag: Fábus Gábor (`+36 30 725-2661`)
   - Tag: Paulovicz Szabolcs (`+36 70 322-5067`)
   - Póttag: Varga János

---

## 3. Megjelenítés (`src/pages/rolunk.astro`)

- **Oldalsáv felépítés**:
  - Általános klub elérhetőség blokk (Email, Telefon, Cím).
  - "Választott tisztségviselők" fejléc és szekciók.
  - Bizottságonkénti csoportosítás tiszta vizuális hierarchiával.
  - Minden tagnál:
    - Tisztség megnevezése (címke/badge vagy alcím).
    - Név kiemelése.
    - Kattintható `tel:` és `mailto:` linkek beépített ikonokkal.
- **Stílus és reszponzivitás**:
  - Harmonizál a meglévő témaszínekkel (`var(--bg-secondary)`, `var(--border-light)`, `var(--accent-sky)`).
  - Mobilon automatikusan a tartalom alá törve, asztali gépen ragadós (sticky) oldalsávként működik.
