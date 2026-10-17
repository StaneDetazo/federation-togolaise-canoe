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

/* ---------------------------------------------------------------- disciplines */
export function carteDiscipline(discipline) {
  const famille = familles().find((f) => f.id === discipline.famille)?.libelle ?? 'Discipline';
  return `
  <article class="revele carte group flex flex-col">
    <a href="disciplines.html#${esc(discipline.id)}" class="carte__media relative block aspect-[4/3] overflow-hidden bg-vert-900">
      ${img(discipline.image, discipline.nom, 'h-full w-full object-cover')}
      <span class="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-xl bg-white/95 text-vert-700 shadow-doux">
        ${icone(discipline.icone, 'h-5 w-5')}
      </span>
      ${discipline.olympique ? `<span class="absolute right-4 top-4">${badge('Discipline olympique', 'soleil', 'etoile')}</span>` : ''}
    </a>
    <div class="flex flex-1 flex-col p-6">
      <p class="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-vert-600">${esc(famille)}</p>
      <h3 class="mt-2 font-display text-lg font-bold leading-snug text-vert-950">
        <a href="disciplines.html#${esc(discipline.id)}" class="transition hover:text-vert-700">${esc(discipline.nom)}</a>
      </h3>
      <p class="mt-2.5 text-sm leading-relaxed text-encre-doux">${esc(discipline.accroche)}</p>
      <div class="mt-4 flex flex-wrap gap-1.5">
        ${(discipline.embarcations || []).slice(0, 3).map((e) => badge(e, 'gris')).join('')}
      </div>
      <a href="disciplines.html#${esc(discipline.id)}" class="lien-fleche mt-auto pt-5 text-sm font-semibold text-vert-700">
        En savoir plus ${icone('fleche-droite', 'h-4 w-4')}
      </a>
    </div>
  </article>`;
}

/* ------------------------------------------- disciplines (tuiles d'accueil) */
/* Photos d'illustration libres (Wikimedia Commons), par discipline.
   La fédération peut les remplacer par ses propres clichés : il suffit de
   changer l'URL ci-dessous (voir README, section images externes). */
const PHOTOS_DISCIPLINES = {
  'course-en-ligne':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/2014_ICF_Canoe_Sprint_World_Championships_-_Race_120_-_K1_M_500_-_Semi_-_Final_2.jpg/1280px-2014_ICF_Canoe_Sprint_World_Championships_-_Race_120_-_K1_M_500_-_Semi_-_Final_2.jpg',
  'descente-eau-vive':
    'https://upload.wikimedia.org/wikipedia/commons/f/f6/Whitewater_kayaker_classIV.jpg',
  slalom:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/2022_ICF_Canoe_Slalom_World_Championships_-_Noemie_Fox_-_Australia_-_by_2eight_-_9SC9396.jpg/1280px-2022_ICF_Canoe_Slalom_World_Championships_-_Noemie_Fox_-_Australia_-_by_2eight_-_9SC9396.jpg',
  'kayak-polo':
    'https://upload.wikimedia.org/wikipedia/commons/1/12/Dva_hr%C3%A1%C4%8Di_kanoepola_sprintuj%C3%AD_pro_m%C3%AD%C4%8D%2C_Praha.JPG',
  'dragon-boat':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/ICF_World_Dragon_Boat_Championships_2012_Swedish_Senior_National_Team_Men_Silver_2000_Meter.JPG/1280px-ICF_World_Dragon_Boat_Championships_2012_Swedish_Senior_National_Team_Men_Silver_2000_Meter.JPG',
  'vaa-pirogue':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Va%27a_outrigger_canoeing_crews_for_the_men%27s_V6_event_at_the_2011_Pacific_Games.jpg/1280px-Va%27a_outrigger_canoeing_crews_for_the_men%27s_V6_event_at_the_2011_Pacific_Games.jpg',
  'stand-up-paddle':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Man_Stand_Up_paddle_boarding_on_Calm_sea_water_%2852829654245%29.jpg/1280px-Man_Stand_Up_paddle_boarding_on_Calm_sea_water_%2852829654245%29.jpg',
  'randonnee-nautique':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/2017_Sarasota_Adventure_Kayak_Guided_Tour_the_Fleet_02_FRD_9380.jpg/1280px-2017_Sarasota_Adventure_Kayak_Guided_Tour_the_Fleet_02_FRD_9380.jpg',
  paracanoe:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Paracanoe_at_the_2024_Summer_Paralympics_-_September_6_62.jpg/1280px-Paracanoe_at_the_2024_Summer_Paralympics_-_September_6_62.jpg',
  freestyle: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/C1_Playboat.jpg'
};

