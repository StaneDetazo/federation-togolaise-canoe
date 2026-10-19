/* ==========================================================================
   FETOC - Composants de présentation réutilisables
   Chaque fonction renvoie une chaîne HTML correspondant à un « bloc » du site.
   ========================================================================== */

import {
  esc,
  dateCourte,
  dateLongue,
  jourMois,
  periode,
  tronquer,
  joursRestants
} from './utils.js';
import { icone } from './icons.js';
import {
  libelleCategorie,
  familles,
  nomRegion,
  libelleDiscipline,
  libelleStatut,
  libelleCategoriePartenaire,
  libelleCategorieGalerie,
  videoHeroPage
} from './data.js';

const img = (src, alt, classes, attributs = 'loading="lazy" decoding="async"', largeur = 1200, hauteur = 800) =>
  `<img src="${esc(src)}" alt="${esc(alt)}" width="${largeur}" height="${hauteur}" ${attributs} class="${classes}">`;

const badge = (texte, variante = 'vert', nomIcone = null) =>
  `<span class="pastille pastille--${variante}">${nomIcone ? icone(nomIcone, 'h-3.5 w-3.5') : ''}${esc(texte)}</span>`;

/* Visuel utilisé lorsqu'une fiche n'a pas encore de photographie.
   Les images provisoires sont définies dans data/*.json (champ « image »). */
const IMAGE_DEFAUT = 'assets/img/banner-actualites.svg';
const imageOuDefaut = (source) => source || IMAGE_DEFAUT;

/* ---------------------------------------------------------------- disciplines */
export function carteDiscipline(discipline) {
  const famille = familles().find((f) => f.id === discipline.famille)?.libelle ?? 'Discipline';
  const photo = imageOuDefaut(discipline.image);
  const lien = `disciplines.html#${esc(discipline.id)}`;

  return `
  <article class="revele carte group flex flex-col">
    <a href="${lien}" class="carte__media relative block aspect-[16/10] overflow-hidden bg-sable-100" aria-label="${esc(
      discipline.nom
    )}">
      <img src="${esc(photo)}" alt="${esc(discipline.nom)}" width="1280" height="800" loading="lazy" decoding="async"
        class="absolute inset-0 h-full w-full object-cover">
      <span class="absolute left-4 top-4">${badge(famille, 'sombre')}</span>
    </a>
    <div class="flex flex-1 flex-col p-6">
      <h3 class="font-display text-lg font-bold leading-snug text-vert-950">
        <a href="${lien}" class="transition hover:text-vert-700">${esc(discipline.nom)}</a>
      </h3>
      <p class="mt-2.5 text-sm leading-relaxed text-encre-doux">${esc(tronquer(discipline.description, 150))}</p>
      <a href="${lien}" class="lien-fleche mt-auto pt-5 text-sm font-semibold text-vert-700">
        En savoir plus ${icone('fleche-droite', 'h-4 w-4')}
      </a>
    </div>
  </article>`;
}

/* ------------------------------------------- disciplines (tuiles d'accueil) */
/* Tuile photographique d'accueil : la première activité est mise en avant
   (2 colonnes × 2 lignes) sur les grands écrans. */
export function carteDisciplineAccueil(discipline, index = 0) {
  const famille = familles().find((f) => f.id === discipline.famille)?.libelle ?? 'Discipline';
  const photo = imageOuDefaut(discipline.image);
  const grand = index === 0;
  const lien = `disciplines.html#${esc(discipline.id)}`;

  return `
  <article class="revele group relative isolate aspect-[4/3] overflow-hidden rounded-3xl bg-vert-900 ${
    grand ? 'lg:col-span-2 lg:row-span-2 lg:aspect-auto' : ''
  }">
    <a href="${lien}" class="absolute inset-0 block" aria-label="${esc(discipline.nom)}">
      <img src="${esc(photo)}" alt="${esc(discipline.nom)}" width="1280" height="853" loading="lazy" decoding="async"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105">
      <span class="pointer-events-none absolute inset-0 bg-gradient-to-t from-vert-950 via-vert-950/45 to-vert-950/5" aria-hidden="true"></span>
      <div class="absolute inset-x-0 bottom-0 ${grand ? 'p-6 sm:p-8 lg:p-9' : 'p-5 sm:p-6'}">
        <p class="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-soleil-300">${esc(famille)}</p>
        <h3 class="mt-2 font-display font-bold leading-snug text-white ${grand ? 'text-2xl sm:text-3xl' : 'text-lg'}">
          ${esc(discipline.nom)}
        </h3>
        ${grand ? `<p class="mt-3 max-w-md text-sm leading-relaxed text-vert-50/85">${esc(tronquer(discipline.description, 160))}</p>` : ''}
        <span class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
          Découvrir
          <span class="grid h-7 w-7 place-items-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-1">
            ${icone('fleche-droite', 'h-3.5 w-3.5')}
          </span>
        </span>
      </div>
    </a>
    <span class="pointer-events-none absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-2xl bg-white/90 text-vert-700 shadow-doux ${
      grand ? 'sm:h-12 sm:w-12' : ''
    }">
      ${icone(discipline.icone, 'h-5 w-5')}
    </span>
  </article>`;
}

