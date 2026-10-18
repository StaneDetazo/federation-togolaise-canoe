/* ==========================================================================
   FETOC - Page « Disciplines & activités »
   Grille filtrable, fiches détaillées, formations et lieux associés.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { data, disciplines, familles } from '../core/data.js';
import { bandeauPage, carteDiscipline } from '../core/cartes.js';
import { qs, qsa, esc, correspond } from '../core/utils.js';
import { icone } from '../core/icons.js';

demarrer().then(rendre);

const etat = { famille: 'toutes', requete: '' };

const pastille = (txt, variante = 'gris') =>
  `<span class="pastille pastille--${variante}">${esc(txt)}</span>`;

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
  const entete = data.disciplines?.entete ?? {};
  const formations = data.disciplines?.formations ?? {};
  const sites = data.disciplines?.sites_de_pratique ?? {};

  /* ------------------------------------------------ bandeau */
  remplir(
    'bandeau',
    bandeauPage({
      titre: entete.titre || 'Disciplines & activités',
      chapeau: entete.chapeau || 'Les activités de la fédération.',
      image: 'assets/img/banner-disciplines.svg',
      fil: 'Pratique',
      section: 'Disciplines & activités'
    })
  );

  const iconeRecherche = qs('[data-icone-recherche]');
  if (iconeRecherche) iconeRecherche.innerHTML = icone('recherche', 'h-5 w-5');

  /* ------------------------------------------------ filtres par famille */
  const boutons = familles()
    .map(
      (famille) => `
    <button type="button" class="pastille-filtre${famille.id === etat.famille ? ' est-actif' : ''}"
      data-famille="${esc(famille.id)}" aria-pressed="${famille.id === etat.famille}">
      ${esc(famille.libelle)}
    </button>`
    )
    .join('');
  const zoneFiltres = remplir('filtres-familles', boutons);
  zoneFiltres?.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('[data-famille]');
    if (!bouton) return;
    etat.famille = bouton.dataset.famille;
    qsa('[data-famille]', zoneFiltres).forEach((b) =>
      b.classList.toggle('est-actif', b === bouton)
    );
    afficherGrille();
  });

  /* ------------------------------------------------ recherche */
  const champ = qs('#recherche-disciplines');
  if (champ) {
    champ.addEventListener('input', () => {
      etat.requete = champ.value.trim();
      afficherGrille();
    });
  }

  afficherGrille();
  afficherFiches();

  /* ------------------------------------------------ formations */
  texte('formations-titre', formations.titre);
  texte('formations-intro', formations.introduction);
  remplir(
    'formations-liste',
    `<table class="tableau-fetoc">
      <thead>
        <tr><th scope="col">Formation</th><th scope="col">Date</th><th scope="col">Lieu</th><th scope="col">Cadre</th></tr>
      </thead>
      <tbody>
        ${(formations.liste || [])
          .map(
            (formation) => `
          <tr>
            <td class="font-medium text-vert-950">${esc(formation.nom)}</td>
            <td class="whitespace-nowrap">${esc(formation.date)}</td>
            <td class="text-encre-doux">${esc(formation.lieu)}</td>
            <td class="text-encre-doux">${esc(formation.cadre)}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>`
  );
  const zoneNote = qs('[data-zone="formations-note"]');
  if (zoneNote && formations.a_confirmer) {
    zoneNote.innerHTML = `${icone('info', 'h-4 w-4 flex-none text-soleil-600')}<span>${esc(
      formations.a_confirmer
    )}</span>`;
    zoneNote.classList.remove('hidden');
  } else if (zoneNote) {
    zoneNote.classList.add('hidden');
  }

  /* ------------------------------------------------ lieux associés */
  texte('sites-titre', sites.titre);
  texte('sites-intro', sites.introduction);
  remplir(
    'sites-grille',
    (sites.liste || [])
      .map(
        (site, index) => `
      <article class="revele carte flex flex-col p-6" data-delai="${(index % 3) * 80}">
        <div class="flex items-center justify-between gap-3">
          <span class="grid h-12 w-12 flex-none place-items-center rounded-xl bg-vert-50 text-vert-700">
            ${icone('lieu', 'h-6 w-6')}
          </span>
          ${pastille(site.region, 'sombre')}
        </div>
        <h3 class="mt-5 font-display text-lg font-bold text-vert-950">${esc(site.nom)}</h3>
        <p class="mt-2 text-sm leading-relaxed text-encre-doux">${esc(site.usage)}</p>
      </article>`
      )
      .join('')
  );

  ui.initRevelation();
}

/* ------------------------------------------------------------------ grille */
function afficherGrille() {
  const liste = disciplines().filter((discipline) => {
    if (etat.famille !== 'toutes' && discipline.famille !== etat.famille) return false;
    if (etat.requete) {
      const champs = [discipline.nom, discipline.nom_court, discipline.description];
      if (!champs.some((champ) => correspond(champ, etat.requete))) return false;
    }
    return true;
  });

  const grille = qs('[data-zone="disciplines-grille"]');
  if (!grille) return;

  if (!liste.length) {
    grille.innerHTML = `<p class="col-span-full rounded-2xl border border-dashed border-sable-300 bg-white px-6 py-14 text-center text-sm text-encre-doux">
      Aucune activité ne correspond à cette recherche.</p>`;
  } else {
    grille.innerHTML = liste.map(carteDiscipline).join('');
    ui.initRevelation(grille);
  }

  const compteur = qs('[data-zone="compteur-disciplines"]');
  if (compteur) {
    compteur.textContent = `${liste.length} activité${liste.length > 1 ? 's' : ''} affichée${
      liste.length > 1 ? 's' : ''
    } sur ${disciplines().length}.`;
  }
}

/* ------------------------------------------------------------------ fiches */
function afficherFiches() {
  const libelleFamille = (id) => familles().find((f) => f.id === id)?.libelle ?? 'Discipline';

  remplir(
    'disciplines-fiches',
    disciplines()
      .map((discipline) => {
        const visuels =
          discipline.images && discipline.images.length
            ? discipline.images
            : [discipline.image || 'assets/img/banner-disciplines.svg'];

        const medias = visuels
          .map(
            (source) => `
          <div class="relative h-40 sm:h-52 ${
            visuels.length > 1 ? 'lg:h-full' : 'col-span-2 sm:col-span-1 lg:col-span-1 lg:h-full'
          }">
            <img src="${esc(source)}" alt="${esc(discipline.nom)}" width="1280" height="800"
              loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover">
          </div>`
          )
          .join('');

        return `
        <article id="${esc(discipline.id)}" class="revele carte overflow-hidden scroll-mt-32">
          <div class="grid lg:grid-cols-[1fr_1.05fr]">
            <div class="grid grid-cols-2 gap-px bg-sable-200 ${
              visuels.length > 1 ? 'lg:grid-cols-1 lg:grid-rows-2' : 'lg:grid-cols-1'
            }">
              ${medias}
            </div>
            <div class="p-6 sm:p-8">
              <div class="flex items-center gap-3">
                <span class="grid h-11 w-11 flex-none place-items-center rounded-xl bg-vert-50 text-vert-700">${icone(
                  discipline.icone,
                  'h-5 w-5'
                )}</span>
                <div class="min-w-0">
                  <p class="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-vert-600">${esc(
                    libelleFamille(discipline.famille)
                  )}</p>
                  <h3 class="font-display text-lg font-bold leading-tight text-vert-950">${esc(
                    discipline.nom
                  )}</h3>
                </div>
              </div>
              <p class="mt-4 text-sm leading-relaxed text-encre-doux">${esc(discipline.description)}</p>
            </div>
          </div>
        </article>`;
      })
      .join('')
  );
}
