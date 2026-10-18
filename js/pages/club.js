/* ==========================================================================
   FETOC - Fiche d'un club affilié (page dynamique)
   Lit l'identifiant « ?id=… » et affiche les informations documentées.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { clubParId, nomRegion, clubs } from '../core/data.js';
import { bandeauPage, carteClub, blocSquelette } from '../core/cartes.js';
import { parametreUrl, qs, esc } from '../core/utils.js';
import { icone } from '../core/icons.js';

demarrer().then(rendre);

function remplir(zone, html) {
  const element = qs(`[data-zone="${zone}"]`);
  if (element) element.innerHTML = html;
  return element;
}

function rendre() {
  const identifiant = parametreUrl('id');
  const club = clubParId(identifiant);

  if (!club) {
    afficherIntrouvable(identifiant);
    return;
  }

  const lieu = [club.ville, club.site_pratique].filter(Boolean).join(' · ');
  const region = club.region ? nomRegion(club.region) : null;

  document.title = `${club.nom} - Club affilié`;
  qs('meta[name="description"]')?.setAttribute(
    'content',
    `Le club ${club.nom}${lieu ? ` à ${lieu}` : ''}, affilié à la Fédération Togolaise de Canoë (FETOC).`
  );

  /* ------------------------------------------------ bandeau */
  remplir(
    'bandeau',
    bandeauPage({
      titre: club.nom,
      chapeau: lieu || 'Club affilié à la FETOC',
      image: 'assets/img/banner-clubs.svg',
      fil: region || 'Clubs affiliés',
      section: 'Clubs affiliés'
    })
  );

  /* ------------------------------------------------ contenu */
  remplir(
    'contenu',
    `
    <section class="bg-white py-14 lg:py-20">
      <div class="mx-auto max-w-ecran px-4 sm:px-6">
        <a href="clubs.html" class="lien-fleche text-sm font-semibold text-vert-700">
          ${icone('fleche-gauche', 'h-4 w-4')}Tous les clubs affiliés
        </a>

        <div class="mt-8 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div class="revele">
            <div class="flex flex-wrap items-center gap-2">
              ${
                region
                  ? `<span class="pastille pastille--vert">${icone('lieu', 'h-3.5 w-3.5')}${esc(
                      region
                    )}</span>`
                  : ''
              }
              ${(club.labels || [])
                .map((label) => `<span class="pastille pastille--soleil">${esc(label)}</span>`)
                .join('')}
            </div>

            <h2 class="mt-6 font-display text-2xl font-bold text-vert-950 sm:text-3xl">Le club</h2>
            <p class="mt-5 text-base leading-relaxed text-encre-doux">${esc(club.presentation)}</p>
            ${
              club.note
                ? `<p class="mt-4 text-sm leading-relaxed text-encre-clair">${esc(club.note)}</p>`
                : ''
            }
            ${
              club.source
                ? `<p class="mt-4 text-xs text-encre-clair">Source : ${esc(club.source)}</p>`
                : ''
            }

            <div class="mt-12">
              <h3 class="font-display text-lg font-bold text-vert-950">Informations complémentaires</h3>
              <div class="mt-5">
                ${blocSquelette({
                  texte:
                    'Les informations détaillées sur ce club (effectifs, encadrement, site de pratique et coordonnées) ne sont pas encore publiées par la fédération.',
                  nombre: 3,
                  colonnes: 'sm:grid-cols-3'
                })}
              </div>
            </div>
          </div>

          <aside class="revele revele--droite">
            <div class="sticky top-28 space-y-6">
              <div class="rounded-2xl border border-sable-200 bg-white p-6 shadow-doux">
                <p class="font-display text-sm font-bold uppercase tracking-[0.12em] text-vert-900">Repères</p>
                <dl class="mt-4 space-y-4 text-sm">
                  ${
                    lieu
                      ? `<div class="flex items-start gap-3">
                           <span class="mt-0.5 flex-none text-vert-600">${icone('lieu', 'h-4 w-4')}</span>
                           <div><dt class="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-encre-clair">Lieu</dt>
                           <dd class="text-vert-950">${esc(lieu)}</dd></div>
                         </div>`
                      : ''
                  }
                  ${
                    region
                      ? `<div class="flex items-start gap-3">
                           <span class="mt-0.5 flex-none text-vert-600">${icone('reseau', 'h-4 w-4')}</span>
                           <div><dt class="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-encre-clair">Région</dt>
                           <dd class="text-vert-950">${esc(region)}</dd></div>
                         </div>`
                      : ''
                  }
                  ${
                    club.source
                      ? `<div class="flex items-start gap-3">
                           <span class="mt-0.5 flex-none text-vert-600">${icone('info', 'h-4 w-4')}</span>
                           <div><dt class="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-encre-clair">Source</dt>
                           <dd class="text-vert-950">${esc(club.source)}</dd></div>
                         </div>`
                      : ''
                  }
                </dl>
                <a href="contact.html" class="btn btn--vert btn--sm mt-6 w-full">Contacter la fédération</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    ${blocAutresClubs(club)}
    `
  );

  ui.initRevelation();
}

/* ------------------------------------------------------------------ blocs */
function blocAutresClubs(club) {
  const autres = clubs()
    .filter((autre) => autre.id !== club.id)
    .slice(0, 3);
  if (!autres.length) return '';

  return `
    <section class="bg-sable-50 py-14 lg:py-20">
      <div class="mx-auto max-w-ecran px-4 sm:px-6">
        <header class="revele flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="etiquette text-vert-600">Annuaire</p>
            <h2 class="mt-4 font-display text-2xl font-bold text-vert-950">Autres clubs publiquement cités</h2>
          </div>
          <a href="clubs.html" class="btn btn--contour flex-none">Voir tous les clubs</a>
        </header>
        <div class="mt-10 grid gap-8 md:grid-cols-3">
          ${autres.map((voisin) => carteClub(voisin)).join('')}
        </div>
      </div>
    </section>`;
}

function afficherIntrouvable(identifiant) {
  remplir(
    'bandeau',
    bandeauPage({
      titre: 'Club introuvable',
      chapeau: "La fiche demandée n'existe pas ou n'est plus disponible.",
      image: 'assets/img/banner-clubs.svg',
      fil: 'Clubs affiliés',
      section: 'Clubs affiliés'
    })
  );
  remplir(
    'contenu',
    `<section class="bg-white py-20 lg:py-28">
      <div class="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <span class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-soleil-100 text-soleil-700">${icone(
          'alerte',
          'h-7 w-7'
        )}</span>
        <h2 class="mt-6 font-display text-2xl font-bold text-vert-950">Ce club n'a pas été trouvé</h2>
        <p class="mt-3 text-base leading-relaxed text-encre-doux">
          ${
            identifiant
              ? `Aucun club ne correspond à l'identifiant « ${esc(identifiant)} ».`
              : "Aucun club n'a été indiqué dans le lien."
          }
          Consultez l'annuaire des clubs affiliés à la fédération.
        </p>
        <a href="clubs.html" class="btn btn--vert mt-8">Voir tous les clubs</a>
      </div>
    </section>`
  );
  ui.initRevelation();
}