/* ---------------------------------------------------------------- actualités */
export function carteArticle(article, { variante = 'grille' } = {}) {
  const lien = `article.html?slug=${encodeURIComponent(article.slug)}`;
  const compact = variante === 'compact';

  return `
  <article class="revele carte group flex flex-col p-6">
    <div class="flex flex-wrap items-center gap-2">
      ${badge(libelleCategorie(article.categorie), 'soleil')}
      <span class="text-xs text-encre-clair">${esc(dateLongue(article.date))}</span>
    </div>
    <h3 class="mt-4 font-display ${compact ? 'text-base' : 'text-[1.08rem]'} font-bold leading-snug text-vert-950">
      <a href="${lien}" class="transition hover:text-vert-700">${esc(article.titre)}</a>
    </h3>
    <p class="mt-2.5 text-sm leading-relaxed text-encre-doux">${esc(tronquer(article.chapeau, 150))}</p>
    <div class="mt-auto flex items-center justify-between gap-3 pt-5">
      <a href="${lien}" class="lien-fleche text-sm font-semibold text-vert-700">
        Lire l'article ${icone('fleche-droite', 'h-4 w-4')}
      </a>
      <span class="text-xs text-encre-clair">${esc(article.lieu || '')}</span>
    </div>
  </article>`;
}

/* ------------------------------------------- actualités (bloc d'accueil) */
/* Bloc d'accueil : une « une » éditoriale photographique, puis des brèves
   illustrées. La page Actualités conserve, elle, la carte standard. */
export function carteArticleAccueil(article, { vedette = false } = {}) {
  const lien = `article.html?slug=${encodeURIComponent(article.slug)}`;
  const photo = imageOuDefaut(article.image);
  const categorie = libelleCategorie(article.categorie);
  const meta = [dateLongue(article.date), article.lieu]
    .filter(Boolean)
    .map((element) => esc(element))
    .join(' <span aria-hidden="true">·</span> ');

  if (vedette) {
    return `
    <article class="revele group flex flex-col">
      <a href="${lien}" class="relative block overflow-hidden rounded-3xl bg-vert-900">
        ${img(photo, article.titre, 'aspect-[16/10] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]', 'loading="lazy" decoding="async"', 1280, 800)}
        <span class="absolute left-5 top-5">${badge(categorie, 'soleil')}</span>
      </a>
      <p class="mt-6 text-xs uppercase tracking-[0.12em] text-encre-clair">${meta}</p>
      <h3 class="mt-3 font-display text-2xl font-bold leading-snug text-vert-950 sm:text-[1.75rem]">
        <a href="${lien}" class="transition hover:text-vert-700">${esc(article.titre)}</a>
      </h3>
      <p class="mt-3 text-sm leading-relaxed text-encre-doux sm:text-base">${esc(article.chapeau)}</p>
      <a href="${lien}" class="lien-fleche mt-5 self-start text-sm font-semibold text-vert-700">
        Lire l'article ${icone('fleche-droite', 'h-4 w-4')}
      </a>
    </article>`;
  }

  return `
  <article class="revele group border-t border-sable-200 pt-6 first:border-t-0 first:pt-0">
    <a href="${lien}" class="flex items-start gap-5">
      <span class="relative block h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-vert-900 sm:h-28 sm:w-36">
        ${img(photo, article.titre, 'h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105', 'loading="lazy" decoding="async"', 600, 400)}
      </span>
      <span class="min-w-0">
        <span class="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-vert-600">${esc(categorie)}</span>
        <span class="mt-2 block font-display text-base font-bold leading-snug text-vert-950 transition group-hover:text-vert-700 sm:text-lg">${esc(article.titre)}</span>
        <span class="mt-2.5 block text-xs text-encre-clair">${meta}</span>
      </span>
      <span class="ml-auto hidden flex-none text-vert-600 transition group-hover:translate-x-1 sm:block">${icone('chevron-droite', 'h-5 w-5')}</span>
    </a>
  </article>`;
}