/* Tuile photographique plein cadre : la première discipline est mise en avant
   (2 colonnes × 2 lignes) sur les grands écrans. */
export function carteDisciplineAccueil(discipline, index = 0) {
  const famille = familles().find((f) => f.id === discipline.famille)?.libelle ?? 'Discipline';
  const photo = PHOTOS_DISCIPLINES[discipline.id] ?? discipline.image;
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
        ${grand ? `<p class="mt-3 max-w-md text-sm leading-relaxed text-vert-50/85">${esc(discipline.accroche)}</p>` : ''}
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
    ${
      discipline.olympique
        ? `<span class="pointer-events-none absolute right-5 top-5">${badge('Olympique', 'soleil', 'etoile')}</span>`
        : ''
    }
  </article>`;
}

/* ---------------------------------------------------------------- actualités */
export function carteArticle(article, { variante = 'grille' } = {}) {
  const lien = `article.html?slug=${encodeURIComponent(article.slug)}`;
  const compact = variante === 'compact';

  return `
  <article class="revele carte group flex flex-col">
    <a href="${lien}" class="carte__media relative block ${compact ? 'aspect-[16/9]' : 'aspect-[16/10]'} overflow-hidden bg-vert-900">
      ${img(article.image, article.titre, 'h-full w-full object-cover')}
      <span class="absolute left-4 top-4">${badge(libelleCategorie(article.categorie), 'soleil')}</span>
    </a>
    <div class="flex flex-1 flex-col p-6">
      <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-encre-clair">
        <span class="inline-flex items-center gap-1.5">${icone('calendrier', 'h-3.5 w-3.5')}${esc(dateLongue(article.date))}</span>
        ${article.lieu ? `<span class="inline-flex items-center gap-1.5">${icone('lieu', 'h-3.5 w-3.5')}${esc(article.lieu)}</span>` : ''}
      </p>
      <h3 class="mt-3 font-display text-[1.08rem] font-bold leading-snug text-vert-950">
        <a href="${lien}" class="transition hover:text-vert-700">${esc(article.titre)}</a>
      </h3>
      <p class="mt-2.5 text-sm leading-relaxed text-encre-doux">${esc(tronquer(article.chapeau, 150))}</p>
      <div class="mt-auto flex items-center justify-between gap-3 pt-5">
        <a href="${lien}" class="lien-fleche text-sm font-semibold text-vert-700">
          Lire l'article ${icone('fleche-droite', 'h-4 w-4')}
        </a>
        <span class="text-xs text-encre-clair">${esc(String(article.temps_lecture || 3))} min</span>
      </div>
    </div>
  </article>`;
}

/* ------------------------------------------- actualités (bloc d'accueil) */
/* Photos d'illustration libres (Wikimedia Commons), par article.
   La fédération peut les remplacer par ses propres clichés : il suffit de
   changer l'URL ci-dessous (voir README, section images externes). */
const PHOTOS_ACTUALITES = {
  'calendrier-saison-2026-2027-publie':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/5000m_K1_Final_Kanu-WM_Duisburg_2013.JPG/1280px-5000m_K1_Final_Kanu-WM_Duisburg_2013.JPG',
  'trophee-des-lagunes-inscriptions-ouvertes':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/2014_ICF_Canoe_Sprint_World_Championships_-_Race_173_-_K4_W_500_-_VC.jpg/1280px-2014_ICF_Canoe_Sprint_World_Championships_-_Race_173_-_K4_W_500_-_VC.jpg',
  'pagaie-a-lecole-objectifs-saison':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Rudyard_Reservoir_-_school_children_preparing_to_go_canoeing_-_geograph.org.uk_-_7679169.jpg/1280px-Rudyard_Reservoir_-_school_children_preparing_to_go_canoeing_-_geograph.org.uk_-_7679169.jpg',
  'paracanoe-deuxieme-phase':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Paracanoe_at_the_2024_Summer_Paralympics_-_September_6_71.jpg/1280px-Paracanoe_at_the_2024_Summer_Paralympics_-_September_6_71.jpg',
  'championnat-national-2026-togoville':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2014_ICF_Canoe_Sprint_World_Championships_-_Race_178_-_C4_M_1000_-_VC.jpg/1280px-2014_ICF_Canoe_Sprint_World_Championships_-_Race_178_-_C4_M_1000_-_VC.jpg',
  'stage-rentree-collectif-national':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Kayak_races_150124-F-BD983-027.jpg/1280px-Kayak_races_150124-F-BD983-027.jpg',
  'formation-onze-educateurs-diplomes':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Children_and_instructors_canoeing_on_the_Staffs_%5E_Worcs_-_geograph.org.uk_-_7398836.jpg/1280px-Children_and_instructors_canoeing_on_the_Staffs_%5E_Worcs_-_geograph.org.uk_-_7398836.jpg',
  'portrait-sena-dogbe':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/2022_ICF_Canoe_Slalom_World_Championships_-_Noemie_Fox_-_Australia_-_by_2eight_-_9SC9396.jpg/1280px-2022_ICF_Canoe_Slalom_World_Championships_-_Noemie_Fox_-_Australia_-_by_2eight_-_9SC9396.jpg',
  'operation-lagune-propre':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Stand_Up_Paddle_Boarding_%2851126723395%29.jpg/1280px-Stand_Up_Paddle_Boarding_%2851126723395%29.jpg'
};

/* Bloc d'accueil : une « une » éditoriale bien visible, puis des brèves
   horizontales. La page Actualités conserve, elle, la carte standard. */
export function carteArticleAccueil(article, { vedette = false } = {}) {
  const lien = `article.html?slug=${encodeURIComponent(article.slug)}`;
  const photo = PHOTOS_ACTUALITES[article.slug] ?? article.image;
  const categorie = libelleCategorie(article.categorie);
  const meta = [
    dateLongue(article.date),
    article.lieu,
    `${article.temps_lecture || 3} min de lecture`
  ]
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
    </a>
  </article>`;
}

