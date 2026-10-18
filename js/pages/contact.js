/* ==========================================================================
   FETOC - Page « Contact »
   Seules les coordonnées publiquement documentées : compte Instagram
   officiel et fiche auprès de la Fédération internationale de canoë-kayak.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { data, contact, partenairesAffiches } from '../core/data.js';
import { bandeauPage, cartePartenaire, blocEssentiel } from '../core/cartes.js';
import { qs, esc } from '../core/utils.js';
import { icone } from '../core/icons.js';

demarrer().then(rendre);

function remplir(zone, html) {
  const element = qs(`[data-zone="${zone}"]`);
  if (element) element.innerHTML = html;
  return element;
}

function rendre() {
  const coord = contact();
  const site = data.site?.identite ?? {};

  /* ------------------------------------------------ bandeau */
  remplir(
    'bandeau',
    bandeauPage({
      titre: 'Contact',
      chapeau:
        'La FETOC se joint aujourd’hui par son compte Instagram officiel et sa fiche auprès de la Fédération internationale de canoë-kayak.',
      image: 'assets/img/banner-contact.svg',
      fil: 'Nous joindre',
      section: 'Contact'
    })
  );

  /* ------------------------------------------------ l'essentiel */
  remplir(
    'essentiel',
    blocEssentiel({
      points: [
        {
          icone: 'instagram',
          titre: 'Instagram officiel',
          texte: 'Le canal de contact public de la fédération : @fetoc_togo.'
        },
        {
          icone: 'globe',
          titre: 'Fiche ICF',
          texte: 'La fédération est référencée auprès de la Fédération internationale de canoë-kayak.'
        },
        {
          icone: 'lieu',
          titre: 'Siège',
          texte: `${site.siege || 'Agbodrafo, préfecture des Lacs'}.`
        },
        {
          icone: 'calendrier',
          titre: 'Création',
          texte: 'Fédération créée le 13 février 2024 à Agbodrafo.'
        }
      ]
    })
  );

  /* ------------------------------------------------ introduction */
  const intro = qs('[data-zone="contact-intro"]');
  if (intro) intro.textContent = coord.note || '';

  /* ------------------------------------------------ coordonnées */
  const cartes = [];

  if (coord.instagram) {
    cartes.push(`
      <a href="${esc(coord.instagram.url)}" target="_blank" rel="noopener noreferrer"
         class="revele group flex flex-col rounded-2xl border border-sable-200 bg-white p-6 transition hover:border-vert-200 hover:shadow-doux">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-vert-50 text-vert-700">
          ${icone('instagram', 'h-6 w-6')}
        </span>
        <span class="mt-5 font-display text-lg font-bold text-vert-950">${esc(coord.instagram.nom)}</span>
        <span class="mt-1 text-sm font-semibold text-vert-700">${esc(coord.instagram.pseudo)}</span>
        <span class="mt-3 text-sm leading-relaxed text-encre-doux">Le canal privilégié pour toute demande : clubs, médias, partenaires et pratiquants.</span>
        <span class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-vert-700">
          Ouvrir le compte ${icone('fleche-droite', 'h-4 w-4')}
        </span>
      </a>`);
  }

  if (coord.federation_internationale) {
    cartes.push(`
      <a href="${esc(coord.federation_internationale.url)}" target="_blank" rel="noopener noreferrer"
         class="revele group flex flex-col rounded-2xl border border-sable-200 bg-white p-6 transition hover:border-vert-200 hover:shadow-doux">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-soleil-100 text-soleil-700">
          ${icone('globe', 'h-6 w-6')}
        </span>
        <span class="mt-5 font-display text-lg font-bold text-vert-950">Fédération internationale</span>
        <span class="mt-1 text-sm font-semibold text-vert-700">${esc(coord.federation_internationale.nom)}</span>
        <span class="mt-3 text-sm leading-relaxed text-encre-doux">La FETOC figure parmi les fédérations nationales référencées par l’ICF.</span>
        <span class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-vert-700">
          Consulter l’ICF ${icone('fleche-droite', 'h-4 w-4')}
        </span>
      </a>`);
  }

  cartes.push(`
      <div class="revele flex flex-col rounded-2xl border border-sable-200 bg-sable-50 p-6">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-white text-vert-700">
          ${icone('lieu', 'h-6 w-6')}
        </span>
        <span class="mt-5 font-display text-lg font-bold text-vert-950">Siège de la fédération</span>
        <span class="mt-1 text-sm font-semibold text-vert-700">${esc(site.siege || 'Agbodrafo, préfecture des Lacs')}</span>
        <span class="mt-3 text-sm leading-relaxed text-encre-doux">Lieu de l’assemblée générale constitutive du 13 février 2024. Aucune adresse postale publique n’est encore communiquée.</span>
      </div>`);

  remplir('coordonnees-grille', cartes.join(''));

  /* ------------------------------------------------ orientation */
  const orientations = [
    {
      icone: 'pagaie',
      titre: 'Pratiquer',
      texte: 'Découvrir les activités encadrées par la fédération et ses clubs.',
      libelle: 'Disciplines & activités',
      url: 'disciplines.html'
    },
    {
      icone: 'reseau',
      titre: 'Rejoindre un club',
      texte: 'Consulter les clubs affiliés publiquement cités.',
      libelle: 'Clubs affiliés',
      url: 'clubs.html'
    },
    {
      icone: 'trophee',
      titre: 'Suivre la compétition',
      texte: 'Les rendez-vous et résultats documentés de la fédération.',
      libelle: 'Compétitions & résultats',
      url: 'competitions.html'
    }
  ];

  remplir(
    'orientation-grille',
    orientations
      .map(
        (bloc, index) => `
      <article class="revele flex flex-col rounded-2xl border border-sable-200 bg-white p-6" data-delai="${index * 70}">
        <span class="grid h-11 w-11 place-items-center rounded-xl bg-vert-50 text-vert-700">${icone(
          bloc.icone,
          'h-5 w-5'
        )}</span>
        <h3 class="mt-5 font-display text-lg font-bold text-vert-950">${esc(bloc.titre)}</h3>
        <p class="mt-2 flex-1 text-sm leading-relaxed text-encre-doux">${esc(bloc.texte)}</p>
        <a href="${esc(bloc.url)}" class="lien-fleche mt-5 inline-flex items-center gap-2 text-sm font-semibold text-vert-700 transition hover:text-vert-900">
          ${esc(bloc.libelle)}${icone('fleche-droite', 'h-4 w-4')}
        </a>
      </article>`
      )
      .join('')
  );

  /* ------------------------------------------------ partenaires cités */
  const partenaires = partenairesAffiches();
  remplir(
    'contact-note',
    `
    <div class="rounded-3xl border border-sable-200 bg-sable-50 p-8 sm:p-10">
      <div class="max-w-2xl">
        <p class="etiquette text-vert-600">Partenaires</p>
        <h2 class="mt-4 font-display text-2xl font-bold text-vert-950">Acteurs publiquement cités</h2>
        <p class="mt-3 text-sm leading-relaxed text-encre-doux">
          Ces acteurs apparaissent dans les activités documentées de la fédération. Être cité lors d’un événement ne signifie pas nécessairement un partenariat institutionnel permanent.
        </p>
      </div>
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${partenaires.map((partenaire) => cartePartenaire(partenaire)).join('')}
      </div>
    </div>`
  );

  ui.initRevelation();
}
