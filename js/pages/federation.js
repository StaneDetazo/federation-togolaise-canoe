/* ==========================================================================
   FETOC - Page « La Fédération »
   Présentation, histoire et missions.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { page, reseaux } from '../core/data.js';
import { bandeauPage } from '../core/cartes.js';
import { qs, esc } from '../core/utils.js';
import { icone } from '../core/icons.js';

demarrer().then(rendre);

/* ---------------------------------------------------------------- aides locales */
function remplir(zone, html) {
  const element = qs(`[data-zone="${zone}"]`);
  if (element) element.innerHTML = html;
  return element;
}

function texte(zone, valeur) {
  const element = qs(`[data-zone="${zone}"]`);
  if (element) element.textContent = valeur ?? '';
  return element;
}

function rendre() {
  const federation = page('federation');
  const entete = federation.entete ?? {};
  const presentation = federation.presentation ?? {};
  const histoire = federation.histoire ?? {};
  const missions = federation.missions ?? {};

  /* ------------------------------------------------ bandeau de page */
  remplir(
    'bandeau',
    bandeauPage({
      titre: entete.titre,
      fil: entete.etiquette,
      section: entete.fil_ariane
    })
  );

  /* ------------------------------------------------ présentation */
  texte('presentation-titre', presentation.titre);
  texte('presentation-chapeau', presentation.chapeau);
  remplir(
    'presentation-texte',
    (presentation.paragraphes || []).map((paragraphe) => `<p>${esc(paragraphe)}</p>`).join('')
  );

  /* image d'illustration (source modifiable dans data/pages/federation.json) */
  const imageIdentite = qs('[data-zone="identite-image"]');
  const illustration = presentation.illustration ?? {};
  if (imageIdentite && illustration.image) imageIdentite.src = illustration.image;
  if (imageIdentite && illustration.legende) imageIdentite.alt = illustration.legende;

  /* ------------------------------------------------ histoire */
  texte('histoire-titre', histoire.titre);
  texte('histoire-intro', histoire.chapeau);
  remplir(
    'histoire-texte',
    (histoire.paragraphes || []).map((paragraphe) => `<p>${esc(paragraphe)}</p>`).join('')
  );

  const etapes = histoire.chronologie || [];
  const milieu = Math.ceil(etapes.length / 2);
  const colonneFrise = (liste) => `
    <div class="frise pb-2">
      ${liste
        .map(
          (etape) => `
        <div class="frise__item">
          <span class="inline-flex items-center rounded-full bg-vert-700 px-3 py-1 font-display text-xs font-bold tracking-wide text-white">${esc(
            etape.annee
          )}</span>
          <h3 class="mt-3 font-display text-base font-bold text-vert-950">${esc(etape.titre)}</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-encre-doux">${esc(etape.texte)}</p>
        </div>`
        )
        .join('')}
    </div>`;
  remplir(
    'histoire-frise',
    colonneFrise(etapes.slice(0, milieu)) + colonneFrise(etapes.slice(milieu))
  );

  /* ------------------------------------------------ missions (liste compacte) */
  texte('missions-titre', missions.titre);
  texte('missions-intro', missions.chapeau);
  remplir(
    'missions-grille',
    (missions.liste || [])
      .map(
        (mission, index) => `
      <div class="revele flex items-start gap-4 border-b border-sable-200 py-5" data-delai="${
        (index % 2) * 80
      }">
        <span class="grid h-10 w-10 flex-none place-items-center rounded-xl bg-vert-50 text-vert-700">${icone(
          mission.icone,
          'h-5 w-5'
        )}</span>
        <div>
          <h3 class="font-display text-base font-bold leading-tight text-vert-950">${esc(mission.titre)}</h3>
          <p class="mt-1 text-sm leading-relaxed text-encre-doux">${esc(mission.texte)}</p>
        </div>
      </div>`
      )
      .join('')
  );

  /* ------------------------------------------------ réseaux sociaux */
  remplir(
    'reseaux-appel',
    reseaux()
      .map(
        (reseau) =>
          `<a href="${esc(reseau.url)}" target="_blank" rel="noopener noreferrer" class="btn btn--fantome">${esc(
            reseau.nom
          )}${reseau.pseudo ? ` : ${esc(reseau.pseudo)}` : ''}</a>`
      )
      .join('')
  );

  /* ------------------------------------------------ animations */
  ui.initRevelation();
}