/* ---------------------------------------------------------------- clubs */
export function carteClub(club, { variante = 'carte' } = {}) {
  const disciplinesBadges = (club.disciplines || [])
    .slice(0, 3)
    .map((id) => badge(libelleDiscipline(id), 'vert'))
    .join('');
  const reste = (club.disciplines || []).length - 3;

  if (variante === 'liste') {
    return `
    <article class="revele carte group flex flex-col overflow-hidden sm:flex-row">
      <a href="club.html?id=${encodeURIComponent(club.id)}" class="carte__media relative block aspect-[16/10] w-full shrink-0 overflow-hidden bg-vert-900 sm:aspect-auto sm:w-64">
        ${img(club.image, club.nom, 'h-full w-full object-cover')}
      </a>
      <div class="flex flex-1 flex-col p-6">
        <div class="flex flex-wrap items-center gap-2">
          ${badge(nomRegion(club.region), 'sombre', 'lieu')}
          ${badge(club.sigle, 'gris')}
          ${(club.labels || []).slice(0, 1).map((l) => badge(l, 'soleil')).join('')}
        </div>
        <h3 class="mt-3 font-display text-lg font-bold text-vert-950">
          <a href="club.html?id=${encodeURIComponent(club.id)}" class="transition hover:text-vert-700">${esc(club.nom)}</a>
        </h3>
        <p class="mt-1 text-sm text-encre-clair">${esc(club.ville)} - ${esc(club.site_pratique)}</p>
        <p class="mt-3 text-sm leading-relaxed text-encre-doux">${esc(tronquer(club.presentation, 170))}</p>
        <div class="mt-4 flex flex-wrap gap-1.5">${disciplinesBadges}${reste > 0 ? badge(`+${reste}`, 'gris') : ''}</div>
      </div>
    </article>`;
  }

  return `
  <article class="revele carte group flex flex-col">
    <a href="club.html?id=${encodeURIComponent(club.id)}" class="carte__media relative block aspect-[16/10] overflow-hidden bg-vert-900">
      ${img(club.image, club.nom, 'h-full w-full object-cover')}
      <span class="absolute left-4 top-4">${badge(nomRegion(club.region), 'sombre', 'lieu')}</span>
      <span class="absolute bottom-4 right-4 rounded-full bg-white/95 px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-vert-800">
        Depuis ${esc(String(club.annee_creation))}
      </span>
    </a>
    <div class="flex flex-1 flex-col p-6">
      <h3 class="font-display text-lg font-bold leading-snug text-vert-950">
        <a href="club.html?id=${encodeURIComponent(club.id)}" class="transition hover:text-vert-700">${esc(club.nom)}</a>
      </h3>
      <p class="mt-1.5 flex items-center gap-1.5 text-sm text-encre-clair">
        ${icone('lieu', 'h-4 w-4 text-vert-600')}${esc(club.ville)} - ${esc(club.site_pratique)}
      </p>
      <p class="mt-3 text-sm leading-relaxed text-encre-doux">${esc(tronquer(club.presentation, 145))}</p>
      <div class="mt-4 flex flex-wrap gap-1.5">${disciplinesBadges}${reste > 0 ? badge(`+${reste}`, 'gris') : ''}</div>
      <div class="mt-auto flex items-center justify-between gap-3 border-t border-sable-200 pt-5">
        <span class="text-xs text-encre-clair">${esc(club.effectif || '')}</span>
        <a href="club.html?id=${encodeURIComponent(club.id)}" class="lien-fleche text-sm font-semibold text-vert-700">
          Voir le club ${icone('fleche-droite', 'h-4 w-4')}
        </a>
      </div>
    </div>
  </article>`;
}

