/* ==========================================================================
   FETOC - Couche d'accès aux données
   Les contenus sont répartis dans /data :
     - site.json          : configuration globale du site ;
     - taxonomies.json    : listes de référence (familles, régions, types…) ;
     - pages/*.json       : textes propres à chaque page ;
     - collections/*.json : objets affichés dans les listes (clubs, articles…).
   ========================================================================== */

import { fetchJSON, parDateDesc, parDateAsc, correspond } from './utils.js';

/* Fichiers attendus : ces deux listes servent au chargement et aux helpers.
   Ajouter une page ou une collection se fait donc à un seul endroit. */
const PAGES = [
  'accueil',
  'federation',
  'disciplines',
  'clubs',
  'competitions',
  'actualites',
  'contact'
];

const COLLECTIONS = [
  'disciplines',
  'clubs',
  'evenements',
  'articles',
  'galerie',
  'partenaires'
];

/** Données chargées : data.site, data.taxonomies, data.pages, data.collections. */
export const data = { pages: {}, collections: {} };

/** Charge tous les fichiers de données en parallèle. */
export async function chargerDonnees() {
  const reponses = await Promise.all([
    fetchJSON('data/site.json'),
    fetchJSON('data/taxonomies.json'),
    ...PAGES.map((nom) => fetchJSON(`data/pages/${nom}.json`)),
    ...COLLECTIONS.map((nom) => fetchJSON(`data/collections/${nom}.json`))
  ]);

  data.site = reponses[0];
  data.taxonomies = reponses[1];

  PAGES.forEach((nom, index) => {
    data.pages[nom] = reponses[index + 2];
  });
  COLLECTIONS.forEach((nom, index) => {
    data.collections[nom] = reponses[index + 2 + PAGES.length];
  });

  return data;
}

/* ---------------------------------------------------------------- site */
export const site = () => data.site?.identite ?? {};
export const contact = () => data.site?.contact ?? {};
export const reseaux = () => data.site?.reseaux ?? [];
export const navigation = () => data.site?.navigation ?? [];
export const appelAction = () => data.site?.appel_action ?? { libelle: 'Nous contacter', url: 'contact.html' };
export const pied = () => data.site?.pied ?? {};
export const seo = () => data.site?.seo ?? {};
/** URL publique absolue du site (variable SEO, source unique : data/site.json). */
export const urlSite = () => data.site?.seo?.url_site ?? '';

/** Contenu éditorial d'une page : page('accueil'), page('contact')… */
export const page = (nom) => data.pages?.[nom] ?? {};

/** Listes de référence partagées : taxonomies().regions, … */
export const taxonomies = () => data.taxonomies ?? {};

/* Vidéos de fond des héros : { page: "url", ... } */
export const videosHeros = () => data.site?.videos ?? {};

export function videoHeroPage(pageActive) {
  const carte = videosHeros();
  const lien = pageActive ? carte[pageActive] : null;
  return typeof lien === 'string' && lien ? lien : '';
}

export function reseauParId(id) {
  return reseaux().find((r) => r.id === id) ?? null;
}

/* ---------------------------------------------------------------- disciplines */
export const disciplines = () => data.collections?.disciplines ?? [];
export const familles = () => data.taxonomies?.familles_disciplines ?? [];

export function disciplineParId(id) {
  return disciplines().find((d) => d.id === id) ?? null;
}

export function libelleDiscipline(id) {
  return disciplineParId(id)?.nom_court ?? 'Discipline fédérale';
}

export function disciplinesMisesEnAvant(n = 6) {
  const toutes = disciplines();
  const mises = toutes.filter((d) => d.a_la_une);
  return (mises.length ? mises : toutes).slice(0, n);
}

/* ---------------------------------------------------------------- clubs */
export const clubs = () => data.collections?.clubs ?? [];
export const regions = () => data.taxonomies?.regions ?? [];

export function clubParId(id) {
  return clubs().find((c) => c.id === id) ?? null;
}

export function nomRegion(id) {
  return regions().find((r) => r.id === id)?.libelle ?? 'Togo';
}

export function clubsMisEnAvant(n = 3) {
  const tous = clubs();
  const mis = tous.filter((c) => c.a_la_une);
  return (mis.length ? mis : tous).slice(0, n);
}

