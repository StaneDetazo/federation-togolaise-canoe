/* ==========================================================================
   FETOC - Page « La Fédération »
   Présentation, missions, vision, organisation et gouvernance.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { data } from '../core/data.js';
import { bandeauPage, carteMembre, blocEssentiel } from '../core/cartes.js';
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
  const missions = federation.missions ?? {};
  const vision = federation.vision ?? {};
  const organisation = federation.organisation ?? {};
  const bureau = federation.bureau_executif ?? {};
  const affiliations = federation.affiliations ?? {};

  /* ------------------------------------------------ bandeau de page */
  remplir(
    'bandeau',
    bandeauPage({
      titre: 'La Fédération Togolaise de Canoë',
      chapeau: presentation.chapeau || 'Missions, vision, organisation et gouvernance de la FETOC.',
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
          icone: 'bouclier',
          titre: 'Qui nous sommes',
          texte:
            'La FETOC fédère les clubs et les pratiquants de canoë-kayak et de sports de pagaie au Togo.'
        },
        {
          icone: 'ampoule',
          titre: 'Nos missions',
          texte:
            'Développer la pratique, former les encadrants et organiser la vie sportive nationale.'
        },
        {
          icone: 'reseau',
          titre: 'Notre organisation',
          texte:
            'Un comité exécutif élu et des commissions techniques, avec un siège à Lomé.'
        },
        {
          icone: 'documents',
          titre: 'Documents officiels',
          texte: 'Statuts, règlements et rapports officiels téléchargeables depuis cette page.'
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
    (federation.identite_officielle || [])
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

  /* ------------------------------------------------ vision & valeurs */
  texte('vision-titre', vision.titre);
  texte('vision-texte', vision.texte);
  remplir(
    'vision-objectifs',
    (vision.objectifs || [])
      .map(
        (objectif) => `
      <li class="flex items-start gap-3">
        <span class="mt-0.5 flex-none text-soleil-300">${icone('check-cercle', 'h-5 w-5')}</span>
        <span>${esc(objectif)}</span>
      </li>`
      )
      .join('')
  );
  remplir(
    'valeurs-grille',
    (vision.valeurs || [])
      .map(
        (valeur, index) => `
      <article class="revele rounded-2xl border border-white/12 bg-white/[0.06] p-5" data-delai="${(index % 2) * 80}">
        <h3 class="font-display text-base font-bold text-soleil-300">${esc(valeur.nom)}</h3>
        <p class="mt-2 text-sm leading-relaxed text-vert-50/80">${esc(valeur.texte)}</p>
      </article>`
      )
      .join('')
  );

  /* ------------------------------------------------ organisation */
  texte('organisation-titre', organisation.titre);
  texte('organisation-intro', organisation.introduction);
  remplir(
    'instances-grille',
    (organisation.instances || [])
      .map(
        (instance, index) => `
      <article class="revele carte p-6" data-delai="${(index % 2) * 80}">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 class="font-display text-lg font-bold text-vert-950">${esc(instance.nom)}</h3>
          <span class="pastille pastille--vert">${esc(instance.role)}</span>
        </div>
        <p class="mt-3 text-sm leading-relaxed text-encre-doux">${esc(instance.texte)}</p>
        <p class="mt-4 flex items-center gap-2 text-xs text-encre-clair">${icone(
          'horloge',
          'h-4 w-4 text-vert-600'
        )}${esc(instance.frequence)}</p>
      </article>`
      )
      .join('')
  );
  remplir(
    'commissions-lignes',
    (organisation.commissions || [])
      .map(
        (commission) => `
      <tr>
        <td class="font-medium text-vert-950">${esc(commission.nom)}</td>
        <td class="whitespace-nowrap">${esc(commission.responsable)}</td>
        <td class="text-encre-doux">${esc(commission.mission)}</td>
      </tr>`
      )
      .join('')
  );

  /* ------------------------------------------------ bureau exécutif */
  texte('bureau-titre', bureau.titre);
  texte('bureau-intro', bureau.introduction);
  if (bureau.note) texte('bureau-note', bureau.note);
  remplir(
    'bureau-grille',
    (bureau.membres || [])
      .map((membre, index) => carteMembre(membre, { delai: (index % 4) * 70 }))
      .join('')
  );

  /* ------------------------------------------------ affiliations */
  texte('affiliations-titre', affiliations.titre);
  remplir(
    'affiliations-grille',
    (affiliations.liste || [])
      .map(
        (affiliation, index) => `
      <article class="revele flex items-center gap-4 rounded-2xl border border-sable-200 bg-white p-5" data-delai="${
        (index % 4) * 70
      }">
        <span class="grid h-14 w-20 flex-none place-items-center overflow-hidden rounded-xl bg-sable-50">
          ${
            affiliation.logo
              ? `<img src="${esc(affiliation.logo)}" alt="Logo ${esc(affiliation.organisation)}" width="160" height="80" loading="lazy" decoding="async" class="h-9 w-auto object-contain">`
              : `<span class="font-display text-sm font-bold text-vert-700">${esc(affiliation.sigle || '')}</span>`
          }
        </span>
        <div class="min-w-0">
          <p class="font-display text-sm font-bold leading-snug text-vert-950">${esc(affiliation.organisation)}</p>
          <p class="mt-1 text-xs text-encre-clair">${esc(affiliation.sigle || '')} · ${esc(affiliation.statut)}</p>
          <p class="mt-0.5 text-[0.72rem] text-encre-doux">Membre depuis ${esc(affiliation.depuis)}</p>
        </div>
      </article>`
      )
      .join('')
  );

  /* ------------------------------------------------ animations */
  ui.initRevelation();
}