/* ------------------------------------------------ clubs (cartes d'accueil) */
/* Photos d'illustration libres (Wikimedia Commons), par club : la fédération
   peut les remplacer par ses propres clichés en changeant l'URL ci-dessous
   (voir README, section images externes). */
const PHOTOS_CLUBS = {
  'club-nautique-lome':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Lome_Beach_Togo_2.jpg/1280px-Lome_Beach_Togo_2.jpg',
  dzogbenyui:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Baguida_-_Togo.jpg/1280px-Baguida_-_Togo.jpg',
  'pagaies-du-mono':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/FLEUVE_MONO_AU_CREPUSCULE.jpg/1280px-FLEUVE_MONO_AU_CREPUSCULE.jpg',
  'pagaies-du-lac':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Togoville_harbour.jpg/1280px-Togoville_harbour.jpg',
  'canoe-atakpame':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Barrage_-de_Nangb%C3%A9to_07.jpg/1280px-Barrage_-de_Nangb%C3%A9to_07.jpg',
  'kpalime-kayak':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Kpalime_mountain_range.jpg/1280px-Kpalime_mountain_range.jpg',
  'canoe-sokode':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Canoe_Training_at_HM_%2827579943322%29.jpg/1280px-Canoe_Training_at_HM_%2827579943322%29.jpg',
  'kara-paddle':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Canoe_Training_at_HM_%2827645679126%29.jpg/1280px-Canoe_Training_at_HM_%2827645679126%29.jpg',
  'dapaong-nautique':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Mare_aux_hippopotames_de_Koumbeloti_%C3%A0_Mango_%28Region_des_savanes%29.jpg/1280px-Mare_aux_hippopotames_de_Koumbeloti_%C3%A0_Mango_%28Region_des_savanes%29.jpg'
};

