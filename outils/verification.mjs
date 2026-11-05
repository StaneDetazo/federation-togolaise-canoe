/* ==========================================================================
   FETOC - Vérification automatique du site
   Contrôle :
     1. la validité des fichiers JSON de /data (site, taxonomies, pages, collections) ;
     2. l'absence de lien interne cassé dans les pages HTML ;
     3. la cohérence des identifiants référencés entre fichiers ;
     4. la présence des fichiers référencés (visuels, styles, scripts) ;
     5. le rendu des composants (cartes) à partir des données réelles ;
     6. la structure du projet.
   Usage : npm run verifier   (le serveur local n'est pas nécessaire)
   ========================================================================== */

import { readFile, readdir } from 'node:fs/promises';
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

const fichiersData = ['site.json', 'taxonomies.json'];
for (const dossier of ['pages', 'collections']) {
  const entrees = await readdir(chemin('data', dossier));
  fichiersData.push(...entrees.filter((f) => f.endsWith('.json')).sort().map((f) => `${dossier}/${f}`));
}

/** Contenu JSON indexé par chemin relatif : « data/pages/accueil.json ». */
const jsonParChemin = new Map();
const donnees = { site: {}, taxonomies: {}, pages: {}, collections: {} };

for (const relatif of fichiersData) {
  const cle = `data/${relatif}`;
  try {
    const valeur = JSON.parse(await readFile(chemin(cle), 'utf8'));
    jsonParChemin.set(cle, valeur);
    if (relatif === 'site.json') donnees.site = valeur;
    else if (relatif === 'taxonomies.json') donnees.taxonomies = valeur;
    else if (relatif.startsWith('pages/')) donnees.pages[relatif.replace(/^pages\//, '').replace('.json', '')] = valeur;
    else donnees.collections[relatif.replace(/^collections\//, '').replace('.json', '')] = valeur;
    ok(cle);
  } catch (e) {
    erreur(`${cle} - ${e.message}`);
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

const tax = donnees.taxonomies;
const collections = donnees.collections;
const ids = (liste) => new Set((liste ?? []).map((entree) => entree.id));

const idsClubs = ids(collections.clubs);
const idsDisciplines = ids(collections.disciplines);
const idsEvenements = ids(collections.evenements);
const idsPartenaires = ids(collections.partenaires);
const idsFamilles = ids(tax.familles_disciplines);
const idsCategories = ids(tax.categories_actualites);
const idsRegions = ids(tax.regions);
const idsTypes = ids(tax.types_evenements);
const idsSaisons = ids(tax.saisons);
const idsCategoriesPartenaires = ids(tax.categories_partenaires);
const statuts = new Set(Object.keys(tax.statuts_evenements ?? {}));

// Disciplines : famille référencée dans les taxonomies.
for (const discipline of collections.disciplines ?? []) {
  if (discipline.famille && !idsFamilles.has(discipline.famille))
    erreur(`Discipline ${discipline.id} - famille inconnue « ${discipline.famille} »`);
}
ok(`Disciplines - ${idsDisciplines.size} discipline(s) vérifiée(s)`);

// Clubs : région référencée dans les taxonomies.
for (const club of collections.clubs ?? []) {
  if (club.region && !idsRegions.has(club.region))
    erreur(`Club ${club.id} - région inconnue « ${club.region} »`);
  for (const discipline of club.disciplines ?? []) {
    if (!idsDisciplines.has(discipline))
      erreur(`Club ${club.id} - discipline inconnue « ${discipline} »`);
  }
}
ok(`Clubs - ${idsClubs.size} club(s) vérifié(s)`);

// Événements : discipline, type, saison et statut référencés.
for (const evenement of collections.evenements ?? []) {
  if (evenement.discipline_id && !idsDisciplines.has(evenement.discipline_id))
    erreur(`Événement ${evenement.id} - discipline inconnue « ${evenement.discipline_id} »`);
  if (evenement.type && !idsTypes.has(evenement.type))
    erreur(`Événement ${evenement.id} - type inconnu « ${evenement.type} »`);
  if (evenement.saison && !idsSaisons.has(evenement.saison))
    erreur(`Événement ${evenement.id} - saison inconnue « ${evenement.saison} »`);
  if (evenement.statut && !statuts.has(evenement.statut))
    erreur(`Événement ${evenement.id} - statut inconnu « ${evenement.statut} »`);
}
ok(`Événements - ${idsEvenements.size} événement(s) vérifié(s)`);

// Articles : catégorie et articles liés.
const slugs = new Set((collections.articles ?? []).map((article) => article.slug));
for (const article of collections.articles ?? []) {
  if (article.categorie && !idsCategories.has(article.categorie))
    erreur(`Article « ${article.slug} » - catégorie inconnue « ${article.categorie} »`);
  for (const lien of article.articles_lies ?? []) {
    if (!slugs.has(lien)) avertir(`Article « ${article.slug} » - article lié inconnu « ${lien} »`);
  }
}
ok(`Actualités - ${slugs.size} article(s), liens internes contrôlés`);

// Partenaires : catégorie référencée.
for (const partenaire of collections.partenaires ?? []) {
  if (partenaire.categorie && !idsCategoriesPartenaires.has(partenaire.categorie))
    erreur(`Partenaire ${partenaire.id} - catégorie inconnue « ${partenaire.categorie} »`);
}
ok(`Partenaires - ${idsPartenaires.size} partenaire(s) vérifié(s)`);

// Pages : chaque « collection » référencée doit exister.
const collectionsReferencees = [];
const parcourirPage = (valeur) => {
  if (Array.isArray(valeur)) {
    valeur.forEach(parcourirPage);
  } else if (valeur && typeof valeur === 'object') {
    for (const [cle, contenu] of Object.entries(valeur)) {
      if (cle === 'collection' && typeof contenu === 'string') collectionsReferencees.push(contenu);
      else parcourirPage(contenu);
    }
  }
};
Object.values(donnees.pages).forEach(parcourirPage);
const collectionsInconnues = [...new Set(collectionsReferencees)].filter(
  (nom) => !Object.prototype.hasOwnProperty.call(collections, nom)
);
if (collectionsInconnues.length)
  erreur(`Pages - collection(s) inconnue(s) : ${collectionsInconnues.join(', ')}`);
else ok(`Pages - ${collectionsReferencees.length} référence(s) de collection valide(s)`);

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

  // fetch local simulé : chaque URL « data/…/fichier.json » renvoie le JSON déjà lu.
  globalThis.fetch = async (url) => {
    const correspondance = String(url).match(/data\/[A-Za-z0-9_./-]+\.json/);
    const valeur = correspondance ? jsonParChemin.get(correspondance[0]) : undefined;
    if (valeur === undefined) return { ok: false, status: 404 };
    return { ok: true, status: 200, json: async () => valeur };
  };
  await chargerDonnees();

  const premier = (liste) => (Array.isArray(liste) && liste.length ? liste[0] : undefined);
  const membres = donnees.pages.federation?.comite_executif?.liste ?? [];
  const controles = [
    ['carteDiscipline', cartes.carteDiscipline, premier(collections.disciplines)],
    ['carteArticle', cartes.carteArticle, premier(collections.articles)],
    ['carteClub', cartes.carteClub, premier(collections.clubs)],
    ['carteClub (liste)', (c) => cartes.carteClub(c, { variante: 'liste' }), collections.clubs?.[1]],
    ['carteEvenement', cartes.carteEvenement, collections.evenements?.[1]],
    ['carteEvenement (sombre)', (e) => cartes.carteEvenement(e, { variante: 'sombre' }), collections.evenements?.[1]],
    ['ligneEvenement', cartes.ligneEvenement, collections.evenements?.[2]],
    ['vignetteGalerie', cartes.vignetteGalerie, premier(collections.galerie)],
    ['carteMembre', cartes.carteMembre, premier(membres)],
    ['cartePartenaire', cartes.cartePartenaire, premier(collections.partenaires)],
    ['blocSquelette', cartes.blocSquelette, { titre: 'Test', texte: 'Texte', nombre: 2 }],
    ['bandeauPage', cartes.bandeauPage, { titre: 'Test', chapeau: 'Chapô', fil: 'Test' }],
    ['carteDisciplineAccueil', (d) => cartes.carteDisciplineAccueil(d, 0), premier(collections.disciplines)],
    ['carteArticleAccueil (vedette)', (a) => cartes.carteArticleAccueil(a, { vedette: true }), premier(collections.articles)],
    ['carteArticleAccueil', cartes.carteArticleAccueil, collections.articles?.[1]],
    ['carteClubAccueil', cartes.carteClubAccueil, premier(collections.clubs)],
    ['ligneEvenementAccueil', cartes.ligneEvenementAccueil, premier(collections.evenements)],
    ['vignetteGalerieAccueil', cartes.vignetteGalerieAccueil, premier(collections.galerie)]
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
  for (const d of collections.disciplines ?? []) { cartes.carteDiscipline(d); total += 1; }
  for (const a of collections.articles ?? []) { cartes.carteArticle(a); total += 1; }
  for (const c of collections.clubs ?? []) { cartes.carteClub(c); total += 1; }
  for (const e of collections.evenements ?? []) { cartes.carteEvenement(e); total += 1; }
  for (const m of membres) { cartes.carteMembre(m); total += 1; }
  for (const p of collections.partenaires ?? []) { cartes.cartePartenaire(p); total += 1; }
  for (const g of collections.galerie ?? []) { cartes.vignetteGalerie(g); total += 1; }
  ok(`${total} rendus complets sans erreur (disciplines, articles, clubs, événements, bureau, partenaires, galerie)`);

  // rendu des variantes d'accueil (pages d'accueil)
  let totalAccueil = 0;
  (collections.disciplines ?? []).forEach((d, i) => { cartes.carteDisciplineAccueil(d, i); totalAccueil += 1; });
  (collections.articles ?? []).forEach((a, i) => {
    cartes.carteArticleAccueil(a, { vedette: i === 0 });
    totalAccueil += 1;
  });
  (collections.clubs ?? []).forEach((c) => { cartes.carteClubAccueil(c); totalAccueil += 1; });
  (collections.evenements ?? []).forEach((e) => { cartes.ligneEvenementAccueil(e); totalAccueil += 1; });
  (collections.galerie ?? []).forEach((g) => { cartes.vignetteGalerieAccueil(g); totalAccueil += 1; });
  ok(`${totalAccueil} rendus d'accueil sans erreur (disciplines, actualités, clubs, rendez-vous, galerie)`);
} catch (e) {
  erreur(`Rendu impossible - ${e.message}`);
}

/* ---------------------------------------------------------------- 6. structure */
console.log('\n\u001b[1m6. Structure du projet\u001b[0m');
for (const dossier of ['css', 'js/core', 'js/pages', 'data', 'data/pages', 'data/collections', 'assets/img']) {
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
