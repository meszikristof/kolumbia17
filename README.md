# Kolumbia Sport Klub — Weboldal

A **Kolumbia Sport Klub** (kolumbia17) hivatalos weboldalának forráskódja. A projekt modern, gyors statikus weboldalként (SSG) működik [Astro](https://astro.build/) keretrendszer segítségével. A tartalmakat a [Sveltia CMS](https://github.com/sveltia/sveltia-cms) kezeli, a hitelesítéshez egy dedikált Cloudflare Workers-alapú OAuth proxy fut.

**Élő oldal:** https://kolumbia17.vercel.app  
**Admin felület:** https://kolumbia17.vercel.app/admin  
**Tervezett domain:** https://www.kolumbia17.hu *(lásd: [TODO-DOMAIN.md](./TODO-DOMAIN.md))*

---

## 🚀 Technológiai Stack

| Technológia | Szerepe |
| :--- | :--- |
| [Astro](https://astro.build/) v7 | Statikus weboldal generátor (SSG), routing, Astro Content Collections |
| [Sveltia CMS](https://github.com/sveltia/sveltia-cms) | Git-alapú tartalomkezelő rendszer (CMS), a Decap CMS drop-in helyettesítője |
| [Vercel](https://vercel.com/) | Hosting és deployment |
| [Vercel Analytics](https://vercel.com/analytics) | Látogatottság mérés (`@vercel/analytics`) |
| [Cloudflare Workers](https://workers.cloudflare.com/) | OAuth 2.0 proxy a GitHub authentikációhoz (`sveltia-cms-auth`) |
| Google Fonts | Tipográfia: `Outfit` (headingek), `Inter` (szövegtörzs) |

---

## 📂 Projekt Felépítése

```text
/
├── public/
│   ├── admin/
│   │   └── config.yml       # Sveltia CMS konfigurációja
│   ├── images/
│   │   └── uploads/         # CMS-en keresztül feltöltött képek és fájlok
│   └── favicon.ico / .svg
├── src/
│   ├── components/
│   │   ├── Header.astro     # Navigációs fejléc (reszponzív, sticky, mobilmenü)
│   │   ├── Footer.astro     # Lábléc (copyright, jogi linkek)
│   │   ├── Hero.astro       # Hero szekció (háttérkép/videó támogatással)
│   │   └── ThemeToggle.astro # Sötét/világos téma váltó gomb
│   ├── content/             # Markdown formátumú tartalmak (Git-ben tárolva)
│   │   ├── hirek/
│   │   ├── eredmenyek/
│   │   ├── versenykiiras/
│   │   ├── dokumentumok/
│   │   └── pages/           # Globális oldal-beállítások (home.md, rolunk.md)
│   ├── layouts/
│   │   └── BaseLayout.astro # Alap HTML sablon (head, fonts, analytics, dark mode)
│   ├── pages/               # Astro route-ok (fájlrendszer alapú routing)
│   │   ├── index.astro      # Főoldal
│   │   ├── hirek/           # Híroldal és dinamikus hír-részletek
│   │   ├── eredmenyek/
│   │   ├── versenykiiras/
│   │   ├── dokumentumok.astro
│   │   ├── rolunk.astro
│   │   ├── adatvedelem.astro
│   │   ├── impresszum.astro
│   │   └── admin/
│   │       └── index.astro  # Sveltia CMS belépési pont
│   ├── styles/
│   │   └── global.css       # Globális CSS (CSS custom properties, dark mode, tipográfia, beágyazott doksik)
│   └── utils/
│       ├── rehype-document-embed.js # Egyedi Rehype plugin: Office (Excel, Word) és PDF néző / biztonsági háló
│       └── url.ts           # getUrl() helper: BASE_URL kezelése (Vercel / GitHub Pages kompatibilis)
├── astro.config.mjs          # Astro konfiguráció (site URL, Rehype plugins)
├── vercel.json               # Vercel beállítások (cleanUrls: true)
├── tsconfig.json
└── TODO-DOMAIN.md            # Útmutató a saját domain aktiválásához
```

---

## 🛠 Fejlesztés Helyben

### Előfeltételek
- [Node.js](https://nodejs.org/) v22.12.0 vagy újabb
- Git

### Telepítés

```bash
git clone https://github.com/meszikristof/kolumbia17.git
cd kolumbia17
npm install
```

### Fejlesztői szerver indítása

```bash
npm run dev
# A weboldal: http://localhost:4321
```

> A projekt `AGENTS.md`-je szerint háttérben is futtatható:
> ```bash
> astro dev --background
> astro dev status   # állapot lekérdezés
> astro dev logs     # logok megtekintése
> astro dev stop     # leállítás
> ```

---

## 📝 Tartalomkezelés – Sveltia CMS

A weboldal a [Sveltia CMS](https://github.com/sveltia/sveltia-cms)-t használja tartalomkezelésre. A Sveltia a Decap CMS (ex-Netlify CMS) egy modern, gyorsabb alternatívája, amely azonos konfigurációs formátumot (`config.yml`) használ, így a meglévő `public/admin/config.yml` fájl változtatás nélkül kompatibilis.

### Hogyan működik?

1. **A tartalom Git-ben tárolódik** — minden hír, eredmény, stb. egy `.md` (Markdown) fájl az `src/content/` mappában.
2. **A CMS a GitHub API-n keresztül ír** — szerkesztéskor a Sveltia CMS közvetlenül commitot hoz létre a GitHub repoban a `develop` branchen.
3. **A hitelesítés egy Cloudflare Workers proxyn fut** — a GitHub OAuth flow-t a `https://sveltia-cms-auth.meszikristof.workers.dev` végpont kezeli, így nincs szükség szerver oldali infrastruktúrára a hoston.

### Admin felület elérése

Az admin felület a `/admin` útvonalon érhető el (pl. `https://kolumbia17.vercel.app/admin`). Belépéshez GitHub fiók szükséges, amelynek van írási jogosultsága a repóhoz.

### Tartalomtípusok (`public/admin/config.yml`)

| Gyűjtemény | Mappa | Leírás |
| :--- | :--- | :--- |
| `hirek` | `src/content/hirek/` | Hírposztok (cím, dátum, összefoglaló, kiemelt kép, tagek, markdown törzs) |
| `eredmenyek` | `src/content/eredmenyek/` | Versenyeredmények (saját leírással vagy külső linkkel) |
| `versenykiiras` | `src/content/versenykiiras/` | Versenykiírás dokumentumok (szezon szerint) |
| `dokumentumok` | `src/content/dokumentumok/` | Letölthető dokumentumok (PDF csatolmány lehetőséggel) |
| `pages` | `src/content/pages/` | Globális oldalbeállítások (főoldal hero, logó, elérhetőségek) |

### Médiatár

A CMS-en keresztül feltöltött képek és fájlok a `public/images/uploads/` mappában tárolódnak, elérési útjuk a publikált oldalon `/images/uploads/...`.

### 📊 Dokumentumok és Táblázatok Beágyazása (Office & PDF Viewer)

A Markdown szövegszerkesztő (`body`) támogatja az irodai dokumentumok (Excel táblázatok, Word dokumentumok, PowerPoint bemutatók, PDF-ek) interaktív beágyazását:

1. **Egyedi CMS szerkesztő komponens:** A szerkesztő eszköztárában elérhető a **`📊 Dokumentum / Táblázat beágyazása`** gomb, amely egyszerű dialógusablakban kéri be a feltöltött fájlt és az opcionális címet (`[document-embed src="..." title="..."]`).
2. **Astro Biztonsági Háló (Rehype Plugin):** Ha a szerkesztő tévedésből képként (`![](/images/uploads/tabla.xlsx)`) szúr be egy Excel, Word vagy PDF fájlt, az Astro **nem hoz létre törött `<img>` elemet**. Ehelyett felismeri a fájlkiterjesztést (`.xlsx`, `.xls`, `.csv`, `.docx`, `.doc`, `.pptx`, `.pdf`), és automatikusan beágyazza az **interaktív Microsoft Office Online Viewert** vagy PDF nézőt, kiegészítve letisztult letöltés és külön lapon megnyitás gombokkal.

---

## 🌐 Deployment – Vercel

A projekt Vercelen van hosztolva. Minden `develop` branchre érkező push automatikusan elindít egy deploy-t (amennyiben a Vercel GitHub integráció be van konfigurálva).

**Konfiguráció:**
- `astro.config.mjs` → `site: 'https://kolumbia17.vercel.app'`
- `vercel.json` → `cleanUrls: true` (a `.html` kiterjesztések elhagyhatók az URL-ből)

### Dark Mode

Az oldal támogatja a sötét és világos témát. A választott téma a `localStorage`-ban (`theme` kulcs) tárolódik. Az alap HTML-be inline script gondoskodik a témaváltás flash-mentes betöltéséről (FOUC megelőzés).

---

## 🔧 Saját Domain Aktiválása

Ha az oldalt a `www.kolumbia17.hu` domainre szeretnéd átállítani, kövesd a **[TODO-DOMAIN.md](./TODO-DOMAIN.md)** fájlban leírt lépéseket. Főbb teendők:
1. `astro.config.mjs` → `site` átírása.
2. `public/CNAME` fájl létrehozása (csak GitHub Pages esetén).
3. DNS rekordok beállítása a domain regisztrátornál.

---

## 🧞 Parancsok Összefoglalása

| Parancs | Leírás |
| :--- | :--- |
| `npm install` | Függőségek telepítése |
| `npm run dev` | Helyi fejlesztői szerver (`localhost:4321`) |
| `npm run build` | Éles build generálása a `dist/` mappába |
| `npm run preview` | A legenerált build helyi előnézete |
| `npm run astro -- --help` | Astro CLI súgó |