/* « Carte postale » d'accueil : cadre blanc, photo encadrée, cachet du sigle.
   Le décalage vertical (colonne du milieu) est passé par la page. */
export function carteClubAccueil(club, { decalage = '' } = {}) {
  const photo = PHOTOS_CLUBS[club.id] ?? club.image;
  const disciplinesBadges = (club.disciplines || [])
    .slice(0, 3)
    .map((id) => badge(libelleDiscipline(id), 'vert'))
    .join('');
  const reste = (club.disciplines || []).length - 3;

  return `
  <article class="revele group flex h-full flex-col rounded-[1.75rem] border border-sable-200 bg-white p-3 shadow-doux transition duration-500 hover:-translate-y-1.5 hover:border-vert-200 hover:shadow-carte ${decalage}">
    <a href="club.html?id=${encodeURIComponent(club.id)}" class="flex h-full flex-col">
      <span class="relative block aspect-[4/3] overflow-hidden rounded-[1.3rem] bg-vert-900">
        ${img(photo, `${club.nom} - ${club.site_pratique}`, 'h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105', 'loading="lazy" decoding="async"', 1280, 960)}
        <span class="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-vert-950/75 to-transparent"></span>
        <span class="absolute left-3 top-3">${badge(nomRegion(club.region), 'sombre', 'lieu')}</span>
        <span class="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/95 py-1 pl-1.5 pr-3.5">
          <span class="grid h-7 min-w-7 place-items-center rounded-full bg-vert-800 px-1 font-display text-[0.6rem] font-bold tracking-wide text-white">${esc(club.sigle)}</span>
          <span class="font-display text-[0.68rem] font-bold uppercase tracking-wider text-vert-800">Depuis ${esc(String(club.annee_creation))}</span>
        </span>
      </span>

      <span class="flex flex-1 flex-col px-2 pb-1 pt-5">
        <span class="block font-display text-lg font-bold leading-snug text-vert-950 transition group-hover:text-vert-700">${esc(club.nom)}</span>
        <span class="mt-1.5 flex items-center gap-1.5 text-sm text-encre-clair">
          ${icone('lieu', 'h-4 w-4 shrink-0 text-vert-600')}${esc(club.ville)} · ${esc(club.site_pratique)}
        </span>
        <span class="mt-3.5 block text-sm leading-relaxed text-encre-doux">${esc(tronquer(club.presentation, 118))}</span>
        <span class="mt-4 flex flex-wrap gap-1.5">${disciplinesBadges}${reste > 0 ? badge(`+${reste}`, 'gris') : ''}</span>
        <span class="mt-auto flex items-center justify-between gap-3 border-t border-sable-200 pt-4">
          <span class="text-xs text-encre-clair">${esc(club.effectif || '')}</span>
          <span class="lien-fleche text-sm font-semibold text-vert-700">
            Voir le club ${icone('fleche-droite', 'h-4 w-4')}
          </span>
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

  const action = evenement.statut === 'termine' && evenement.resultats?.publies
    ? `<a href="competitions.html#resultats" class="lien-fleche text-sm font-semibold ${sombre ? 'text-soleil-300' : 'text-vert-700'}">Voir les résultats ${icone('fleche-droite', 'h-4 w-4')}</a>`
    : evenement.inscription?.ouverte
      ? `<span class="pastille pastille--${sombre ? 'sombre' : 'vert'}">${icone('check', 'h-3.5 w-3.5')}Inscriptions ouvertes</span>`
      : `<span class="pastille pastille--${sombre ? 'sombre' : 'gris'}">Bientôt</span>`;

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
        <li class="inline-flex items-center gap-1.5">${icone('calendrier', 'h-4 w-4')}${esc(periode(evenement.date_debut, evenement.date_fin))}</li>
        <li class="inline-flex items-center gap-1.5">${icone('lieu', 'h-4 w-4')}${esc(evenement.lieu)}</li>
        ${evenement.heure ? `<li class="inline-flex items-center gap-1.5">${icone('horloge', 'h-4 w-4')}${esc(evenement.heure)}</li>` : ''}
      </ul>
      <p class="mt-3 text-sm leading-relaxed ${texte}">${esc(tronquer(evenement.description, 165))}</p>
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
        <span class="inline-flex items-center gap-1.5">${icone('lieu', 'h-3.5 w-3.5')}${esc(evenement.ville)}</span>
        <span class="inline-flex items-center gap-1.5">${icone('onde', 'h-3.5 w-3.5')}${esc(
          evenement.discipline_id ? libelleDiscipline(evenement.discipline_id) : evenement.type
        )}</span>
      </span>
    </span>
    <span class="hidden flex-none text-sm text-encre-clair sm:block">${esc(periode(evenement.date_debut, evenement.date_fin))}</span>
    <span class="flex-none text-vert-600 transition group-hover:translate-x-1">${icone('chevron-droite', 'h-5 w-5')}</span>
  </a>`;
}