export function filtrerClubs({ region = 'toutes', discipline = 'toutes', requete = '' } = {}) {
  return clubs().filter((club) => {
    if (region !== 'toutes' && club.region !== region) return false;
    if (discipline !== 'toutes' && !(club.disciplines || []).includes(discipline)) return false;
    if (requete) {
      const champs = [club.nom, club.sigle, club.ville, club.quartier, club.presentation];
      if (!champs.some((champ) => correspond(champ, requete))) return false;
    }
    return true;
  });
}

/* ---------------------------------------------------------------- compétitions */
export const evenements = () => data.collections?.evenements ?? [];
export const saisons = () => data.taxonomies?.saisons ?? [];
export const typesEvenement = () => data.taxonomies?.types_evenements ?? [];
export const libelleStatut = (statut) => data.taxonomies?.statuts_evenements?.[statut] ?? statut;

export function evenementParId(id) {
  return evenements().find((e) => e.id === id) ?? null;
}

const STATUTS_A_VENIR = ['a_venir', 'en_cours', 'reporte'];

/** Événements filtrés, triés du plus proche au plus lointain. */
export function agenda({ saison = null, type = 'toutes', discipline = null, statut = null, limite = null } = {}) {
  let liste = evenements();
  if (saison) liste = liste.filter((e) => e.saison === saison);
  if (type && type !== 'toutes') liste = liste.filter((e) => e.type === type);
  if (discipline) liste = liste.filter((e) => e.discipline_id === discipline);
  if (statut) liste = liste.filter((e) => e.statut === statut);
  liste = parDateAsc(liste, 'date_debut');
  return limite ? liste.slice(0, limite) : liste;
}

export function prochainsEvenements(limite = 3) {
  return parDateAsc(
    evenements().filter((e) => STATUTS_A_VENIR.includes(e.statut)),
    'date_debut'
  ).slice(0, limite);
}

/* ---------------------------------------------------------------- actualités */
export const actualites = () => data.collections?.articles ?? [];
export const categoriesActualites = () => data.taxonomies?.categories_actualites ?? [];

export function libelleCategorie(id) {
  return categoriesActualites().find((c) => c.id === id)?.libelle ?? 'Actualité';
}

export function articleParSlug(slug) {
  return actualites().find((a) => a.slug === slug) ?? null;
}

export function articlesRecents(limite = 3, { categorie = 'toutes', exclure = null } = {}) {
  let liste = actualites();
  if (categorie !== 'toutes') liste = liste.filter((a) => a.categorie === categorie);
  if (exclure) liste = liste.filter((a) => a.slug !== exclure);
  return parDateDesc(liste, 'date').slice(0, limite);
}

export function articlesLies(article, limite = 3) {
  if (!article) return articlesRecents(limite);
  const parSlug = (article.articles_lies || [])
    .map((slug) => articleParSlug(slug))
    .filter(Boolean);
  if (parSlug.length >= limite) return parSlug.slice(0, limite);
  const complement = articlesRecents(limite * 2, { exclure: article.slug }).filter(
    (a) => !parSlug.some((p) => p.slug === a.slug)
  );
  return [...parSlug, ...complement].slice(0, limite);
}

export function filtrerActualites({ categorie = 'toutes', requete = '' } = {}) {
  return parDateDesc(actualites(), 'date').filter((article) => {
    if (categorie !== 'toutes' && article.categorie !== categorie) return false;
    if (requete) {
      const champs = [article.titre, article.chapeau, article.tags?.join(' '), article.lieu];
      if (!champs.some((champ) => correspond(champ, requete))) return false;
    }
    return true;
  });
}

/* ---------------------------------------------------------------- partenaires */
export const partenaires = () => data.collections?.partenaires ?? [];

/** Partenaires affichés : la collection ne contient que les partenariats confirmés. */
export function partenairesAffiches() {
  return partenaires().filter((p) => p.participation_confirmee !== false);
}

export function libelleCategoriePartenaire(id) {
  return data.taxonomies?.categories_partenaires?.find((c) => c.id === id)?.libelle ?? 'Partenaire';
}

/* ---------------------------------------------------------------- galerie */
export const galerie = () => data.collections?.galerie ?? [];

export function imagesGalerie({ limite = null } = {}) {
  const liste = galerie();
  return limite ? liste.slice(0, limite) : liste;
}

/* ---------------------------------------------------------------- synthèse */
/** Section chiffres clés : liste des indicateurs publiés sur la page d'accueil. */
export function chiffresCles() {
  return data.pages?.accueil?.bref?.chiffres_cles ?? [];
}