/* ---------------------------------------------------------------- clubs */
export function carteClub(club, { variante = 'carte' } = {}) {
  const lien = `club.html?id=${encodeURIComponent(club.id)}`;
  const region = club.region ? nomRegion(club.region) : null;
  const lieu = [...new Set([club.ville, club.site_pratique].filter(Boolean))].join(' · ');

  if (variante === 'liste') {
    return `
    <article class="revele carte group flex flex-col p-6">
      <div class="flex flex-wrap items-center gap-2">
        ${region ? badge(region, 'sombre', 'lieu') : ''}
        ${(club.labels || []).slice(0, 1).map((l) => badge(l, 'soleil')).join('')}
      </div>
      <h3 class="mt-3 font-display text-lg font-bold text-vert-950">
        <a href="${lien}" class="transition hover:text-vert-700">${esc(club.nom)}</a>
      </h3>
      ${lieu ? `<p class="mt-1 text-sm text-encre-clair">${esc(lieu)}</p>` : ''}
      <p class="mt-3 text-sm leading-relaxed text-encre-doux">${esc(tronquer(club.presentation, 170))}</p>
  
    </article>`;
  }

  const photo = imageOuDefaut(club.image);

  return `
  <article class="revele carte group flex flex-col">
    <a href="${lien}" class="carte__media relative block aspect-[16/10] overflow-hidden bg-vert-900"
      aria-label="${esc(club.nom)}">
      ${img(
        photo,
        `${club.nom}${lieu ? ` - ${lieu}` : ''}`,
        'absolute inset-0 h-full w-full object-cover',
        'loading="lazy" decoding="async"',
        1280,
        800
      )}
      <span class="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-vert-950/85 via-vert-950/25 to-transparent" aria-hidden="true"></span>
      ${region ? `<span class="absolute left-4 top-4">${badge(region, 'sombre', 'lieu')}</span>` : ''}
      ${
        lieu
          ? `<span class="absolute bottom-4 left-4 flex items-center gap-1.5 text-sm font-medium text-white">${icone(
              'lieu',
              'h-4 w-4 shrink-0 text-soleil-300'
            )}${esc(lieu)}</span>`
          : ''
      }
    </a>
    <div class="flex flex-1 flex-col p-6">
      <h3 class="font-display text-lg font-bold leading-snug text-vert-950">
        <a href="${lien}" class="transition hover:text-vert-700">${esc(club.nom)}</a>
      </h3>
      <p class="mt-2.5 text-sm leading-relaxed text-encre-doux">${esc(tronquer(club.presentation, 150))}</p>
      <a href="${lien}" class="lien-fleche mt-auto pt-5 text-sm font-semibold text-vert-700">
        Voir la fiche ${icone('fleche-droite', 'h-4 w-4')}
      </a>
    </div>
  </article>`;
}

/* ------------------------------------------------ clubs (cartes d'accueil) */
/* « Carte postale » d'accueil : cadre blanc, photo encadrée, cachet du sigle.
   Le décalage vertical (colonne du milieu) est passé par la page. */
