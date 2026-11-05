/* ==========================================================================
   FETOC - Page « Actualités »
   Journal filtrable + galerie photographique avec visionneuse.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { page, filtrerActualites, categoriesActualites, imagesGalerie, reseaux } from '../core/data.js';
import { bandeauPage, carteArticle, vignetteGalerie, blocSquelette } from '../core/cartes.js';
import { qs, qsa, esc } from '../core/utils.js';
import { icone } from '../core/icons.js';

demarrer().then(rendre);

const etat = { categorie: 'toutes', requete: '' };

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
  const pageActualites = page('actualites');
  const entete = pageActualites.entete ?? {};

  /* ------------------------------------------------ bandeau */
  remplir(
    'bandeau',
    bandeauPage({
      titre: entete.titre,
      chapeau: entete.chapeau,
      fil: entete.etiquette,
      section: entete.fil_ariane
    })
  );

  const iconeRecherche = qs('[data-icone-recherche]');
  if (iconeRecherche) iconeRecherche.innerHTML = icone('recherche', 'h-5 w-5');

  /* ------------------------------------------------ filtres actualités */
  /* Le bouton « Toutes les actualités » est ajouté ici : la taxonomie ne
     contient que les catégories réelles. */
  const zoneCategories = remplir(
    'filtres-categories',
    [{ id: 'toutes', libelle: 'Toutes les actualités' }, ...categoriesActualites()]
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

  /* ------------------------------------------------ introduction */
  const introduction = pageActualites.introduction ?? {};
  texte('introduction-titre', introduction.titre);
  remplir(
    'introduction-texte',
    (introduction.paragraphes || []).map((paragraphe) => `<p>${esc(paragraphe)}</p>`).join('')
  );

  /* ------------------------------------------------ réseaux sociaux */
  remplir(
    'suivre-reseaux',
    reseaux()
      .map(
        (reseau) =>
          `<a href="${esc(reseau.url)}" target="_blank" rel="noopener noreferrer" class="btn btn--fantome">${esc(
            reseau.nom
          )}${reseau.pseudo ? ` : ${esc(reseau.pseudo)}` : ''}</a>`
      )
      .join('')
  );

  /* ------------------------------------------------ galerie */
  const galerie = pageActualites.galerie ?? {};
  texte('galerie-titre', galerie.titre);
  texte('galerie-intro', galerie.chapeau);
  texte('galerie-note', galerie.note);

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
  const images = imagesGalerie();
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