/* ------------------------------------------- événements (frise d'accueil) */
/* Photos d'illustration libres (Wikimedia Commons), par événement.
   La fédération peut les remplacer par ses propres clichés : il suffit de
   changer l'URL ci-dessous (voir README, section images externes). */
const PHOTOS_EVENEMENTS = {
  'ev-2026-11-ag-ordinaire':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Lome_Beach_Togo_1.jpg/1280px-Lome_Beach_Togo_1.jpg',
  'ev-2026-11-trophee-lagunes-1':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Canoe_Moscow_2016_-_Final_A_-_K1_Men_1000m_-_Pimenta_claims_gold.jpg/1280px-Canoe_Moscow_2016_-_Final_A_-_K1_Men_1000m_-_Pimenta_claims_gold.jpg',
  'ev-2026-12-stage-national':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Flat_Water_Canoe_Training_at_HM_%2827520145621%29.jpg/1280px-Flat_Water_Canoe_Training_at_HM_%2827520145621%29.jpg',
  'ev-2027-01-coupe-mono':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Kayaking_-_Rapides_du_Pont_Champlain%2C_Outaouais%2C_QC.JPG/1280px-Kayaking_-_Rapides_du_Pont_Champlain%2C_Outaouais%2C_QC.JPG',
  'ev-2027-02-formation-educateur':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Children_and_instructors_canoeing_on_the_Staffs_%5E_Worcs_-_geograph.org.uk_-_7398836.jpg/1280px-Children_and_instructors_canoeing_on_the_Staffs_%5E_Worcs_-_geograph.org.uk_-_7398836.jpg',
  'ev-2027-03-regate-dragon-boat':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Ginowan_Dragon_Boat_Racing_%289180131%29.jpg/1280px-Ginowan_Dragon_Boat_Racing_%289180131%29.jpg',
  'ev-2027-04-pagaie-ecole':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Kids_in_kayaks_7011c.JPG/1280px-Kids_in_kayaks_7011c.JPG',
  'ev-2027-05-championnat-national':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2014_ICF_Canoe_Sprint_World_Championships_-_Race_178_-_C4_M_1000_-_VC.jpg/1280px-2014_ICF_Canoe_Sprint_World_Championships_-_Race_178_-_C4_M_1000_-_VC.jpg',
  'ev-2027-06-kayak-polo':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/H%26_S%3B_Bn_Participates_in_Kayak_Polo_140814-M-SO289-042.jpg/1280px-H%26_S%3B_Bn_Participates_in_Kayak_Polo_140814-M-SO289-042.jpg',
  'ev-2027-07-trophee-sup':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Woman_stand_up_paddle_surfing.jpg/1280px-Woman_stand_up_paddle_surfing.jpg'
};

