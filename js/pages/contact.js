/* ==========================================================================
   FETOC - Page « Contact »
   Coordonnées officielles : e-mail, téléphone (dont WhatsApp),
   compte Instagram et fiche auprès de la Fédération internationale
   de canoë-kayak.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { contact, partenairesAffiches } from '../core/data.js';
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

  /* ------------------------------------------------ bandeau */
  remplir(
    'bandeau',
    bandeauPage({
      titre: 'Contact',
      chapeau:
        'Écrire, appeler ou passer par les canaux officiels : voici les coordonnées de la Fédération Togolaise de Canoë.',
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
          icone: 'mail',
          titre: 'E-mail',
          texte: 'fetoc228@gmail.com'
        },
        {
          icone: 'telephone',
          titre: 'Téléphone & WhatsApp',
          texte: 'Numéros au Togo, et WhatsApp depuis l’étranger.'
        },
        {
          icone: 'instagram',
          titre: 'Instagram',
          texte: 'Le compte officiel de la fédération : @fetoc_togo.'
        },
        {
          icone: 'lieu',
          titre: 'Siège social',
          texte: `${coord.siege || 'Agbodrafo, préfecture des Lacs'}.`
        }
      ]
    })
  );

  /* ------------------------------------------------ introduction */
  const intro = qs('[data-zone="contact-intro"]');
  if (intro) intro.textContent = coord.note || '';

  /* ------------------------------------------------ coordonnées */
  const cartes = [];

  if (coord.email) {
    cartes.push(`
      <a href="${esc(coord.email.url)}"
         class="revele group flex flex-col rounded-2xl border border-sable-200 bg-white p-6 transition hover:border-vert-200 hover:shadow-doux">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-vert-50 text-vert-700">
          ${icone('mail', 'h-6 w-6')}
        </span>
        <span class="mt-5 font-display text-lg font-bold text-vert-950">E-mail</span>
        <span class="mt-1 break-all text-sm font-semibold text-vert-700">${esc(coord.email.libelle)}</span>
        <span class="mt-3 text-sm leading-relaxed text-encre-doux">Pour les demandes d’affiliation, de partenariat et toute question officielle.</span>
        <span class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-vert-700">
          Écrire à la fédération ${icone('fleche-droite', 'h-4 w-4')}
        </span>
      </a>`);
  }

  if ((coord.telephones || []).length) {
    cartes.push(`
      <div class="revele flex flex-col rounded-2xl border border-sable-200 bg-white p-6">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-vert-50 text-vert-700">
          ${icone('telephone', 'h-6 w-6')}
        </span>
        <span class="mt-5 font-display text-lg font-bold text-vert-950">Téléphone</span>
        <ul class="mt-3 space-y-2.5">
          ${coord.telephones
            .map(
              (tel) => `<li class="flex flex-wrap items-center gap-2">
            <a href="${esc(tel.url)}"${tel.whatsapp ? ' target="_blank" rel="noopener noreferrer"' : ''} class="inline-flex items-center gap-2 text-sm font-semibold text-vert-700 transition hover:text-vert-900">
              ${icone(tel.whatsapp ? 'whatsapp' : 'telephone', 'h-4 w-4 flex-none')}${esc(tel.libelle)}
            </a>
            ${tel.whatsapp ? '<span class="pastille pastille--vert">WhatsApp</span>' : ''}
          </li>`
            )
            .join('')}
        </ul>
        <span class="mt-4 text-sm leading-relaxed text-encre-doux">Le numéro signalé « WhatsApp » permet aussi les échanges par messagerie.</span>
      </div>`);
  }

  if (coord.instagram) {
    cartes.push(`
      <a href="${esc(coord.instagram.url)}" target="_blank" rel="noopener noreferrer"
         class="revele group flex flex-col rounded-2xl border border-sable-200 bg-white p-6 transition hover:border-vert-200 hover:shadow-doux">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-vert-50 text-vert-700">
          ${icone('instagram', 'h-6 w-6')}
        </span>
        <span class="mt-5 font-display text-lg font-bold text-vert-950">${esc(coord.instagram.nom)}</span>
        <span class="mt-1 text-sm font-semibold text-vert-700">${esc(coord.instagram.pseudo)}</span>
        <span class="mt-3 text-sm leading-relaxed text-encre-doux">Les annonces et la vie de la fédération sont relayées sur le compte officiel.</span>
        <span class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-vert-700">
          Ouvrir le compte ${icone('fleche-droite', 'h-4 w-4')}
        </span>
      </a>`);
  }

  cartes.push(`
      <div class="revele flex flex-col rounded-2xl border border-sable-200 bg-sable-50 p-6">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-white text-vert-700">
          ${icone('lieu', 'h-6 w-6')}
        </span>
        <span class="mt-5 font-display text-lg font-bold text-vert-950">Siège social</span>
        <span class="mt-1 text-sm font-semibold text-vert-700">${esc(coord.siege || 'Agbodrafo, préfecture des Lacs')}</span>
        <span class="mt-3 text-sm leading-relaxed text-encre-doux">Siège de la fédération, lieu de l’assemblée générale constitutive du 13 février 2024.</span>
      </div>`);

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
      texte: 'Consulter les clubs affiliés.',
      libelle: 'Clubs affiliés',
      url: 'clubs.html'
    },
    {
      icone: 'trophee',
      titre: 'Suivre la compétition',
      texte: 'Les rendez-vous et le calendrier de la fédération.',
      libelle: 'Compétitions & calendrier',
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

  /* ------------------------------------------------ partenaires */
  const partenaires = partenairesAffiches();
  remplir(
    'contact-note',
    `
    <div class="rounded-3xl border border-sable-200 bg-sable-50 p-8 sm:p-10">
      <div class="max-w-2xl">
        <p class="etiquette text-vert-600">Partenaires</p>
        <h2 class="mt-4 font-display text-2xl font-bold text-vert-950">Institutions &amp; partenaires</h2>
        <p class="mt-3 text-sm leading-relaxed text-encre-doux">
          Institutions et organisations qui accompagnent les activités de la fédération.
        </p>
      </div>
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${partenaires.map((partenaire) => cartePartenaire(partenaire)).join('')}
      </div>
    </div>`
  );

  ui.initRevelation();
}