export function carteClubAccueil(club, { decalage = '' } = {}) {
  const lien = `club.html?id=${encodeURIComponent(club.id)}`;
  const photo = imageOuDefaut(club.image);
  const region = club.region ? nomRegion(club.region) : null;
  const lieu = [...new Set([club.ville, club.site_pratique].filter(Boolean))].join(' · ');

  return `
  <article class="revele group flex h-full flex-col rounded-[1.75rem] border border-sable-200 bg-white p-3 shadow-doux transition duration-500 hover:-translate-y-1.5 hover:border-vert-200 hover:shadow-carte ${decalage}">
    <a href="${lien}" class="flex h-full flex-col">
      <span class="relative block aspect-[4/3] overflow-hidden rounded-[1.3rem] bg-vert-900">
        ${img(photo, `${club.nom}${lieu ? ` - ${lieu}` : ''}`, 'h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105', 'loading="lazy" decoding="async"', 1280, 960)}
        <span class="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-vert-950/75 to-transparent"></span>
        ${region ? `<span class="absolute left-3 top-3">${badge(region, 'sombre', 'lieu')}</span>` : ''}
      </span>

      <span class="flex flex-1 flex-col px-2 pb-1 pt-5">
        <span class="block font-display text-lg font-bold leading-snug text-vert-950 transition group-hover:text-vert-700">${esc(club.nom)}</span>
        ${lieu ? `<span class="mt-1.5 flex items-center gap-1.5 text-sm text-encre-clair">${icone('lieu', 'h-4 w-4 shrink-0 text-vert-600')}${esc(lieu)}</span>` : ''}
        <span class="mt-3.5 block text-sm leading-relaxed text-encre-doux">${esc(tronquer(club.presentation, 130))}</span>
        <span class="mt-auto flex items-center justify-between gap-3 border-t border-sable-200 pt-4">
          <span class="text-xs text-encre-clair">Club affilié</span>
          <span class="lien-fleche text-sm font-semibold text-vert-700">Voir la fiche ${icone('fleche-droite', 'h-4 w-4')}</span>
        </span>
      </span>
    </a>
  </article>`;
}

/* ---------------------------------------------------------------- événements */
export function carteEvenement(evenement, { variante = 'clair' } = {}) {
  const sombre = variante === 'sombre';
  const { jour, mois } = jourMois(evenement.date_debut);
  const discipline = evenement.discipline_id ? libelleDiscipline(evenement.discipline_id) : 'Rendez-vous fédéral';
  const restant = joursRestants(evenement.date_debut);

  const socle = sombre
    ? 'border-white/12 bg-white/[0.06] hover:border-soleil-400/60'
    : 'border-sable-200 bg-white hover:border-vert-200';
  const titre = sombre ? 'text-white' : 'text-vert-950';
  const texte = sombre ? 'text-vert-50/75' : 'text-encre-doux';

  const statut =
    evenement.statut === 'a_venir'
      ? badge(restant > 0 && restant <= 30 ? `Dans ${restant} j` : 'À venir', sombre ? 'soleil' : 'vert', 'horloge')
      : badge(libelleStatut(evenement.statut), evenement.statut === 'termine' ? 'gris' : 'soleil');

  const chiffres = (evenement.chiffres || [])
    .map(
      (c) =>
        `<li class="inline-flex items-baseline gap-1.5"><span class="font-display text-base font-extrabold ${titre}">${esc(
          c.valeur
        )}</span><span class="text-xs ${texte}">${esc(c.libelle)}</span></li>`
    )
    .join('');

  const action = `<span class="pastille pastille--${sombre ? 'sombre' : 'vert'}">${icone(
    'horloge',
    'h-3.5 w-3.5'
  )}${esc(libelleStatut(evenement.statut))}</span>`;

  return `
  <article class="revele flex flex-col gap-5 rounded-2xl border p-6 transition ${socle} sm:flex-row sm:items-start">
    <div class="flex flex-none items-center gap-4 sm:flex-col sm:gap-0">
      <span class="grid h-16 w-16 place-items-center rounded-2xl ${sombre ? 'bg-soleil-400 text-vert-950' : 'bg-vert-700 text-white'}">
        <span class="text-center leading-none">
          <span class="block font-display text-xl font-extrabold">${esc(jour)}</span>
          <span class="block text-[0.62rem] font-bold uppercase tracking-wider">${esc(mois)}</span>
        </span>
      </span>
      <span class="sm:hidden">${statut}</span>
    </div>

    <div class="flex-1">
      <div class="hidden sm:block">${statut}</div>
      <p class="mt-0 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${sombre ? 'text-soleil-300' : 'text-vert-600'} sm:mt-2">
        ${esc(discipline)} · ${esc(evenement.type)}
      </p>
      <h3 class="mt-1.5 font-display text-[1.05rem] font-bold leading-snug ${titre}">${esc(evenement.titre)}</h3>
      <ul class="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm ${texte}">
        <li class="inline-flex items-center gap-1.5">${icone('calendrier', 'h-4 w-4')}${esc(
          evenement.periode || periode(evenement.date_debut, evenement.date_fin)
        )}</li>
        <li class="inline-flex items-center gap-1.5">${icone('lieu', 'h-4 w-4')}${esc(
          evenement.lieu || evenement.ville || 'Togo'
        )}</li>
        ${evenement.heure ? `<li class="inline-flex items-center gap-1.5">${icone('horloge', 'h-4 w-4')}${esc(evenement.heure)}</li>` : ''}
      </ul>
      <p class="mt-3 text-sm leading-relaxed ${texte}">${esc(tronquer(evenement.description, 165))}</p>
      ${chiffres ? `<ul class="mt-4 flex flex-wrap gap-x-6 gap-y-2">${chiffres}</ul>` : ''}
      <div class="mt-4 flex flex-wrap items-center gap-4">${action}</div>
    </div>
  </article>`;
}

