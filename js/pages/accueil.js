/* ==========================================================================
   FETOC - Page d'accueil
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import {
  data,
  site,
  disciplines,
  chiffresCles,
  agenda,
  articlesRecents,
  clubsMisEnAvant,
  imagesGalerie,
  partenairesAffiches,
  clubs,
  videoHeroPage
} from '../core/data.js';
import {
  carteDisciplineAccueil,
  carteArticleAccueil,
  carteClubAccueil,
  ligneEvenementAccueil,
  vignetteGalerieAccueil,
  cartePartenaire,
  blocSquelette
} from '../core/cartes.js';
import { qs, esc } from '../core/utils.js';
import { icone as svg } from '../core/icons.js';

demarrer().then(() => rendre());

function rendre() {
  const identite = site();
  const federation = data.federation ?? {};
  const cles = chiffresCles();
  const cle = (id) => cles.find((c) => c.id === id)?.valeur ?? '';

  /* ------------------------------------------------ vidéo de fond du héros */
  const videoHero = qs('#heros-video');
  const lienVideo = videoHeroPage('accueil');
  const mouvementReduit =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (videoHero && lienVideo && !mouvementReduit) {
    videoHero.src = lienVideo;
    videoHero.load();
    videoHero.play?.().catch(() => {});
  }

  /* ------------------------------------------------ bannière principale */
  qs('[data-zone="heros-accroche"]').textContent = identite.accroche || '';

  const reperes = [
    {
      libelle: 'Clubs affiliés',
      valeur: cle('clubs') || String(clubs().length),
      detail: 'engagés au championnat national 2025'
    },
    {
      libelle: 'Athlètes engagés',
      valeur: cle('athetes'),
      detail: 'championnat national 2025'
    },
    {
      libelle: 'Création de la fédération',
      valeur: cle('creation'),
      detail: 'Agbodrafo, préfecture des Lacs'
    }
  ];
  qs('[data-zone="heros-infos"]').innerHTML = reperes
    .map(
      (r) => `
      <div>
        <p class="stat__num text-soleil-300">${esc(r.valeur)}</p>
        <p class="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-white">${esc(r.libelle)}</p>
        <p class="mt-1 text-xs leading-snug text-vert-50/70">${esc(r.detail)}</p>
      </div>`
    )
    .join('');

  const badge = qs('[data-zone="heros-badge"]');
  if (badge) {
    badge.innerHTML = `<b>${cle('clubs') || clubs().length}</b> <span>clubs affiliés au Togo</span>`;
  }

  /* ------------------------------------------------ la fédération en bref */
  qs('[data-zone="bref-titre"]').textContent = federation.presentation?.titre || '';
  qs('[data-zone="bref-texte"]').innerHTML = (federation.presentation?.paragraphes || [])
    .slice(0, 2)
    .map((p) => `<p>${esc(p)}</p>`)
    .join('');

  /* photo de l'encadré (facultative) : la source peut être modifiée via les données */
  const imgBref = qs('[data-zone="bref-image"]');
  const imageBref = federation.presentation?.image;
  if (imgBref && imageBref) imgBref.src = imageBref;

  /* ------------------------------------------------ chiffres clés (optionnels) */
  const zoneChiffres = qs('[data-zone="chiffres-cles"]');
  if (cles.length && zoneChiffres) {
    // Bandeau de chiffres fusionné dans l'encadré « La fédération en bref » :
    // pas de titre (déjà porté par l'encadré), juste les valeurs et leurs libellés.
    zoneChiffres.className = 'border-t border-sable-200';
    zoneChiffres.innerHTML = `
      <dl class="grid grid-cols-2 lg:grid-cols-4">
        ${cles
          .map((c) => {
            const numerique = /^\d+$/.test(String(c.valeur));
            return `<div class="p-5 sm:p-6">
              <dd class="pastille-chiffre font-display text-2xl font-extrabold text-vert-950">
                ${numerique ? `<span data-compteur="${esc(c.valeur)}">0</span>` : esc(c.valeur)}${esc(c.suffixe || '')}
              </dd>
              <dt class="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-encre-doux">${esc(c.libelle)}</dt>
            </div>`;
          })
          .join('')}
      </dl>`;
  }

  /* ------------------------------------------------ disciplines */
  qs('[data-zone="disciplines-chapeau"]').textContent = data.disciplines?.entete?.chapeau || '';
  const listeDisciplines = (disciplines().filter((d) => d.a_la_une).length
    ? disciplines().filter((d) => d.a_la_une)
    : disciplines()
  ).slice(0, 6);
  qs('[data-zone="disciplines-grille"]').innerHTML = listeDisciplines
    .map((d, index) => carteDisciplineAccueil(d, index))
    .join('');

  /* ------------------------------------------------ actualités */
  const articles = articlesRecents(3);
  const [une, ...breves] = articles;
  const zoneActualites = qs('[data-zone="actualites-grille"]');
  if (une) {
    zoneActualites.innerHTML = `
      <div class="grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
        ${carteArticleAccueil(une, { vedette: true })}
        <div class="flex flex-col gap-6 sm:gap-8">${breves
          .map((article) => carteArticleAccueil(article))
          .join('')}</div>
      </div>`;
  }

  /* ------------------------------------------------ rendez-vous publiés */
  const evenements = agenda({ limite: 4 }).reverse();
  const zoneEvenements = qs('[data-zone="evenements-liste"]');
  if (evenements.length) {
    zoneEvenements.innerHTML = `
      <div class="flex flex-col gap-5 border-l border-white/15 pl-6 sm:pl-8">
        ${evenements.map((e) => ligneEvenementAccueil(e)).join('')}
      </div>`;
  } else {
    zoneEvenements.innerHTML = `
      <div class="rounded-2xl border border-dashed border-white/25 bg-white/[0.04] px-8 py-12 text-center">
        <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/10 text-soleil-300">${svg('calendrier', 'h-6 w-6')}</span>
        <p class="mt-4 font-display text-lg font-bold text-white">Aucun rendez-vous publié</p>
        <p class="mx-auto mt-2 max-w-md text-sm text-vert-50/75">
          Les prochaines dates seront publiées dès leur communication par la fédération.
        </p>
        <a href="competitions.html" class="btn btn--soleil mt-6">Voir les compétitions &amp; résultats</a>
      </div>`;
  }

  /* ------------------------------------------------ clubs affiliés */
  const totalClubs = cle('clubs') || String(clubs().length);
  const indexInfo = `
    <aside class="lg:sticky lg:top-24 lg:self-start">
      <p class="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-encre-clair">Clubs affiliés</p>
      <p class="mt-4 font-display text-4xl font-extrabold text-vert-950">${esc(String(totalClubs))}</p>
      <p class="mt-1 text-sm leading-relaxed text-encre-doux">clubs engagés au championnat national 2025.</p>
      <p class="mt-4 text-sm leading-relaxed text-encre-doux">La liste complète et les coordonnées des clubs ne sont pas encore publiées par la fédération. Trois clubs sont publiquement cités à ce jour.</p>
      <a href="clubs.html" class="btn btn--contour mt-8 flex w-full justify-center">
        Voir les clubs <span aria-hidden="true">→</span>
      </a>
    </aside>`;

  const cartesClubs = clubsMisEnAvant(3)
    .map((club, index) => carteClubAccueil(club, { decalage: index === 1 ? 'md:mt-12' : '' }))
    .join('');

  qs('[data-zone="clubs-grille"]').innerHTML = `
    <div class="grid gap-12 lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-16">
      ${indexInfo}
      <div class="grid gap-8 sm:grid-cols-2 md:grid-cols-3 md:items-start">${cartesClubs}</div>
    </div>`;

  /* ------------------------------------------------ galerie */
  const photosGalerie = imagesGalerie({ limite: 8 });
  const RATIOS = [
    'aspect-[4/5]',
    'aspect-[4/3]',
    'aspect-square',
    'aspect-[5/6]',
    'aspect-square',
    'aspect-[5/6]',
    'aspect-[4/5]',
    'aspect-[4/3]'
  ];
  const ROTATIONS = [
    '-rotate-2',
    'rotate-1',
    '-rotate-[1.5deg]',
    'rotate-2',
    'rotate-1',
    '-rotate-2',
    'rotate-2',
    '-rotate-[1.5deg]'
  ];
  const DEPARTS = ['', 'lg:mt-16', 'lg:mt-6', 'lg:mt-24'];
  const colonnes = [[], [], [], []];
  photosGalerie.forEach((photo, index) => colonnes[index % 4].push({ photo, index }));

  const zoneGalerie = qs('[data-zone="galerie-grille"]');
  zoneGalerie.innerHTML = photosGalerie.length
    ? `
    <div class="grid grid-cols-2 items-start gap-5 sm:gap-7 lg:grid-cols-4 lg:gap-8">
      ${colonnes
        .map(
          (colonne, c) => `
        <div class="flex flex-col gap-5 sm:gap-7 lg:gap-8 ${DEPARTS[c] || ''}">
          ${colonne
            .map(({ photo, index }) =>
              vignetteGalerieAccueil(photo, {
                ratio: RATIOS[index % RATIOS.length],
                rotation: ROTATIONS[index % ROTATIONS.length],
                delai: (index % 4) * 90
              })
            )
            .join('')}
        </div>`
        )
        .join('')}
    </div>`
    : blocSquelette({
        texte:
          data.galerie?.entete?.note ||
          'Les photographies officielles de la fédération seront publiées dans cette galerie.',
        nombre: 4,
        colonnes: 'grid-cols-2 lg:grid-cols-4'
      });

  /* ------------------------------------------------ partenaires */
  const partenaires = partenairesAffiches();
  qs('[data-zone="partenaires-grille"]').innerHTML = partenaires.length
    ? `<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${partenaires.map(cartePartenaire).join('')}</div>`
    : `<p class="rounded-2xl border border-dashed border-sable-300 bg-white px-6 py-10 text-center text-sm text-encre-doux">
         Les partenariats confirmés seront publiés ici.
       </p>`;

  /* ------------------------------------------------ animations & visionneuse */
  ui.initRevelation();
  ui.initCompteurs();
  ui.initVisionneuse();
}
