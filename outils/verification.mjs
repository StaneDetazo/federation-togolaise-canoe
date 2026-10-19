/* ==========================================================================
   FETOC - Vérification automatique du site
   Contrôle :
     1. la validité des fichiers JSON de /data ;
     2. l'absence de lien interne cassé dans les pages HTML ;
     3. la cohérence des identifiants référencés entre fichiers ;
     4. la présence des fichiers référencés (visuels, styles, scripts) ;
     5. le rendu des composants (cartes) à partir des données réelles ;
     6. la structure du projet.
   Usage : npm run verifier   (le serveur local n'est pas nécessaire)
   ========================================================================== */

import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chemin = (...parties) => path.join(racine, ...parties);

let erreurs = 0;
let avertissements = 0;
const ok = (message) => console.log(`  \u001b[32m✓\u001b[0m ${message}`);
const erreur = (message) => {
  erreurs += 1;
  console.log(`  \u001b[31m✗\u001b[0m ${message}`);
};
const avertir = (message) => {
  avertissements += 1;
  console.log(`  \u001b[33m!\u001b[0m ${message}`);
};

/* ---------------------------------------------------------------- 1. JSON */
console.log('\n\u001b[1m1. Fichiers de données JSON\u001b[0m');
const fichiersData = (await readdir(chemin('data'))).filter((f) => f.endsWith('.json'));
const donnees = {};
for (const fichier of fichiersData.sort()) {
  try {
    donnees[fichier.replace('.json', '')] = JSON.parse(await readFile(chemin('data', fichier), 'utf8'));
    ok(`data/${fichier}`);
  } catch (e) {
    erreur(`data/${fichier} - ${e.message}`);
  }
}

/* ---------------------------------------------------------------- 2. liens internes */
console.log('\n\u001b[1m2. Liens et ressources des pages HTML\u001b[0m');
const pages = (await readdir(racine)).filter((f) => f.endsWith('.html'));

// Origine absolue attendue, définie une seule fois dans les données.
const urlSite = String(donnees.site?.seo?.url_site ?? '').replace(/\/+$/, '');
const pagesUrlIncoherente = [];