export function ligneEvenement(evenement) {
  const { jour, mois } = jourMois(evenement.date_debut);
  return `
  <a href="competitions.html#${esc(evenement.id)}" class="revele group flex items-center gap-5 border-b border-sable-200 py-5 transition hover:bg-sable-50">
    <span class="grid h-14 w-14 flex-none place-items-center rounded-xl bg-vert-50 text-vert-800">
      <span class="text-center leading-none">
        <span class="block font-display text-base font-extrabold">${esc(jour)}</span>
        <span class="block text-[0.6rem] font-bold uppercase">${esc(mois)}</span>
      </span>
    </span>
    <span class="min-w-0 flex-1">
      <span class="block truncate font-display text-[1rem] font-semibold text-vert-950 group-hover:text-vert-700">${esc(evenement.titre)}</span>
      <span class="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-encre-clair">
        <span class="inline-flex items-center gap-1.5">${icone('lieu', 'h-3.5 w-3.5')}${esc(
          evenement.ville || evenement.lieu || 'Togo'
        )}</span>
        <span class="inline-flex items-center gap-1.5">${icone('onde', 'h-3.5 w-3.5')}${esc(
          evenement.discipline_id ? libelleDiscipline(evenement.discipline_id) : evenement.type
        )}</span>
      </span>
    </span>
    <span class="hidden flex-none text-sm text-encre-clair sm:block">${esc(
      evenement.periode || periode(evenement.date_debut, evenement.date_fin)
    )}</span>
    <span class="flex-none text-vert-600 transition group-hover:translate-x-1">${icone('chevron-droite', 'h-5 w-5')}</span>
  </a>`;
}

/* ------------------------------------------- événements (frise d'accueil) */
/* Frise d'accueil : chaque rendez-vous est une ligne photographique posée sur
   un rail vertical (le rail est dessiné par le conteneur de la zone). */
export function ligneEvenementAccueil(evenement) {
  const { jour, mois } = jourMois(evenement.date_debut);
  const photo = imageOuDefaut(evenement.image);
  const discipline = evenement.discipline_id
    ? libelleDiscipline(evenement.discipline_id)
    : 'Rendez-vous fédéral';

  const statut =
    evenement.statut === 'termine'
      ? badge(libelleStatut(evenement.statut), 'gris')
      : badge(libelleStatut(evenement.statut), 'soleil', 'horloge');

  return `
  <article class="revele group relative">
    <span class="absolute -left-[31px] top-8 h-3.5 w-3.5 rounded-full border-2 border-soleil-400 bg-vert-950 sm:-left-[39px]" aria-hidden="true"></span>
    <a href="competitions.html#${esc(evenement.id)}" class="flex gap-4 rounded-2xl border border-white/12 bg-white/[0.05] p-4 transition hover:border-soleil-400/60 hover:bg-white/[0.08] sm:gap-6 sm:p-5">
      <span class="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-vert-900 sm:h-32 sm:w-44">
        ${img(photo, evenement.titre, 'h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105', 'loading="lazy" decoding="async"', 1280, 900)}
        <span class="absolute left-2 top-2 grid h-12 w-12 place-items-center rounded-lg bg-soleil-400 text-vert-950">
          <span class="text-center leading-none">
            <span class="block font-display text-base font-extrabold">${esc(jour)}</span>
            <span class="block text-[0.58rem] font-bold uppercase tracking-wider">${esc(mois)}</span>
          </span>
        </span>
      </span>
      <span class="min-w-0 flex-1">
        <span class="flex flex-wrap items-center gap-2">
          ${statut}
          <span class="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-soleil-300">${esc(discipline)} · ${esc(evenement.type)}</span>
        </span>
        <span class="mt-2.5 block font-display text-base font-bold leading-snug text-white transition group-hover:text-soleil-200 sm:text-lg">${esc(evenement.titre)}</span>
        <span class="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-vert-50/75 sm:text-sm">
          <span class="inline-flex items-center gap-1.5">${icone('calendrier', 'h-4 w-4')}${esc(
            evenement.periode || periode(evenement.date_debut, evenement.date_fin)
          )}</span>
          <span class="inline-flex items-center gap-1.5">${icone('lieu', 'h-4 w-4')}${esc(
            evenement.lieu || evenement.ville || 'Togo'
          )}</span>
        </span>
      </span>
    </a>
  </article>`;
}