/* Frise d'accueil : chaque rendez-vous est une ligne photographique posée sur
   un rail vertical (le rail est dessiné par le conteneur de la zone). */
export function ligneEvenementAccueil(evenement) {
  const { jour, mois } = jourMois(evenement.date_debut);
  const photo = PHOTOS_EVENEMENTS[evenement.id] ?? evenement.image;
  const discipline = evenement.discipline_id
    ? libelleDiscipline(evenement.discipline_id)
    : 'Rendez-vous fédéral';
  const restant = joursRestants(evenement.date_debut);

  const statut =
    evenement.statut === 'a_venir'
      ? badge(restant > 0 && restant <= 30 ? `Dans ${restant} j` : 'À venir', 'soleil', 'horloge')
      : badge(libelleStatut(evenement.statut), evenement.statut === 'termine' ? 'gris' : 'soleil');

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
          <span class="inline-flex items-center gap-1.5">${icone('calendrier', 'h-4 w-4')}${esc(periode(evenement.date_debut, evenement.date_fin))}</span>
          <span class="inline-flex items-center gap-1.5">${icone('lieu', 'h-4 w-4')}${esc(evenement.lieu || evenement.ville)}</span>
        </span>
      </span>
    </a>
  </article>`;
}

/* ---------------------------------------------------------------- galerie */
export function vignetteGalerie(image, { delai = 0, grande = false } = {}) {
  return `
  <figure class="revele galerie-item ${grande ? 'col-span-2 row-span-2 aspect-square' : 'aspect-[4/3]'}" data-delai="${delai}"
          data-legende="${esc(image.titre)} - ${esc(image.lieu)}">
    ${img(image.src, image.titre, 'h-full w-full object-cover')}
    <figcaption class="galerie-item__voile">
      <span class="block">
        <span class="block text-sm font-semibold">${esc(image.titre)}</span>
        <span class="mt-0.5 block text-xs text-white/75">${esc(image.lieu)} · ${esc(dateCourte(image.date))}</span>
      </span>
    </figcaption>
  </figure>`;
}

/* ------------------------------------------------ galerie (mur d'accueil) */
/* Photos libres (Wikimedia Commons), par photo de la galerie. La fédération
   peut les remplacer par ses propres clichés en changeant l'URL ci-dessous
   (voir README, section images externes). */
const PHOTOS_GALERIE = {
  g1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Canoe_Moscow_2016_-_Maryna_Litvinchuk.jpg/1280px-Canoe_Moscow_2016_-_Maryna_Litvinchuk.jpg',
  g2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/YR_Canoe_Instructor_vs._5th_Graders_%2826351251134%29.jpg/1280px-YR_Canoe_Instructor_vs._5th_Graders_%2826351251134%29.jpg',
  g3: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/A_past_program_brought_youth_to_the_park_to_kayak._%28148442eb-71df-4920-b434-09f7c6d4ea86%29.JPG/1280px-A_past_program_brought_youth_to_the_park_to_kayak._%28148442eb-71df-4920-b434-09f7c6d4ea86%29.JPG',
  g4: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Gimnazjum_j%C3%B3zef%C3%B3w-sp%C5%82yw.jpg/1280px-Gimnazjum_j%C3%B3zef%C3%B3w-sp%C5%82yw.jpg',
  g5: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/YR_Canoe_Instructor_vs._5th_Graders_%2826923003916%29.jpg/1280px-YR_Canoe_Instructor_vs._5th_Graders_%2826923003916%29.jpg',
  g6: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Hazard_Creek_Kayaker.JPG/1280px-Hazard_Creek_Kayaker.JPG',
  g7: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Paracanoe_at_the_2024_Summer_Paralympics_-_September_6_43.jpg/1280px-Paracanoe_at_the_2024_Summer_Paralympics_-_September_6_43.jpg',
  g8: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Eastern_District_Dragon_Boat_Race_-_2008-06-01_09h52m48s_SN201360.jpg/1280px-Eastern_District_Dragon_Boat_Race_-_2008-06-01_09h52m48s_SN201360.jpg',
  g9: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Coucher_de_soleil_1_%E2%80%93_Avepozo.jpg/1280px-Coucher_de_soleil_1_%E2%80%93_Avepozo.jpg',
  g10: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Lac_Togo_Vogan.jpg/1280px-Lac_Togo_Vogan.jpg',
  g11: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Togoville%2C_Togo_view.jpg/1280px-Togoville%2C_Togo_view.jpg',
  g12: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Paysage_du_barrage_Nangbeto_01.jpg/1280px-Paysage_du_barrage_Nangbeto_01.jpg'
};

/* « Mur de photos » d'accueil : cadre blanc, légende sous l'image et léger
   devers (rotation passée par la page). Le clic ouvre la visionneuse. */
export function vignetteGalerieAccueil(image, { ratio = 'aspect-[4/3]', rotation = '', delai = 0 } = {}) {
  const photo = PHOTOS_GALERIE[image.id] ?? image.src;
  const legende = `${image.titre} - ${image.lieu}`;

  return `
  <div class="revele" data-delai="${delai}">
    <figure class="galerie-item group rounded-2xl border border-sable-200 bg-white p-2.5 pb-3 shadow-doux transition duration-500 hover:-translate-y-1.5 hover:rotate-0 hover:border-vert-200 hover:shadow-carte ${rotation}"
            data-legende="${esc(legende)}">
      <span class="relative block ${ratio} overflow-hidden rounded-[0.75rem] bg-vert-900">
        ${img(photo, legende, 'h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105', 'loading="lazy" decoding="async"', 900, 900)}
        <span class="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 font-display text-[0.6rem] font-bold uppercase tracking-wider text-vert-800">
          ${esc(libelleCategorieGalerie(image.categorie))}
        </span>
      </span>
      <figcaption class="px-1 pt-3">
        <span class="block text-sm font-semibold leading-snug text-vert-950">${esc(image.titre)}</span>
        <span class="mt-0.5 block text-xs text-encre-clair">${esc(image.lieu)} · ${esc(dateCourte(image.date))}</span>
      </figcaption>
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
  return `
  <a href="${esc(partenaire.url || '#')}" ${partenaire.url ? 'target="_blank" rel="noopener noreferrer"' : 'aria-disabled="true"'}
     class="revele group flex items-center gap-4 rounded-2xl border border-sable-200 bg-white px-5 py-4 transition hover:border-vert-200 hover:shadow-doux"
     title="${esc(partenaire.nom)}">
    <span class="grid h-14 w-20 flex-none place-items-center overflow-hidden rounded-xl bg-sable-50">
      ${img(partenaire.logo, `Logo ${partenaire.nom}`, 'h-9 w-auto object-contain', 'loading="lazy"', 320, 150)}
    </span>
    <span class="min-w-0">
      <span class="block truncate font-display text-sm font-bold text-vert-950">${esc(partenaire.nom)}</span>
      <span class="mt-0.5 block text-xs text-encre-clair">${esc(
        libelleCategoriePartenaire(partenaire.categorie)
      )}${partenaire.depuis ? ` · depuis ${esc(partenaire.depuis)}` : ''}</span>
      <span class="mt-1 block text-[0.72rem] leading-snug text-encre-doux">${esc(tronquer(partenaire.apport, 78))}</span>
    </span>
  </a>`;
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
