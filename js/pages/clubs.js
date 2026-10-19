/* ==========================================================================
   FETOC - Page « Clubs affiliés »
   Annuaire filtrable (région, recherche), repères et affiliation.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { data, clubs, regions, filtrerClubs } from '../core/data.js';
import { bandeauPage, carteClub } from '../core/cartes.js';
import { qs, qsa, esc } from '../core/utils.js';
import { icone } from '../core/icons.js';

demarrer().then(rendre);

const etat = { region: 'toutes', requete: '' };

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
  const entete = data.clubs?.entete ?? {};
  const annuaire = data.clubs?.annuaire ?? {};
  const devenir = data.clubs?.devenir_club ?? {};

  /* ------------------------------------------------ bandeau */
  remplir(
    'bandeau',
    bandeauPage({
      titre: entete.titre || 'Clubs affiliés',
      chapeau: entete.chapeau || 'Les clubs affiliés à la fédération.',
      fil: 'Réseau fédéral',
      section: 'Clubs affiliés'
    })
  );

  /* ------------------------------------------------ annuaire */
  texte('annuaire-etiquette', annuaire.etiquette || 'Annuaire');
  texte('annuaire-titre', annuaire.titre || 'Les clubs affiliés');
  texte('annuaire-intro', annuaire.intro);

  const iconeRecherche = qs('[data-icone-recherche]');
  if (iconeRecherche) iconeRecherche.innerHTML = icone('recherche', 'h-5 w-5');

  /* ------------------------------------------------ filtres par région */
  const optionsRegions = [{ id: 'toutes', libelle: 'Toutes' }, ...regions()];
  const zoneRegions = remplir(
    'filtres-regions',
    optionsRegions
      .map(
        (region) => `
      <button type="button" class="pastille-filtre text-xs${region.id === etat.region ? ' est-actif' : ''}"
        data-region="${esc(region.id)}" aria-pressed="${region.id === etat.region}">${esc(region.libelle)}</button>`
      )
      .join('')
  );
  zoneRegions?.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('[data-region]');
    if (!bouton) return;
    etat.region = bouton.dataset.region;
    qsa('[data-region]', zoneRegions).forEach((b) => b.classList.toggle('est-actif', b === bouton));
    afficherGrille();
  });

  const champ = qs('#recherche-clubs');
  if (champ) {
    champ.addEventListener('input', () => {
      etat.requete = champ.value.trim();
      afficherGrille();
    });
  }

  qs('[data-zone="reinitialiser"]')?.addEventListener('click', () => {
    etat.region = 'toutes';
    etat.requete = '';
    if (champ) champ.value = '';
    qsa('[data-region]', zoneRegions).forEach((b, index) =>
      b.classList.toggle('est-actif', index === 0)
    );
    afficherGrille();
  });

  afficherGrille();
  afficherReperes();

  /* ------------------------------------------------ devenir club */
  texte('devenir-titre', devenir.titre);
  texte('devenir-texte', devenir.texte);
  texte('devenir-note', devenir.a_confirmer);

  ui.initRevelation();
}

/* ------------------------------------------------------------------ grille */
function afficherGrille() {
  const liste = filtrerClubs(etat);
  const grille = qs('[data-zone="clubs-grille"]');
  if (!grille) return;

  if (!liste.length) {
    grille.className = 'mt-10 grid gap-6';
    grille.innerHTML = `<div class="rounded-2xl border border-dashed border-sable-300 bg-white px-6 py-16 text-center">
      <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-vert-50 text-vert-600">${icone(
        'recherche',
        'h-6 w-6'
      )}</span>
      <p class="mt-4 font-display text-lg font-bold text-vert-900">Aucun club ne correspond à ces critères</p>
      <p class="mx-auto mt-2 max-w-md text-sm text-encre-doux">Élargissez la recherche ou réinitialisez les filtres.</p>
    </div>`;
  } else {
    grille.className = 'mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3';
    grille.innerHTML = liste.map((club) => carteClub(club)).join('');
    ui.initRevelation(grille);
  }

  const compteur = qs('[data-zone="compteur-clubs"]');
  if (compteur) {
    compteur.textContent = `${liste.length} club${liste.length > 1 ? 's' : ''} affiché${
      liste.length > 1 ? 's' : ''
    } sur ${clubs().length} club${clubs().length > 1 ? 's' : ''}.`;
  }
}

/* ------------------------------------------------------------------ repères */
function afficherReperes() {
  const reperes = data.clubs?.reperes ?? {};

  texte('reperes-etiquette', reperes.etiquette || 'Repères');
  texte('reperes-titre', reperes.titre || 'Le réseau en chiffres');
  texte('reperes-intro', reperes.intro);

  remplir(
    'reperes-liste',
    (reperes.liste || [])
      .map(
        (repere, index) => `
      <article class="revele flex items-start gap-5 rounded-2xl border border-sable-200 bg-white p-6 sm:p-7" data-delai="${index * 70}">
        <span class="grid h-12 w-12 flex-none place-items-center rounded-xl bg-vert-50 text-vert-700">${icone(
          repere.icone || 'reseau',
          'h-6 w-6'
        )}</span>
        <div>
          <p class="font-display text-3xl font-extrabold leading-none text-vert-950">${esc(repere.valeur)}</p>
          <p class="mt-2 font-display text-sm font-bold text-vert-800">${esc(repere.libelle)}</p>
          <p class="mt-1.5 text-sm leading-relaxed text-encre-doux">${esc(repere.texte)}</p>
        </div>
      </article>`
      )
      .join('')
  );
}
