/* ==========================================================================
   FETOC - Fiche d'un club affilié (page dynamique)
   Lit l'identifiant « ?id=… » et construit la fiche complète.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { clubParId, nomRegion, disciplineParId, clubs } from '../core/data.js';
import { bandeauPage, carteClub } from '../core/cartes.js';
import { parametreUrl, qs, esc, initiales } from '../core/utils.js';
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

  document.title = `${club.nom} - Club affilié`;
  const description = `Club ${club.nom} (${club.sigle}) à ${club.ville}, région ${nomRegion(
    club.region
  )} : disciplines, encadrement, matériel et coordonnées.`;
  qs('meta[name="description"]')?.setAttribute('content', description);

  /* ------------------------------------------------ bandeau */
  remplir(
    'bandeau',
    bandeauPage({
      titre: club.nom,
      chapeau: `${club.ville} - ${club.site_pratique}`,
      image: club.image,
      fil: nomRegion(club.region),
      section: 'Clubs affiliés'
    })
  );

  const disciplines = (club.disciplines || [])
    .map((id) => disciplineParId(id))
    .filter(Boolean);

  const faits = [
    { icone: 'utilisateurs', libelle: 'Effectif', valeur: club.effectif },
    { icone: 'diplome', libelle: 'Encadrement', valeur: club.encadrement },
    { icone: 'kayak', libelle: 'Matériel', valeur: club.materiel },
    { icone: 'horloge', libelle: 'Horaires', valeur: club.horaires }
  ].filter((fait) => fait.valeur);

  const contact = club.contact || {};

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
              <span class="pastille pastille--vert">${icone('lieu', 'h-3.5 w-3.5')}${esc(
                nomRegion(club.region)
              )}</span>
              <span class="pastille pastille--gris">${esc(club.sigle)}</span>
              ${(club.labels || [])
                .map((label) => `<span class="pastille pastille--soleil">${esc(label)}</span>`)
                .join('')}
              <span class="pastille pastille--contour">Depuis ${esc(String(club.annee_creation))}</span>
            </div>

            <h2 class="mt-6 font-display text-2xl font-bold text-vert-950 sm:text-3xl">Le club</h2>
            <p class="mt-5 text-base leading-relaxed text-encre-doux">${esc(club.presentation)}</p>

            <dl class="mt-10 grid gap-5 sm:grid-cols-2">
              ${faits
                .map(
                  (fait) => `
                <div class="rounded-2xl border border-sable-200 bg-sable-50 p-5">
                  <dt class="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-vert-600">
                    ${icone(fait.icone, 'h-4 w-4')}${esc(fait.libelle)}
                  </dt>
                  <dd class="mt-2 text-sm leading-relaxed text-vert-950">${esc(fait.valeur)}</dd>
                </div>`
                )
                .join('')}
            </dl>

            <div class="mt-10">
              <h3 class="font-display text-lg font-bold text-vert-950">Disciplines pratiquées</h3>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                ${disciplines
                  .map(
                    (discipline) => `
                  <a href="disciplines.html#${esc(discipline.id)}"
                     class="group flex items-center gap-4 rounded-2xl border border-sable-200 bg-white p-4 transition hover:border-vert-200 hover:shadow-doux">
                    <span class="grid h-12 w-12 flex-none place-items-center rounded-xl bg-vert-50 text-vert-700">${icone(
                      discipline.icone,
                      'h-5 w-5'
                    )}</span>
                    <span class="min-w-0">
                      <span class="block font-display text-sm font-bold text-vert-950 group-hover:text-vert-700">${esc(
                        discipline.nom
                      )}</span>
                      <span class="mt-0.5 block text-xs text-encre-clair">${esc(discipline.accroche)}</span>
                    </span>
                  </a>`
                  )
                  .join('')}
              </div>
            </div>
          </div>

          <aside class="revele revele--droite">
            <div class="sticky top-28 space-y-6">
              <div class="rounded-2xl border border-sable-200 bg-white p-6 shadow-doux">
                <div class="flex items-center gap-3">
                  <span class="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-vert-600 to-vert-900 font-display text-base font-extrabold text-white">${esc(
                    initiales(contact.responsable || '')
                  )}</span>
                  <div>
                    <p class="font-display text-sm font-bold text-vert-950">${esc(
                      contact.responsable || 'Responsable du club'
                    )}</p>
                    <p class="text-xs text-encre-clair">${esc(contact.fonction || '')}</p>
                  </div>
                </div>
                <ul class="mt-5 space-y-3 text-sm">
                  ${
                    contact.telephone
                      ? `<li><a href="tel:${esc(contact.telephone.replace(/\s/g, ''))}" class="flex items-center gap-2.5 text-encre-doux transition hover:text-vert-700">${icone(
                          'telephone',
                          'h-4 w-4 text-vert-600'
                        )}${esc(contact.telephone)}</a></li>`
                      : ''
                  }
                  ${
                    contact.email
                      ? `<li><a href="mailto:${esc(contact.email)}" class="flex items-center gap-2.5 text-encre-doux transition hover:text-vert-700">${icone(
                          'mail',
                          'h-4 w-4 text-vert-600'
                        )}${esc(contact.email)}</a></li>`
                      : ''
                  }
                  <li class="flex items-start gap-2.5 text-encre-doux">${icone(
                    'lieu',
                    'mt-0.5 h-4 w-4 flex-none text-vert-600'
                  )}<span>${esc(club.quartier)}<br>${esc(club.ville)}</span></li>
                </ul>
                <a href="contact.html" class="btn btn--vert btn--sm mt-6 w-full">Contacter la fédération</a>
              </div>

              <div class="rounded-2xl border border-soleil-300 bg-soleil-50 p-6">
                <p class="flex items-center gap-2 font-display text-sm font-bold text-vert-900">${icone(
                  'info',
                  'h-4 w-4 text-soleil-600'
                )}Site de pratique</p>
                <p class="mt-2 text-sm leading-relaxed text-encre-doux">${esc(club.site_pratique)}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    ${blocMemeRegion(club)}
    `
  );

  ui.initRevelation();
}

/* ------------------------------------------------------------------ blocs */
function blocMemeRegion(club) {
  const voisins = clubs()
    .filter((autre) => autre.region === club.region && autre.id !== club.id)
    .slice(0, 3);
  if (!voisins.length) return '';

  return `
    <section class="bg-sable-50 py-14 lg:py-20">
      <div class="mx-auto max-w-ecran px-4 sm:px-6">
        <header class="revele flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="etiquette text-vert-600">Réseau régional</p>
            <h2 class="mt-4 font-display text-2xl font-bold text-vert-950">Autres clubs en ${esc(
              nomRegion(club.region)
            )}</h2>
          </div>
          <a href="clubs.html" class="btn btn--contour flex-none">Voir tous les clubs</a>
        </header>
        <div class="mt-10 grid gap-8 md:grid-cols-3">
          ${voisins.map((voisin) => carteClub(voisin)).join('')}
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
          Consultez l'annuaire complet des clubs affiliés à la fédération.
        </p>
        <a href="clubs.html" class="btn btn--vert mt-8">Voir tous les clubs</a>
      </div>
    </section>`
  );
  ui.initRevelation();
}