for (const page of pages.sort()) {
  const contenu = await readFile(chemin(page), 'utf8');
  const cibles = [
    ...contenu.matchAll(/(?:href|src)="([^"#][^"]*)"/g),
    ...contenu.matchAll(/src="(js\/[^"]+)"/g)
  ]
    .map((m) => m[1])
    .filter((c) => !/^(https?:|mailto:|tel:|data:|#)/.test(c));

  const manquants = [...new Set(cibles)].filter((c) => {
    const nettoye = c.split('?')[0].split('#')[0];
    return nettoye && !existsSync(chemin(nettoye));
  });

  if (manquants.length) erreur(`${page} - ressource(s) introuvable(s) : ${manquants.join(', ')}`);
  else ok(`${page} - ${new Set(cibles).size} ressource(s) locale(s) valide(s)`);

  // Cohérence de l'URL publique (canonical, og:url, og:image, twitter:image).
  const origines = [
    ...contenu.matchAll(
      /(?:<link\s+rel="canonical"\s+href="|<meta\s+property="og:url"\s+content="|<meta\s+property="og:image"\s+content="|<meta\s+name="twitter:image"\s+content=")(https?:\/\/[^/"]+)/g
    )
  ].map((m) => m[1]);
  if (urlSite && origines.some((origine) => origine !== urlSite)) pagesUrlIncoherente.push(page);
}

if (!urlSite) avertir('data/site.json - « seo.url_site » manquant');
else if (pagesUrlIncoherente.length)
  avertir(
    `URL publique différente de « seo.url_site » (${urlSite}) dans : ${pagesUrlIncoherente.join(', ')} - lancer « npm run url »`
  );
else ok(`URL publique cohérente dans les ${pages.length} page(s) (${urlSite})`);

if (urlSite && existsSync(chemin('sitemap.xml'))) {
  const sitemap = await readFile(chemin('sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>(https?:\/\/[^/<]+)/g)].map((m) => m[1]);
  const originesSitemap = [...new Set(locs)].filter((origine) => origine !== urlSite);
  if (originesSitemap.length)
    avertir(`sitemap.xml - origine différente de « seo.url_site » : ${originesSitemap.join(', ')}`);
  else ok(`sitemap.xml - ${locs.length} URL(s) cohérente(s) avec « seo.url_site »`);
}

/* ---------------------------------------------------------------- 3. cohérence des identifiants */
console.log('\n\u001b[1m3. Cohérence des identifiants\u001b[0m');
const idsClubs = new Set((donnees.clubs?.liste ?? []).map((c) => c.id));
const idsDisciplines = new Set((donnees.disciplines?.liste ?? []).map((d) => d.id));
const places = (titre, liste, valide, champ = 'id') => {
  const fautifs = liste.filter((e) => !valide(e[champ]));
  if (fautifs.length) erreur(`${titre} - référence inconnue : ${fautifs.map((f) => `${f.id}→${f[champ]}`).join(', ')}`);
  else ok(titre);
};

const evenements = donnees.competitions?.evenements ?? [];
for (const evenement of evenements) {
  if (evenement.discipline_id && !idsDisciplines.has(evenement.discipline_id))
    erreur(`Événement ${evenement.id} - discipline inconnue « ${evenement.discipline_id} »`);
}
ok(`Compétitions - ${evenements.length} événement(s) vérifié(s)`);

for (const club of donnees.clubs?.liste ?? []) {
  for (const discipline of club.disciplines ?? []) {
    if (!idsDisciplines.has(discipline))
      erreur(`Club ${club.id} - discipline inconnue « ${discipline} »`);
  }
}
ok(`Clubs - ${idsClubs.size} club(s) vérifié(s)`);

for (const classement of donnees.competitions?.classements ?? []) {
  if (classement.discipline_id && !idsDisciplines.has(classement.discipline_id))
    erreur(`Classement ${classement.id} - discipline inconnue « ${classement.discipline_id} »`);
}
ok('Classements - disciplines vérifiées');

// articles liés
const slugs = new Set((donnees.actualites?.liste ?? []).map((a) => a.slug));
for (const article of donnees.actualites?.liste ?? []) {
  for (const lien of article.articles_lies ?? []) {
    if (!slugs.has(lien)) avertir(`Article « ${article.slug} » - article lié inconnu « ${lien} »`);
  }
}
ok(`Actualités - ${slugs.size} article(s), liens internes contrôlés`);

// catégories
const catsActu = new Set((donnees.actualites?.categories ?? []).map((c) => c.id));
for (const a of donnees.actualites?.liste ?? [])
  if (!catsActu.has(a.categorie)) erreur(`Article « ${a.slug} » - catégorie inconnue « ${a.categorie} »`);

const catsGal = new Set((donnees.galerie?.categories ?? []).map((c) => c.id));
for (const g of donnees.galerie?.liste ?? [])
  if (!catsGal.has(g.categorie)) erreur(`Image « ${g.id} » - catégorie inconnue « ${g.categorie} »`);

/* ---------------------------------------------------------------- 4. fichiers référencés */
console.log('\n\u001b[1m4. Fichiers référencés (données et scripts)\u001b[0m');

// Tout chemin local de la forme « dossier/fichier » est contrôlé : visuels
// (assets/…), styles (css/…) et scripts (js/…).
const motifChemin = /(?:assets|css|js)\/[A-Za-z0-9._@%+-]+(?:\/[A-Za-z0-9._@%+-]+)*/g;
const fichiersAttendus = new Set();

const collecterChemin = (valeur) => {
  if (typeof valeur === 'string') {
    for (const correspondance of valeur.matchAll(motifChemin)) fichiersAttendus.add(correspondance[0]);
  } else if (Array.isArray(valeur)) {
    valeur.forEach(collecterChemin);
  } else if (valeur && typeof valeur === 'object') {
    Object.values(valeur).forEach(collecterChemin);
  }
};
collecterChemin(donnees);

// Les scripts référencent aussi des ressources en dur (bannières, logo…).
const scripts = [];
const parcourirScripts = async (dossier) => {
  for (const entree of await readdir(chemin(dossier), { withFileTypes: true })) {
    const relatif = `${dossier}/${entree.name}`;
    if (entree.isDirectory()) await parcourirScripts(relatif);
    else if (entree.name.endsWith('.js')) scripts.push(relatif);
  }
};
if (existsSync(chemin('js'))) await parcourirScripts('js');
for (const script of scripts) {
  const source = await readFile(chemin(script), 'utf8');
  for (const correspondance of source.matchAll(motifChemin)) fichiersAttendus.add(correspondance[0]);
}

const fichiersAbsents = [...fichiersAttendus].filter((f) => !existsSync(chemin(f)));
const visuels = [...fichiersAttendus].filter((f) => f.startsWith('assets/'));

// Un visuel, un style ou un script manquant casse le rendu (erreur).
ok(`${fichiersAttendus.size} fichier(s) référencé(s) (${visuels.length} visuel(s))`);
if (fichiersAbsents.length) {
  erreur(`${fichiersAbsents.length} fichier(s) introuvable(s) : ${fichiersAbsents.join(', ')}`);
}

/* ---------------------------------------------------------------- 5. rendu des composants */
console.log('\n\u001b[1m5. Rendu des composants (données réelles)\u001b[0m');
globalThis.document = { baseURI: `file://${racine}/` };
globalThis.window = { matchMedia: () => ({ matches: false }), location: { search: '' } };

try {
  const { chargerDonnees } = await import('../js/core/data.js');
  const cartes = await import('../js/core/cartes.js');

  // fetch local simulé pour charger les JSON déjà lus
  globalThis.fetch = async (url) => {
    const fichier = path.basename(String(url).split('?')[0]);
    const cle = fichier.replace('.json', '');
    if (!donnees[cle]) return { ok: false, status: 404 };
    return { ok: true, status: 200, json: async () => donnees[cle] };
  };
  await chargerDonnees();

  const premier = (liste) => (Array.isArray(liste) && liste.length ? liste[0] : undefined);
  const controles = [
    ['carteDiscipline', cartes.carteDiscipline, premier(donnees.disciplines.liste)],
    ['carteArticle', cartes.carteArticle, premier(donnees.actualites.liste)],
    ['carteClub', cartes.carteClub, premier(donnees.clubs.liste)],
    ['carteClub (liste)', (c) => cartes.carteClub(c, { variante: 'liste' }), donnees.clubs.liste?.[1]],
    ['carteEvenement', cartes.carteEvenement, donnees.competitions.evenements?.[1]],
    ['carteEvenement (sombre)', (e) => cartes.carteEvenement(e, { variante: 'sombre' }), donnees.competitions.evenements?.[1]],
    ['ligneEvenement', cartes.ligneEvenement, donnees.competitions.evenements?.[2]],
    ['vignetteGalerie', cartes.vignetteGalerie, premier(donnees.galerie.liste)],
    ['carteMembre', cartes.carteMembre, premier(donnees.federation.bureau_executif?.membres)],
    ['cartePartenaire', cartes.cartePartenaire, premier(donnees.partenaires.liste)],
    ['blocSquelette', cartes.blocSquelette, { titre: 'Test', texte: 'Texte', nombre: 2 }],
    ['bandeauPage', cartes.bandeauPage, { titre: 'Test', chapeau: 'Chapô', fil: 'Test' }],
    ['carteDisciplineAccueil', (d) => cartes.carteDisciplineAccueil(d, 0), premier(donnees.disciplines.liste)],
    ['carteArticleAccueil (vedette)', (a) => cartes.carteArticleAccueil(a, { vedette: true }), premier(donnees.actualites.liste)],
    ['carteArticleAccueil', cartes.carteArticleAccueil, donnees.actualites.liste?.[1]],
    ['carteClubAccueil', cartes.carteClubAccueil, premier(donnees.clubs.liste)],
    ['ligneEvenementAccueil', cartes.ligneEvenementAccueil, premier(donnees.competitions.evenements)],
    ['vignetteGalerieAccueil', cartes.vignetteGalerieAccueil, premier(donnees.galerie.liste)]
  ].filter(([, , entree]) => entree !== undefined);

  for (const [nom, fonction, entree] of controles) {
    const sortie = fonction(entree);
    const problemes = [];
    if (!sortie || sortie.length < 40) problemes.push('rendu vide');
    if (/undefined|NaN|\[object Object\]/.test(sortie)) problemes.push('valeur non résolue');
    if (problemes.length) erreur(`${nom} - ${problemes.join(', ')}`);
    else ok(`${nom} - ${sortie.length} caractères`);
  }

  // rendu de toutes les entités : détecte les données incomplètes
  let total = 0;
  for (const d of donnees.disciplines.liste || []) { cartes.carteDiscipline(d); total += 1; }
  for (const a of donnees.actualites.liste || []) { cartes.carteArticle(a); total += 1; }
  for (const c of donnees.clubs.liste || []) { cartes.carteClub(c); total += 1; }
  for (const e of donnees.competitions.evenements || []) { cartes.carteEvenement(e); total += 1; }
  for (const m of donnees.federation.bureau_executif?.membres || []) { cartes.carteMembre(m); total += 1; }
  for (const p of donnees.partenaires.liste || []) { cartes.cartePartenaire(p); total += 1; }
  for (const g of donnees.galerie.liste || []) { cartes.vignetteGalerie(g); total += 1; }
  ok(`${total} rendus complets sans erreur (disciplines, articles, clubs, événements, bureau, partenaires, galerie)`);

  // rendu des variantes d'accueil (pages d'accueil)
  let totalAccueil = 0;
  (donnees.disciplines.liste || []).forEach((d, i) => { cartes.carteDisciplineAccueil(d, i); totalAccueil += 1; });
  (donnees.actualites.liste || []).forEach((a, i) => {
    cartes.carteArticleAccueil(a, { vedette: i === 0 });
    totalAccueil += 1;
  });
  (donnees.clubs.liste || []).forEach((c) => { cartes.carteClubAccueil(c); totalAccueil += 1; });
  (donnees.competitions.evenements || []).forEach((e) => { cartes.ligneEvenementAccueil(e); totalAccueil += 1; });
  (donnees.galerie.liste || []).forEach((g) => { cartes.vignetteGalerieAccueil(g); totalAccueil += 1; });
  ok(`${totalAccueil} rendus d'accueil sans erreur (disciplines, actualités, clubs, rendez-vous, galerie)`);
} catch (e) {
  erreur(`Rendu impossible - ${e.message}`);
}

/* ---------------------------------------------------------------- 6. structure */
console.log('\n\u001b[1m6. Structure du projet\u001b[0m');
for (const dossier of ['css', 'js/core', 'js/pages', 'data', 'assets/img']) {
  if (!existsSync(chemin(dossier))) avertir(`dossier manquant : ${dossier}/`);
}
const nbImages = existsSync(chemin('assets/img'))
  ? (await readdir(chemin('assets/img'))).length
  : 0;
ok(`${pages.length} page(s) HTML, ${fichiersData.length} fichier(s) JSON, ${nbImages} visuel(s)`);

/* ---------------------------------------------------------------- bilan */
console.log(
  `\n\u001b[1mBilan\u001b[0m : ${erreurs} erreur(s), ${avertissements} avertissement(s).\n`
);
process.exit(erreurs ? 1 : 0);
