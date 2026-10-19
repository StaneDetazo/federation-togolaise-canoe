/* ==========================================================================
   FETOC - Page « Actualités »
   Journal filtrable + galerie photographique avec visionneuse.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { data, filtrerActualites, categoriesActualites, imagesGalerie } from '../core/data.js';
import { bandeauPage, carteArticle, vignetteGalerie, blocSquelette } from '../core/cartes.js';
import { qs, qsa, esc } from '../core/utils.js';
import { icone } from '../core/icons.js';

demarrer().then(rendre);

const etat = { categorie: 'toutes', requete: '', galerie: 'toutes' };

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
  const entete = data.actualites?.entete ?? {};
  const galerie = data.galerie ?? {};

  /* ------------------------------------------------ bandeau */
  remplir(
    'bandeau',
    bandeauPage({
      titre: entete.titre || 'Actualités',
      chapeau: entete.chapeau || 'La vie de la pagaie togolaise.',
      fil: 'Média',
      section: 'Actualités'
    })
  );

  const iconeRecherche = qs('[data-icone-recherche]');
  if (iconeRecherche) iconeRecherche.innerHTML = icone('recherche', 'h-5 w-5');

  /* ------------------------------------------------ filtres actualités */
  const zoneCategories = remplir(
    'filtres-categories',
    categoriesActualites()
      .map(
        (categorie) => `
      <button type="button" class="pastille-filtre${categorie.id === etat.categorie ? ' est-actif' : ''}"
        data-categorie="${esc(categorie.id)}" aria-pressed="${categorie.id === etat.categorie}">
        ${esc(categorie.libelle)}
      </button>`
      )
      .join('')
  );
  zoneCategories?.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('[data-categorie]');
    if (!bouton) return;
    etat.categorie = bouton.dataset.categorie;
    qsa('[data-categorie]', zoneCategories).forEach((b) =>
      b.classList.toggle('est-actif', b === bouton)
    );
    afficherArticles();
  });

  const champ = qs('#recherche-actualites');
  if (champ) {
    champ.addEventListener('input', () => {
      etat.requete = champ.value.trim();
      afficherArticles();
    });
  }

  afficherArticles();

  /* ------------------------------------------------ galerie */
  texte('galerie-titre', galerie.entete?.titre);
  texte('galerie-intro', galerie.entete?.chapeau);
  texte('galerie-note', galerie.entete?.note);

  const categoriesGalerie = galerie.categories || [];
  const zoneGalerie = remplir(
    'filtres-galerie',
    categoriesGalerie.length > 1
      ? categoriesGalerie
          .map(
            (categorie) => `
      <button type="button" class="pastille-filtre${categorie.id === etat.galerie ? ' est-actif' : ''}"
        data-galerie-categorie="${esc(categorie.id)}" aria-pressed="${categorie.id === etat.galerie}">
        ${esc(categorie.libelle)}
      </button>`
          )
          .join('')
      : ''
  );
  zoneGalerie?.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('[data-galerie-categorie]');
    if (!bouton) return;
    etat.galerie = bouton.dataset.galerieCategorie;
    qsa('[data-galerie-categorie]', zoneGalerie).forEach((b) =>
      b.classList.toggle('est-actif', b === bouton)
    );
    afficherGalerie();
  });

  afficherGalerie();
  ui.initRevelation();
}

/* ------------------------------------------------------------------ articles */
function afficherArticles() {
  const liste = filtrerActualites(etat);
  const zone = qs('[data-zone="actualites-grille"]');
  if (!zone) return;

  if (!liste.length) {
    zone.innerHTML = `<div class="col-span-full rounded-2xl border border-dashed border-sable-300 bg-white px-6 py-16 text-center">
      <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-vert-50 text-vert-600">${icone(
        'recherche',
        'h-6 w-6'
      )}</span>
      <p class="mt-4 font-display text-lg font-bold text-vert-900">Aucune actualité ne correspond à cette recherche</p>
      <p class="mx-auto mt-2 max-w-md text-sm text-encre-doux">Essayez une autre rubrique ou un autre mot-clé.</p>
    </div>`;
  } else {
    zone.innerHTML = liste.map((article) => carteArticle(article)).join('');
    ui.initRevelation(zone);
  }

  const compteur = qs('[data-zone="compteur-actualites"]');
  if (compteur) {
    compteur.textContent = `${liste.length} article${liste.length > 1 ? 's' : ''} affiché${
      liste.length > 1 ? 's' : ''
    }.`;
  }
}

/* ------------------------------------------------------------------ galerie */
function afficherGalerie() {
  const images = imagesGalerie({ categorie: etat.galerie });
  const zone = qs('[data-zone="galerie-grille"]');
  if (!zone) return;

  if (!images.length) {
    zone.innerHTML = blocSquelette({
      nombre: 4,
      colonnes: 'grid-cols-2 lg:grid-cols-4'
    });
    return;
  }

  zone.innerHTML = images
    .map((image, index) => vignetteGalerie(image, { delai: (index % 4) * 70 }))
    .join('');
  ui.initRevelation(zone);
  ui.initVisionneuse();
}
