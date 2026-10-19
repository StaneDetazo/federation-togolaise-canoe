/* ==========================================================================
   FETOC - Page « Compétitions & résultats »
   Rendez-vous, filtres par saison et type, informations pratiques.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { data, agenda, saisons, typesEvenement } from '../core/data.js';
import { bandeauPage, carteEvenement, blocEssentiel, blocSquelette } from '../core/cartes.js';
import { qs, qsa, esc } from '../core/utils.js';
import { icone } from '../core/icons.js';

demarrer().then(rendre);

const etat = { saison: 'toutes', type: 'toutes' };

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
  const entete = data.competitions?.entete ?? {};
  const infos = data.competitions?.informations_pratiques ?? {};

  /* ------------------------------------------------ bandeau */
  remplir(
    'bandeau',
    bandeauPage({
      titre: entete.titre || 'Compétitions & résultats',
      chapeau: entete.chapeau || 'Les rendez-vous de la fédération.',
      image: 'assets/img/banner-competitions.svg',
      fil: 'Vie sportive',
      section: 'Compétitions & résultats'
    })
  );

  /* ------------------------------------------------ l'essentiel */
  remplir(
    'essentiel',
    blocEssentiel({
      points: [
        {
          icone: 'trophee',
          titre: 'Championnat national 2025',
          texte: '13 clubs et 193 athlètes engagés, clôturé le 6 septembre 2025 à Kpémé.'
        },
        {
          icone: 'diplome',
          titre: 'Formation d’entraîneurs',
          texte: 'Niveau 1, organisée à Aného en avril 2025 dans le cadre de l’ICF.'
        },
        {
          icone: 'pirogue',
          titre: 'Relai Autour du Monde 2024',
          texte: 'Participation à l’organisation au Togo, avec France Volontaires.'
        },
        {
          icone: 'calendrier',
          titre: 'Calendrier à venir',
          texte: 'Le calendrier de la saison en cours sera publié prochainement.'
        }
      ]
    })
  );

  texte('entete-chapeau', entete.chapeau);
  texte('entete-texte', entete.texte);

  /* ------------------------------------------------ filtres saisons */
  const optionsSaisons = [{ id: 'toutes', libelle: 'Toutes' }, ...saisons()];
  const zoneSaisons = remplir(
    'filtres-saisons',
    optionsSaisons
      .map(
        (saison) => `
      <button type="button" class="pastille-filtre${saison.id === etat.saison ? ' est-actif' : ''}"
        data-saison="${esc(saison.id)}" aria-pressed="${saison.id === etat.saison}">
        ${esc(saison.libelle)}
      </button>`
      )
      .join('')
  );
  zoneSaisons?.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('[data-saison]');
    if (!bouton) return;
    etat.saison = bouton.dataset.saison;
    qsa('[data-saison]', zoneSaisons).forEach((b) => b.classList.toggle('est-actif', b === bouton));
    afficherAgenda();
  });

  /* ------------------------------------------------ filtres types */
  const zoneTypes = remplir(
    'filtres-types',
    typesEvenement()
      .map(
        (type) => `
      <button type="button" class="pastille-filtre${type.id === etat.type ? ' est-actif' : ''}"
        data-type="${esc(type.id)}" aria-pressed="${type.id === etat.type}">${esc(type.libelle)}</button>`
      )
      .join('')
  );
  zoneTypes?.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('[data-type]');
    if (!bouton) return;
    etat.type = bouton.dataset.type;
    qsa('[data-type]', zoneTypes).forEach((b) => b.classList.toggle('est-actif', b === bouton));
    afficherAgenda();
  });

  afficherAgenda();
  // afficherResultats();
  // afficherClassements();

  /* ------------------------------------------------ informations pratiques */
  texte('infos-titre', infos.titre || 'Informations pratiques');
  remplir(
    'infos-licences',
    `<li class="revele flex items-start gap-3 text-sm leading-relaxed text-encre-doux">
       <span class="mt-0.5 flex-none text-vert-600">${icone('info', 'h-5 w-5')}</span>
       <span>${esc(infos.a_confirmer || '')}</span>
     </li>`
  );
  texte(
    'infos-reglement',
    'Les textes sportifs et le règlement des compétitions seront publiés par la fédération.'
  );
  texte(
    'infos-contact',
    'Pour toute question sur les engagements, les licences ou le règlement, écrivez à fetoc228@gmail.com ou contactez la fédération via son compte Instagram officiel (@fetoc_togo).'
  );
  const iconeReglement = qs('[data-icone-reglement]');
  if (iconeReglement) iconeReglement.innerHTML = icone('documents', 'h-4 w-4 text-vert-600');

  ui.initRevelation();
}

/* ------------------------------------------------------------------ agenda */
function afficherAgenda() {
  const saison = etat.saison === 'toutes' ? null : etat.saison;
  const liste = agenda({ saison, type: etat.type });
  const zone = qs('[data-zone="agenda-liste"]');
  if (!zone) return;

  if (!liste.length) {
    zone.innerHTML = `<div class="col-span-full rounded-2xl border border-dashed border-sable-300 bg-white px-6 py-16 text-center">
      <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-vert-50 text-vert-600">${icone(
        'calendrier',
        'h-6 w-6'
      )}</span>
      <p class="mt-4 font-display text-lg font-bold text-vert-900">Aucun rendez-vous pour cette sélection</p>
      <p class="mx-auto mt-2 max-w-md text-sm text-encre-doux">Modifiez la saison ou le type de rendez-vous, ou consultez l'ensemble des rendez-vous.</p>
    </div>`;
  } else {
    zone.innerHTML = liste
      .map(
        (evenement) =>
          `<div id="${esc(evenement.id)}" class="revele scroll-mt-32">${carteEvenement(evenement)}</div>`
      )
      .join('');
    ui.initRevelation(zone);
  }

  const compteur = qs('[data-zone="compteur-evenements"]');
  if (compteur) {
    compteur.textContent = `${liste.length} rendez-vous.`;
  }
}

/* --------------------------------- résultats & classements (désactivés) */
/* Sections « Résultats » et « Classements » désactivées : contenu non publié.
function afficherResultats() {
  const zoneTitre = qs('[data-zone="resultats-titre"]');
  if (zoneTitre) zoneTitre.textContent = 'Résultats des compétitions';

  const zone = qs('[data-zone="resultats-liste"]');
  if (!zone) return;
  zone.innerHTML = blocSquelette({ nombre: 2, colonnes: '' });
}

function afficherClassements() {
  const zoneTitre = qs('[data-zone="classements-titre"]');
  if (zoneTitre) zoneTitre.textContent = 'Classements de la saison';

  const zone = qs('[data-zone="classements-liste"]');
  if (!zone) return;
  zone.innerHTML = blocSquelette({ nombre: 2, colonnes: '' });
}
*/