/* ---------------------------------------------------------------- galerie */
/* Légende d'une photographie. Le titre et les précisions sont facultatifs :
   certaines photos n'ont pas encore de légende publiée. */
const LEGENDE_GALERIE_DEFAUT = 'Photographie de la fédération';

function legendeGalerie(image) {
  const details = [image.lieu, image.date ? dateCourte(image.date) : null].filter(Boolean).join(' · ');
  const titre = image.titre || '';
  const texte = [titre, details].filter(Boolean).join(' - ');
  return { titre, details, texte, alt: texte || LEGENDE_GALERIE_DEFAUT };
}

const etiquetteCategorieGalerie = (categorie) =>
  categorie && categorie !== 'toutes'
    ? `<span class="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 font-display text-[0.6rem] font-bold uppercase tracking-wider text-vert-800">
          ${esc(libelleCategorieGalerie(categorie))}
        </span>`
    : '';

export function vignetteGalerie(image, { delai = 0, grande = false } = {}) {
  const photo = imageOuDefaut(image.src);
  const { titre, details, texte, alt } = legendeGalerie(image);
  const voile =
    titre || details
      ? `<figcaption class="galerie-item__voile">
      <span class="block">
        ${titre ? `<span class="block text-sm font-semibold">${esc(titre)}</span>` : ''}
        ${details ? `<span class="mt-0.5 block text-xs text-white/75">${esc(details)}</span>` : ''}
      </span>
    </figcaption>`
      : '';
  return `
  <figure class="revele galerie-item ${grande ? 'col-span-2 row-span-2 aspect-square' : 'aspect-[4/3]'}" data-delai="${delai}"
          data-legende="${esc(texte || alt)}">
    ${img(photo, alt, 'h-full w-full object-cover')}
    ${voile}
  </figure>`;
}

/* ------------------------------------------------ galerie (mur d'accueil) */
/* « Mur de photos » d'accueil : cadre blanc, légende sous l'image et léger
   devers (rotation passée par la page). Le clic ouvre la visionneuse. */
export function vignetteGalerieAccueil(image, { ratio = 'aspect-[4/3]', rotation = '', delai = 0 } = {}) {
  const photo = imageOuDefaut(image.src);
  const { titre, details, texte, alt } = legendeGalerie(image);
  const legendeVisible =
    titre || details
      ? `<figcaption class="px-1 pt-3">
        ${titre ? `<span class="block text-sm font-semibold leading-snug text-vert-950">${esc(titre)}</span>` : ''}
        ${details ? `<span class="mt-0.5 block text-xs text-encre-clair">${esc(details)}</span>` : ''}
      </figcaption>`
      : '';

  return `
  <div class="revele" data-delai="${delai}">
    <figure class="galerie-item group rounded-2xl border border-sable-200 bg-white p-2.5 ${titre || details ? 'pb-3' : ''} shadow-doux transition duration-500 hover:-translate-y-1.5 hover:rotate-0 hover:border-vert-200 hover:shadow-carte ${rotation}"
            data-legende="${esc(texte || alt)}">
      <span class="relative block ${ratio} overflow-hidden rounded-[0.75rem] bg-vert-900">
        ${img(photo, alt, 'h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105', 'loading="lazy" decoding="async"', 900, 900)}
        ${etiquetteCategorieGalerie(image.categorie)}
      </span>
      ${legendeVisible}
    </figure>
  </div>`;
}

/* ---------------------------------------------------------------- documents */
export const documentIndisponible = () =>
  `<span class="pastille pastille--gris flex-none">${icone('horloge', 'h-3.5 w-3.5')}Bientôt disponible</span>`;

