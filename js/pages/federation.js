/* ==========================================================================
   FETOC - Page « La Fédération »
   Présentation, identité, histoire, missions, comité exécutif, affiliations.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { data } from '../core/data.js';
import { bandeauPage, carteMembre, blocEssentiel, blocSquelette } from '../core/cartes.js';
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
  const federation = data.federation ?? {};
  const presentation = federation.presentation ?? {};
  const histoire = federation.histoire ?? {};
  const missions = federation.missions ?? {};
  const bureau = federation.bureau_executif ?? {};
  const affiliations = federation.affiliations ?? {};
  const documents = federation.documents ?? {};
  const identite = federation.identite_officielle ?? [];
  const valeur = (libelle) => identite.find((l) => l.libelle === libelle)?.valeur ?? '';

  /* ------------------------------------------------ bandeau de page */
  remplir(
    'bandeau',
    bandeauPage({
      titre: 'La Fédération Togolaise de Canoë',
      chapeau: presentation.chapeau || '',
      image: 'assets/img/banner-federation.svg',
      fil: 'Institution',
      section: 'La Fédération'
    })
  );

  /* ------------------------------------------------ l'essentiel */
  remplir(
    'essentiel',
    blocEssentiel({
      points: [
        {
          icone: 'ancre',
          titre: 'Création',
          texte: `${valeur('Création')} à ${valeur('Siège')}.`
        },
        {
          icone: 'utilisateurs',
          titre: 'Comité exécutif',
          texte: `${valeur('Comité exécutif')}, présidé par ${valeur('Président')}.`
        },
        {
          icone: 'diplome',
          titre: 'Missions',
          texte: 'Promouvoir la pratique, développer les clubs, former les cadres et organiser les compétitions nationales.'
        },
        {
          icone: 'globe',
          titre: 'Ouverture internationale',
          texte: `Affiliation : ${valeur('Affiliation internationale')}.`
        }
      ]
    })
  );

  /* ------------------------------------------------ présentation */
  texte('presentation-titre', presentation.titre);
  texte('presentation-chapeau', presentation.chapeau);
  remplir(
    'presentation-texte',
    (presentation.paragraphes || []).map((paragraphe) => `<p>${esc(paragraphe)}</p>`).join('')
  );

  /* ------------------------------------------------ identité officielle */
  remplir(
    'identite-officielle',
    identite
      .map(
        (ligne) => `
      <div class="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
        <dt class="flex-none text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-encre-clair sm:w-40 sm:pt-0.5">${esc(
          ligne.libelle
        )}</dt>
        <dd class="text-[0.9rem] font-medium text-vert-950">${esc(ligne.valeur)}</dd>
      </div>`
      )
      .join('')
  );

  /* ------------------------------------------------ histoire */
  texte('histoire-titre', histoire.titre);
  texte('histoire-intro', histoire.introduction);

  const etapes = histoire.etapes || [];
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

  /* ------------------------------------------------ missions */
  texte('missions-titre', missions.titre);
  texte('missions-intro', missions.introduction);
  remplir(
    'missions-grille',
    (missions.liste || [])
      .map(
        (mission, index) => `
      <article class="revele carte flex flex-col p-6" data-delai="${(index % 3) * 90}">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-vert-50 text-vert-700">${icone(
          mission.icone,
          'h-6 w-6'
        )}</span>
        <h3 class="mt-5 font-display text-lg font-bold text-vert-950">${esc(mission.titre)}</h3>
        <p class="mt-2 text-sm leading-relaxed text-encre-doux">${esc(mission.texte)}</p>
      </article>`
      )
      .join('')
  );

  /* ------------------------------------------------ comité exécutif */
  texte('bureau-titre', bureau.titre);
  texte('bureau-intro', bureau.introduction);
  remplir(
    'bureau-grille',
    (bureau.membres || [])
      .map((membre, index) => carteMembre(membre, { delai: (index % 4) * 70 }))
      .join('')
  );
  texte('bureau-note', bureau.a_confirmer);
  if (!bureau.a_confirmer) qs('[data-zone="bureau-note"]')?.classList.add('hidden');

  /* ------------------------------------------------ affiliations */
  texte('affiliations-titre', affiliations.titre);
  remplir(
    'affiliations-grille',
    (affiliations.liste || [])
      .map(
        (affiliation, index) => `
      <article class="revele flex items-start gap-4 rounded-2xl border border-sable-200 bg-white p-5" data-delai="${
        (index % 4) * 70
      }">
        <span class="grid h-12 w-12 flex-none place-items-center rounded-xl bg-vert-50 font-display text-sm font-bold text-vert-700">
          ${esc(affiliation.sigle || affiliation.organisation.slice(0, 3).toUpperCase())}
        </span>
        <div class="min-w-0">
          <p class="font-display text-sm font-bold leading-snug text-vert-950">${esc(affiliation.organisation)}</p>
          <p class="mt-1 text-xs text-encre-clair">${esc(affiliation.statut || '')}</p>
          <p class="mt-1.5 text-[0.78rem] leading-snug text-encre-doux">${esc(affiliation.note || '')}</p>
        </div>
      </article>`
      )
      .join('')
  );

  /* ------------------------------------------------ documents officiels */
  texte('documents-titre', documents.titre || 'Documents officiels');
  texte('documents-intro', documents.introduction || '');
  remplir(
    'documents-liste',
    blocSquelette({
      texte: documents.a_confirmer || 'Aucun document officiel n’est publié à ce jour.',
      nombre: 3
    })
  );

  /* ------------------------------------------------ animations */
  ui.initRevelation();
}
