/* ==========================================================================
   FETOC - Page d'accueil
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import {
  data,
  site,
  disciplines,
  chiffresCles,
  prochainsEvenements,
  articlesRecents,
  clubsMisEnAvant,
  imagesGalerie,
  partenairesAffiches,
  clubs,
  videoHeroPage
} from '../core/data.js';
import {
  carteDiscipline,
  carteArticle,
  carteClub,
  carteEvenement,
  vignetteGalerie,
  cartePartenaire
} from '../core/cartes.js';
import { qs, esc, dateCourte } from '../core/utils.js';
import { icone as svg } from '../core/icons.js';

demarrer().then(() => rendre());

function rendre() {
  const identite = site();
  const federation = data.federation ?? {};

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

  const prochain = prochainsEvenements(1)[0];
  const reperes = [
    {
      libelle: 'Prochain rendez-vous',
      valeur: prochain ? dateCourte(prochain.date_debut) : 'Calendrier en préparation',
      detail: prochain ? prochain.titre : 'Consulter le calendrier sportif'
    },
    { libelle: 'Disciplines encadrées', valeur: String(disciplines().length), detail: 'De la course en ligne à la pirogue' },
    { libelle: 'Base nautique fédérale', valeur: 'Togoville', detail: 'Rive sud du Lac Togo' }
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
    badge.innerHTML = `<b>${clubs().length}</b> <span>clubs affiliés au Togo</span>`;
  }

  /* ------------------------------------------------ la fédération en bref */
  qs('[data-zone="bref-titre"]').textContent = federation.presentation?.titre || '';
  qs('[data-zone="bref-texte"]').innerHTML = (federation.presentation?.paragraphes || [])
    .slice(0, 2)
    .map((p) => `<p>${esc(p)}</p>`)
    .join('');

  /* ------------------------------------------------ chiffres clés (optionnels) */
  const cles = chiffresCles();
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
  qs('[data-zone="disciplines-grille"]').innerHTML = listeDisciplines.map(carteDiscipline).join('');

  /* ------------------------------------------------ actualités */
  qs('[data-zone="actualites-grille"]').innerHTML = articlesRecents(3).map((a) => carteArticle(a)).join('');

  /* ------------------------------------------------ prochains événements */
  const evenements = prochainsEvenements(4);
  const zoneEvenements = qs('[data-zone="evenements-liste"]');
  if (evenements.length) {
    zoneEvenements.innerHTML = `<div class="grid gap-6 lg:grid-cols-2">${evenements
      .map((e) => carteEvenement(e, { variante: 'sombre' }))
      .join('')}</div>`;
  } else {
    zoneEvenements.innerHTML = `
      <div class="rounded-2xl border border-dashed border-white/25 bg-white/[0.04] px-8 py-12 text-center">
        <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/10 text-soleil-300">${svg('calendrier', 'h-6 w-6')}</span>
        <p class="mt-4 font-display text-lg font-bold text-white">Aucun rendez-vous prévu</p>
        <p class="mx-auto mt-2 max-w-md text-sm text-vert-50/75">
          Consultez la page du calendrier pour connaître les prochaines dates dès leur publication.
        </p>
        <a href="competitions.html" class="btn btn--soleil mt-6">Consulter le calendrier</a>
      </div>`;
  }

  /* ------------------------------------------------ clubs affiliés */
  qs('[data-zone="clubs-grille"]').innerHTML = clubsMisEnAvant(3).map((c) => carteClub(c)).join('');

  /* ------------------------------------------------ galerie */
  qs('[data-zone="galerie-grille"]').innerHTML = imagesGalerie({ limite: 8 })
    .map((image, index) => vignetteGalerie(image, { delai: (index % 4) * 80 }))
    .join('');

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
