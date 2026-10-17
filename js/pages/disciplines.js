/* ==========================================================================
   FETOC - Page « Disciplines & activités »
   Grille filtrable, fiches détaillées, parcours de progression,
   formations et sites de pratique.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { data, disciplines, familles } from '../core/data.js';
import { bandeauPage, carteDiscipline, blocEssentiel } from '../core/cartes.js';
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
  const parcours = data.disciplines?.parcours ?? {};
  const formations = data.disciplines?.formations ?? {};
  const sites = data.disciplines?.sites_de_pratique ?? {};

  /* ------------------------------------------------ bandeau */
  remplir(
    'bandeau',
    bandeauPage({
      titre: entete.titre || 'Disciplines & activités',
      chapeau: entete.chapeau || 'Les sports de pagaie encadrés par la fédération.',
      image: 'assets/img/banner-disciplines.svg',
      fil: 'Pratique',
      section: 'Disciplines & activités'
    })
  );

  /* ------------------------------------------------ l'essentiel */
  remplir(
    'essentiel',
    blocEssentiel({
      points: [
        {
          icone: 'pagaie',
          titre: "De l'initiation au haut niveau",
          texte: 'Des séances découverte aux compétitions, chaque discipline a son parcours.'
        },
        {
          icone: 'utilisateurs',
          titre: 'Pour tous les âges',
          texte: 'Des catégories jeunes et adultes, encadrées par des éducateurs fédéraux.'
        },
        {
          icone: 'globe',
          titre: 'Partout au Togo',
          texte: 'Lacs, lagunes et rivières accueillent la pagaie dans les cinq régions.'
        },
        {
          icone: 'diplome',
          titre: 'Des formations reconnues',
          texte: 'Encadrants et officiels techniques formés tout au long de la saison.'
        }
      ]
    })
  );

  texte('entete-chapeau', entete.chapeau);
  texte('entete-texte', entete.texte);

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

  /* ------------------------------------------------ parcours */
  texte('parcours-titre', parcours.titre);
  texte('parcours-intro', parcours.introduction);
  remplir(
    'parcours-etapes',
    (parcours.etapes || [])
      .map(
        (etape, index) => `
      <article class="revele flex flex-col rounded-2xl border border-white/12 bg-white/[0.06] p-6" data-delai="${
        index * 80
      }">
        <div class="flex items-center justify-between">
          <span class="font-display text-3xl font-extrabold text-white/15">${esc(etape.numero)}</span>
          <span class="grid h-11 w-11 place-items-center rounded-xl bg-soleil-400 text-vert-950">${icone(
            etape.icone,
            'h-5 w-5'
          )}</span>
        </div>
        <h3 class="mt-4 font-display text-base font-bold text-white">${esc(etape.titre)}</h3>
        <p class="mt-2 flex-1 text-sm leading-relaxed text-vert-50/80">${esc(etape.texte)}</p>
        <dl class="mt-4 space-y-1 border-t border-white/10 pt-4 text-xs text-vert-50/70">
          <div class="flex justify-between gap-3"><dt class="text-soleil-300">Public</dt><dd>${esc(etape.public)}</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-soleil-300">Durée</dt><dd class="text-right">${esc(etape.duree)}</dd></div>
        </dl>
      </article>`
      )
      .join('')
  );

  /* ------------------------------------------------ formations */
  texte('formations-titre', formations.titre);
  texte('formations-intro', formations.introduction);
  remplir(
    'formations-liste',
    `<table class="tableau-fetoc">
      <thead>
        <tr><th scope="col">Formation</th><th scope="col">Durée</th><th scope="col">Public</th><th scope="col">Contenu</th></tr>
      </thead>
      <tbody>
        ${(formations.liste || [])
          .map(
            (formation) => `
          <tr>
            <td class="font-medium text-vert-950">${esc(formation.nom)}</td>
            <td class="whitespace-nowrap">${esc(formation.duree)}</td>
            <td class="text-encre-doux">${esc(formation.public)}</td>
            <td class="text-encre-doux">${esc(formation.contenu)}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>`
  );
  const zoneNote = qs('[data-zone="formations-note"]');
  if (zoneNote && formations.calendrier_note) {
    zoneNote.innerHTML = `${icone('info', 'h-4 w-4 flex-none text-soleil-600')}<span>${esc(formations.calendrier_note)}</span>`;
  } else if (zoneNote) {
    zoneNote.classList.add('hidden');
  }

  /* ------------------------------------------------ sites de pratique */
  texte('sites-titre', sites.titre);
  texte('sites-intro', sites.introduction);
  remplir(
    'sites-grille',
    (sites.liste || [])
      .map(
        (site, index) => `
      <article class="revele carte group flex flex-col" data-delai="${(index % 3) * 80}">
        <div class="carte__media relative aspect-[16/10] overflow-hidden bg-vert-900">
          <img src="${esc(site.image)}" alt="${esc(site.nom)}" width="1200" height="800" loading="lazy" decoding="async" class="h-full w-full object-cover">
          <span class="absolute left-4 top-4">${pastille(site.region, 'sombre')}</span>
        </div>
        <div class="flex flex-1 flex-col p-6">
          <p class="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-vert-600">${esc(site.type)}</p>
          <h3 class="mt-2 font-display text-lg font-bold text-vert-950">${esc(site.nom)}</h3>
          <div class="mt-4 flex flex-wrap gap-1.5">${(site.usage || [])
            .map((u) => pastille(u, 'vert'))
            .join('')}</div>
        </div>
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
      const champs = [discipline.nom, discipline.nom_court, discipline.accroche, discipline.description];
      if (!champs.some((champ) => correspond(champ, etat.requete))) return false;
    }
    return true;
  });

  const grille = qs('[data-zone="disciplines-grille"]');
  if (!grille) return;

  if (!liste.length) {
    grille.innerHTML = `<p class="col-span-full rounded-2xl border border-dashed border-sable-300 bg-white px-6 py-14 text-center text-sm text-encre-doux">
      Aucune discipline ne correspond à cette recherche.</p>`;
  } else {
    grille.innerHTML = liste.map(carteDiscipline).join('');
    ui.initRevelation(grille);
  }

  const compteur = qs('[data-zone="compteur-disciplines"]');
  if (compteur) {
    compteur.textContent = `${liste.length} discipline${liste.length > 1 ? 's' : ''} affichée${
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
        const faits = [
          ['Public', discipline.public],
          ['Niveau', discipline.niveau],
          ['Saison', discipline.saison]
        ];
        return `
        <article id="${esc(discipline.id)}" class="revele scroll-mt-32 overflow-hidden rounded-3xl border border-sable-200 bg-white lg:grid lg:grid-cols-[0.85fr_1.15fr]">
          <div class="relative aspect-[16/10] overflow-hidden bg-vert-900 lg:aspect-auto lg:h-full">
            <img src="${esc(discipline.image)}" alt="${esc(discipline.nom)}" width="1200" height="800" loading="lazy" decoding="async" class="h-full w-full object-cover">
            ${
              discipline.olympique
                ? `<span class="absolute left-4 top-4">${pastille('Discipline olympique', 'soleil')}</span>`
                : ''
            }
          </div>
          <div class="p-7 sm:p-10">
            <div class="flex items-center gap-3">
              <span class="grid h-11 w-11 place-items-center rounded-xl bg-vert-50 text-vert-700">${icone(
                discipline.icone,
                'h-5 w-5'
              )}</span>
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-vert-600">${esc(
                libelleFamille(discipline.famille)
              )}</p>
            </div>
            <h3 class="mt-4 font-display text-2xl font-bold text-vert-950">${esc(discipline.nom)}</h3>
            <p class="mt-3 text-base leading-relaxed text-encre-doux">${esc(discipline.description)}</p>

            <dl class="mt-6 grid gap-4 sm:grid-cols-3">
              ${faits
                .map(
                  ([libelle, valeur]) => `
                <div class="rounded-xl border border-sable-200 bg-sable-50 p-3">
                  <dt class="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-encre-clair">${esc(
                    libelle
                  )}</dt>
                  <dd class="mt-1 text-sm font-medium text-vert-950">${esc(valeur)}</dd>
                </div>`
                )
                .join('')}
            </dl>

            <div class="mt-6 space-y-4 border-t border-sable-200 pt-6">
              <div>
                <p class="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-encre-clair">Embarcations</p>
                <div class="mt-2 flex flex-wrap gap-1.5">${(discipline.embarcations || [])
                  .map((e) => pastille(e, 'gris'))
                  .join('')}</div>
              </div>
              <div>
                <p class="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-encre-clair">Catégories</p>
                <div class="mt-2 flex flex-wrap gap-1.5">${(discipline.categories || [])
                  .map((c) => pastille(c, 'vert'))
                  .join('')}</div>
              </div>
              <p class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-encre-doux">
                <span class="inline-flex items-center gap-1.5">${icone(
                  'lieu',
                  'h-4 w-4 text-vert-600'
                )}${esc((discipline.sites || []).join(' · '))}</span>
              </p>
            </div>
          </div>
        </article>`;
      })
      .join('')
  );
}
