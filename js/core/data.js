/* ==========================================================================
   FETOC - Couche d'accès aux données
   Toutes les données proviennent de /data/*.json (futurs contenus de back-office).
   ========================================================================== */

import { fetchJSON, parDateDesc, parDateAsc, correspond } from './utils.js';

const FICHIERS = {
  site: 'data/site.json',
  federation: 'data/federation.json',
  disciplines: 'data/disciplines.json',
  clubs: 'data/clubs.json',
  competitions: 'data/competitions.json',
  actualites: 'data/actualites.json',
  partenaires: 'data/partenaires.json',
  galerie: 'data/galerie.json'
};

/** Données chargées, accessibles par clé : data.site, data.clubs, … */
export const data = {};

/** Charge tous les fichiers de données en parallèle. */
export async function chargerDonnees() {
  const cles = Object.keys(FICHIERS);
  const reponses = await Promise.all(cles.map((cle) => fetchJSON(FICHIERS[cle])));
  cles.forEach((cle, index) => {
    data[cle] = reponses[index];
  });
  return data;
}

/* ---------------------------------------------------------------- site */
export const site = () => data.site?.identite ?? {};
export const contact = () => data.site?.contact ?? {};
export const reseaux = () => data.site?.reseaux ?? [];
export const navigation = () => data.site?.navigation ?? [];
export const appelAction = () => data.site?.appel_action ?? { libelle: 'Nous rejoindre', url: 'contact.html' };
export const seo = () => data.site?.seo ?? {};
/** URL publique absolue du site (variable SEO, source unique : data/site.json). */
export const urlSite = () => data.site?.seo?.url_site ?? '';

/* Vidéos de fond des héros : { page: "url", ... } */
export const videosHeros = () => data.site?.videos_heros ?? {};

export function videoHeroPage(page) {
  const carte = videosHeros();
  const lien = page ? carte[page] : null;
  return typeof lien === 'string' && lien ? lien : '';
}

export function reseauParId(id) {
  return reseaux().find((r) => r.id === id) ?? null;
}

/* ---------------------------------------------------------------- disciplines */
export const disciplines = () => data.disciplines?.liste ?? [];
export const familles = () => data.disciplines?.familles ?? [];
export const parcours = () => data.disciplines?.parcours ?? {};
export const formations = () => data.disciplines?.formations ?? {};
export const sitesPratique = () => data.disciplines?.sites_de_pratique?.liste ?? [];

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
export const clubs = () => data.clubs?.liste ?? [];
export const regions = () => data.clubs?.regions ?? [];

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
export const evenements = () => data.competitions?.evenements ?? [];
export const classements = () => data.competitions?.classements ?? [];
export const saisons = () => data.competitions?.saisons ?? [];
export const typesEvenement = () => data.competitions?.types ?? [];
export const libelleStatut = (statut) => data.competitions?.statuts?.[statut] ?? statut;
export const saisonCourante = () => data.competitions?.saison_courante ?? '';

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

export function prochainEvenement() {
  return prochainsEvenements(1)[0] ?? null;
}

export function derniersResultats(limite = 3) {
  return parDateDesc(
    evenements().filter((e) => e.resultats?.publies),
    'date_debut'
  ).slice(0, limite);
}

export function classementsDisponibles(saison = null) {
  return saison ? classements().filter((c) => c.saison === saison) : classements();
}

/* ---------------------------------------------------------------- actualités */
export const actualites = () => data.actualites?.liste ?? [];
export const categoriesActualites = () => data.actualites?.categories ?? [];

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
export const partenaires = () => data.partenaires?.liste ?? [];

/** Partenaires publiquement cités dans les activités de la fédération. */
export function partenairesAffiches() {
  return partenaires().filter((p) => p.participation_confirmee === true);
}

export function partenairesEnNegociation() {
  return partenaires().filter((p) => p.participation_confirmee !== true);
}

export function libelleCategoriePartenaire(id) {
  return data.partenaires?.entete?.categories?.find((c) => c.id === id)?.libelle ?? 'Partenaire';
}

/* ---------------------------------------------------------------- galerie */
export const galerie = () => data.galerie?.liste ?? [];

export function libelleCategorieGalerie(id) {
  return data.galerie?.categories?.find((c) => c.id === id)?.libelle ?? 'Galerie';
}

export function imagesGalerie({ categorie = 'toutes', limite = null } = {}) {
  let liste = galerie();
  if (categorie !== 'toutes') liste = liste.filter((i) => i.categorie === categorie);
  return limite ? liste.slice(0, limite) : liste;
}

/* ---------------------------------------------------------------- synthèse */
/** Chiffres clés calculés à partir des données réellement présentes. */
export function chiffresCalcules() {
  return {
    clubs: clubs().length,
    regions: new Set(clubs().map((c) => c.region)).size,
    disciplines: disciplines().length,
    evenements: evenements().filter((e) => e.statut === 'a_venir').length
  };
}

/** Section chiffres clés : liste des indicateurs publiés par la fédération. */
export function chiffresCles() {
  const bloc = data.federation?.chiffres_cles;
  if (!bloc) return [];
  const calcules = chiffresCalcules();
  return (bloc.indicatifs || []).map((indicateur) => ({
    ...indicateur,
    valeur: indicateur.source === 'calcule' ? calcules[indicateur.cle] ?? '-' : indicateur.valeur
  }));
}