export function ligneDocument(document) {
  const telechargeable = Boolean(document.fichier) && document.disponible !== false;
  return `
  <li class="revele flex flex-col gap-5 rounded-2xl border border-sable-200 bg-white p-6 transition hover:border-vert-200 sm:flex-row sm:items-center">
    <span class="grid h-12 w-12 flex-none place-items-center rounded-xl bg-vert-50 text-vert-700">${icone('fichier', 'h-5 w-5')}</span>
    <div class="flex-1">
      <div class="flex flex-wrap items-center gap-2">
        ${badge(document.categorie, 'vert')}
        ${document.statut ? badge(document.statut, 'gris') : ''}
      </div>
      <p class="mt-2 font-display text-base font-bold text-vert-950">${esc(document.titre)}</p>
      <p class="mt-1.5 text-sm leading-relaxed text-encre-doux">${esc(document.description)}</p>
      <p class="mt-2 text-xs text-encre-clair">${esc(document.format || 'PDF')} · mise à jour le ${esc(dateLongue(document.date_maj))}</p>
    </div>
    ${
      telechargeable
        ? `<a href="${esc(document.fichier)}" download data-document class="btn btn--contour btn--sm flex-none">
             ${icone('telechargement', 'h-4 w-4')}Télécharger</a>`
        : documentIndisponible()
    }
  </li>`;
}

/* ---------------------------------------------------------------- bureau exécutif */
export function carteMembre(membre, { delai = 0 } = {}) {
  return `
  <article class="revele group rounded-2xl border border-sable-200 bg-white p-6 text-center transition hover:border-vert-200 hover:shadow-carte" data-delai="${delai}">
    <span class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-vert-600 to-vert-900 font-display text-lg font-extrabold text-white shadow-doux">
      ${esc(membre.initiale || '')}
    </span>
    <p class="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-vert-600">${esc(membre.poste)}</p>
    <p class="mt-1 font-display text-base font-bold text-vert-950">${esc(membre.nom)}</p>
    <p class="mt-2 text-sm leading-relaxed text-encre-doux">${esc(membre.attribution)}</p>
  </article>`;
}

/* ---------------------------------------------------------------- partenaires */
export function cartePartenaire(partenaire) {
  const contenu = `
    <span class="grid h-12 w-12 flex-none place-items-center rounded-xl bg-vert-50 font-display text-sm font-bold text-vert-700">
      ${esc(partenaire.sigle || partenaire.nom.slice(0, 3).toUpperCase())}
    </span>
    <span class="min-w-0">
      <span class="block font-display text-sm font-bold leading-snug text-vert-950">${esc(partenaire.nom)}</span>
      <span class="mt-0.5 block text-xs text-encre-clair">${esc(libelleCategoriePartenaire(partenaire.categorie))}</span>
      <span class="mt-1 block text-[0.72rem] leading-snug text-encre-doux">${esc(partenaire.role || '')}</span>
    </span>`;

  if (partenaire.url) {
    return `
  <a href="${esc(partenaire.url)}" target="_blank" rel="noopener noreferrer"
     class="revele group flex items-center gap-4 rounded-2xl border border-sable-200 bg-white px-5 py-4 transition hover:border-vert-200 hover:shadow-doux"
     title="${esc(partenaire.nom)}">${contenu}</a>`;
  }

  return `
  <div class="revele flex items-center gap-4 rounded-2xl border border-sable-200 bg-white px-5 py-4" title="${esc(partenaire.nom)}">${contenu}</div>`;
}

