/* ==========================================================================
   FETOC - URL publique du site
   Source unique de vérité : data/site.json > seo.url_site

   Réécrit l'origine des URLs absolues du site dans :
     - les pages HTML : canonical, og:url, og:image, twitter:image ;
     - sitemap.xml    : chaque <loc>.

   À relancer après avoir changé « seo.url_site » (ex. passage en production) :
     npm run url

   Note : ce script ne touche ni les liens externes (polices, CDN, vidéos),
   ni les instructions de développement (http://localhost:8000, etc.).
   ========================================================================== */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chemin = (...parties) => path.join(racine, ...parties);

/* ---------------------------------------------------------------- variable */
const site = JSON.parse(await readFile(chemin('data', 'site.json'), 'utf8'));
const urlSite = String(site?.seo?.url_site ?? '')
  .trim()
  .replace(/\/+$/, '');

if (!/^https?:\/\/[^\s/]+$/.test(urlSite)) {
  console.error(`\u001b[31m✗\u001b[0m data/site.json > seo.url_site invalide : « ${site?.seo?.url_site ?? ''} »`);
  console.error('  Attendu : une origine absolue sans barre finale, ex. « https://www.fetoc.tg »');
  process.exit(1);
}

/* ---------------------------------------------------------------- pages HTML */
// Un motif par balise porteuse d'une URL absolue : on ne remplace que
// l'origine, le chemin (page ou visuel) est conservé.
const motifsHtml = [
  /(<link\s+rel="canonical"\s+href=")https?:\/\/[^/"]+(\/[^"]*)(")/g,
  /(<meta\s+property="og:url"\s+content=")https?:\/\/[^/"]+(\/[^"]*)(")/g,
  /(<meta\s+property="og:image"\s+content=")https?:\/\/[^/"]+(\/[^"]*)(")/g,
  /(<meta\s+name="twitter:image"\s+content=")https?:\/\/[^/"]+(\/[^"]*)(")/g
];

const pages = (await readdir(racine)).filter((f) => f.endsWith('.html')).sort();
let balisesTotal = 0;
let balisesMaj = 0;
let pagesMaj = 0;

for (const page of pages) {
  const avant = await readFile(chemin(page), 'utf8');
  let apres = avant;
  for (const motif of motifsHtml) {
    apres = apres.replace(motif, (correspondance, debut, urlChemin, fin) => {
      balisesTotal += 1;
      const remplacement = `${debut}${urlSite}${urlChemin}${fin}`;
      if (remplacement !== correspondance) balisesMaj += 1;
      return remplacement;
    });
  }
  if (apres !== avant) {
    await writeFile(chemin(page), apres, 'utf8');
    pagesMaj += 1;
  }
}

/* ---------------------------------------------------------------- sitemap */
const cheminSitemap = chemin('sitemap.xml');
const sitemapAvant = await readFile(cheminSitemap, 'utf8');
let urlsTotal = 0;
let urlsMaj = 0;
const sitemapApres = sitemapAvant.replace(
  /<loc>https?:\/\/[^/<]+(\/[^<]*)<\/loc>/g,
  (correspondance, urlChemin) => {
    urlsTotal += 1;
    const remplacement = `<loc>${urlSite}${urlChemin}</loc>`;
    if (remplacement !== correspondance) urlsMaj += 1;
    return remplacement;
  }
);
if (sitemapApres !== sitemapAvant) await writeFile(cheminSitemap, sitemapApres, 'utf8');

/* ---------------------------------------------------------------- bilan */
console.log(`\u001b[32m✓\u001b[0m URL publique : ${urlSite}`);
console.log(
  `  ${pages.length} page(s) HTML - ${balisesTotal} balise(s) SEO (canonical, og:url, og:image, twitter:image)`
);
console.log(`  sitemap.xml - ${urlsTotal} URL(s)`);
console.log(
  balisesMaj + urlsMaj > 0
    ? `  \u001b[32m${balisesMaj} balise(s) et ${urlsMaj} URL(s) mises à jour (${pagesMaj} page(s)).\u001b[0m`
    : '  Aucune modification : tout est déjà à jour.'
);
