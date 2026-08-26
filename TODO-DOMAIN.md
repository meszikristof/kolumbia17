# Teendők a saját domain (www.kolumbia17.hu) végleges beállításához

Amikor az oldal elkészült, és a githubos (`meszikristof.github.io/kolumbia17/`) címről át szeretnél állni a saját domainedre, az alábbi lépéseket kell elvégezned:

1. **Astro konfiguráció módosítása:**
   Az `astro.config.mjs` fájlban állítsd vissza a `site` változót, és töröld (vagy kommentezd ki) a `base` beállítást:
   ```javascript
   export default defineConfig({
     site: 'https://www.kolumbia17.hu',
     // base: '/kolumbia17', <- EZT TÖRÖLD!
   });
   ```

2. **CNAME fájl visszaállítása:**
   A `public/` mappában hozz létre egy `CNAME` nevű fájlt (kiterjesztés nélkül), aminek a tartalma pontosan ennyi legyen:
   ```text
   www.kolumbia17.hu
   ```
   Ezt commitold és pushold a GitHub-ra. (Ez mondja meg a GitHub Pages-nek, hogy saját domaint használsz).

3. **GitHub beállítások ellenőrzése:**
   Menj a GitHub repository-dban a **Settings -> Pages** menübe, és ellenőrizd, hogy a **Custom domain** mezőben ott van-e a `www.kolumbia17.hu`. Ha szükséges, mentsd el.

4. **DNS beállítások (ha még nincs):**
   A domained szolgáltatójánál (ahol a www.kolumbia17.hu-t regisztráltad), be kell állítanod a GitHub Pages IP címeit:
   - "A" rekordok:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - "CNAME" rekord a `www` aldomainhez:
     - Név: `www`
     - Érték: `meszikristof.github.io`

*Megjegyzés: A kódba beépített `BASE_URL` alapú relatív linkek (pl. amik a fejlécben vagy képeknél vannak) a fenti változtatás után is tökéletesen fognak működni, mert a `BASE_URL` olyankor automatikusan `/` (gyökér) lesz.*