/* ---------------------------------------------------------------- blocs d'en-tête de page */
export function bandeauPage({ titre, chapeau, image, fil, section, video }) {
  const miettes = [
    { libelle: 'Accueil', url: 'index.html' },
    ...(section ? [{ libelle: section, url: null }] : [])
  ];

  const page = typeof document !== 'undefined' ? document.body?.dataset?.page ?? '' : '';
  const lienVideo = video ?? videoHeroPage(page);

  const media = lienVideo
    ? `<video class="heros-media" autoplay muted loop playsinline preload="metadata"
         poster="${esc(image)}" aria-hidden="true" tabindex="-1">
         <source src="${esc(lienVideo)}" type="video/mp4">
       </video>`
    : img(image, titre, 'heros-media', 'fetchpriority="high" decoding="async"', 1920, 700);

  return `
  <section class="relative isolate flex min-h-[58vh] items-end overflow-hidden bg-vert-950 text-white lg:min-h-[62vh]">
    ${media}
    <div class="heros-voile absolute inset-0" aria-hidden="true"></div>
    <div class="relative mx-auto w-full max-w-ecran px-4 pb-12 pt-40 sm:px-6 lg:pb-16">
      <nav aria-label="Fil d'Ariane" class="apparition">
        <ol class="flex flex-wrap items-center gap-2 text-xs text-vert-100/80">
          ${miettes
            .map(
              (m, index) =>
                `<li class="flex items-center gap-2">${
                  m.url ? `<a href="${esc(m.url)}" class="transition hover:text-white">${esc(m.libelle)}</a>` : `<span class="text-soleil-300">${esc(m.libelle)}</span>`
                }${index < miettes.length - 1 ? icone('chevron-droite', 'h-3.5 w-3.5 opacity-60') : ''}</li>`
            )
            .join('')}
        </ol>
      </nav>
      <p class="apparition etiquette mt-6 text-soleil-300" style="animation-delay:.06s">${esc(fil || 'Fédération Togolaise de Canoë')}</p>
      <h1 class="apparition titre-fluide mt-4 max-w-3xl text-white" style="animation-delay:.12s">${esc(titre)}</h1>
      ${chapeau ? `<p class="apparition mt-5 max-w-2xl text-base leading-relaxed text-vert-50/90 sm:text-lg" style="animation-delay:.18s">${esc(chapeau)}</p>` : ''}
    </div>
    <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-vert-950 to-transparent" aria-hidden="true"></div>
  </section>`;
}

/* ---------------------------------------------------------------- l'essentiel */
export function blocEssentiel({ titre = "L'essentiel", points = [] } = {}) {
  if (!points.length) return '';
  return `
  <section class="border-b border-sable-200 bg-sable-50" aria-label="${esc(titre)}">
    <div class="mx-auto max-w-ecran px-4 py-10 sm:px-6 lg:py-12">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
        <p class="flex-none font-display text-sm font-bold uppercase tracking-[0.12em] text-vert-700">${esc(titre)}</p>
        <ul class="grid flex-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          ${points
            .map(
              (point) => `
          <li class="revele flex items-start gap-3">
            <span class="mt-0.5 flex-none text-vert-600">${icone(point.icone || 'check-cercle', 'h-5 w-5')}</span>
            <span>
              <span class="block font-display text-sm font-bold text-vert-950">${esc(point.titre)}</span>
              <span class="mt-1 block text-sm leading-relaxed text-encre-doux">${esc(point.texte)}</span>
            </span>
          </li>`
            )
            .join('')}
        </ul>
      </div>
    </div>
  </section>`;
}

/* ---------------------------------------------------------------- squelettes */
/** Bloc de chargement affiché lorsqu'une rubrique n'a pas encore de contenu. */
export function blocSquelette({
  titre = '',
  texte = '',
  nombre = 3,
  colonnes = 'sm:grid-cols-2 lg:grid-cols-3'
} = {}) {
  const cartes = Array.from(
    { length: nombre },
    () => `
    <div class="rounded-2xl border border-sable-200 bg-white p-6" aria-hidden="true">
      <div class="squelette h-11 w-11 rounded-xl"></div>
      <div class="squelette mt-5 h-4 w-2/3 rounded"></div>
      <div class="squelette mt-3 h-3 w-full rounded"></div>
      <div class="squelette mt-2 h-3 w-4/5 rounded"></div>
    </div>`
  ).join('');

  return `
  <div class="revele">
    ${titre ? `<p class="font-display text-lg font-bold text-vert-950">${esc(titre)}</p>` : ''}
    ${texte ? `<p class="mt-2 max-w-2xl text-sm leading-relaxed text-encre-doux">${esc(texte)}</p>` : ''}
    <div class="mt-6 grid gap-5 ${colonnes}">${cartes}</div>
  </div>`;
}

/** Message neutre pour une rubrique sans contenu. */
export const blocAConfirmer = (texte, { iconeNom = 'info' } = {}) =>
  `<p class="revele flex items-start gap-2.5 rounded-2xl border border-sable-200 bg-sable-50 px-5 py-4 text-sm leading-relaxed text-encre-doux">
     <span class="mt-0.5 flex-none text-vert-600">${icone(iconeNom, 'h-5 w-5')}</span>
     <span>${esc(texte)}</span>
   </p>`;
