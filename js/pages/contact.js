/* ==========================================================================
   FETOC - Page « Contact & adhésion »
   Coordonnées officielles, formulaire de contact, adhésion des clubs,
   licences et partenariats.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { data, contact, partenairesAffiches } from '../core/data.js';
import { bandeauPage, cartePartenaire, blocEssentiel } from '../core/cartes.js';
import { qs, qsa, esc } from '../core/utils.js';
import { icone } from '../core/icons.js';

demarrer().then(rendre);

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

const tel = (numero = '') => `tel:${String(numero).replace(/[^\d+]/g, '')}`;
const wa = (numero = '') => `https://wa.me/${String(numero).replace(/\D/g, '')}`;

function rendre() {
  const coord = contact();
  const partenariat = data.partenaires?.devenir_partenaire ?? {};

  /* ------------------------------------------------ bandeau */
  remplir(
    'bandeau',
    bandeauPage({
      titre: 'Contact & adhésion',
      chapeau:
        "Une question, un projet de club, une demande de licence ou l'envie de nous soutenir ? Le secrétariat fédéral vous répond et vous oriente.",
      image: 'assets/img/banner-contact.svg',
      fil: 'Nous joindre',
      section: 'Contact & adhésion'
    })
  );

  /* ------------------------------------------------ l'essentiel */
  remplir(
    'essentiel',
    blocEssentiel({
      points: [
        {
          icone: 'utilisateurs',
          titre: 'Adhésion',
          texte: "Affilier un club ou une structure à la fédération."
        },
        {
          icone: 'diplome',
          titre: 'Licences',
          texte: 'Pratiquer en club avec une licence fédérale.'
        },
        {
          icone: 'main',
          titre: 'Partenariat',
          texte: 'Soutenir la pagaie togolaise et gagner en visibilité.'
        },
        {
          icone: 'eclair',
          titre: 'Réponse du secrétariat',
          texte: 'Votre demande est orientée vers la commission compétente.'
        }
      ]
    })
  );

  /* ------------------------------------------------ coordonnées */
  remplir('coordonnees-grille', cartesCoordonnees(coord));

  /* ------------------------------------------------ formulaire : accroches */
  remplir('formulaire-sujets', accrochesSujets().map(ligneSujet).join(''));
  remplir('formulaire-rapide', carteRapide(coord));

  /* ------------------------------------------------ adhésion */
  remplir('adhesion-etapes', etapesAdhesion().map(etapeAdhesion).join(''));
  remplir(
    'adhesion-pieces',
    piecesAdhesion()
      .map(
        (piece) =>
          `<li class="flex items-start gap-3"><span class="mt-0.5 flex-none text-vert-600">${icone(
            'check-cercle',
            'h-4 w-4'
          )}</span><span>${esc(piece)}</span></li>`
      )
      .join('')
  );

  /* ------------------------------------------------ licences */
  remplir('licences-cartes', cartesLicences(coord));

  /* ------------------------------------------------ partenariat */
  texte('partenariat-titre', partenariat.titre || 'Devenir partenaire');
  texte('partenariat-texte', partenariat.texte);
  remplir(
    'partenariat-contreparties',
    (partenariat.contreparties || [])
      .map(
        (contrepartie) =>
          `<li class="flex items-start gap-3 rounded-xl border border-sable-200 bg-sable-50 px-4 py-3 text-sm leading-relaxed text-encre-doux">
            <span class="mt-0.5 flex-none text-soleil-600">${icone('etoile', 'h-4 w-4')}</span><span>${esc(
            contrepartie
          )}</span></li>`
      )
      .join('')
  );
  remplir('partenariat-contact', cartePartenariat(partenariat));
  remplir('partenariat-logos', partenairesAffiches().map((p) => cartePartenaire(p)).join(''));

  /* ------------------------------------------------ lien boutons → objet du formulaire */
  qsa('a[data-sujet]').forEach((lien) => {
    lien.addEventListener('click', () => {
      const select = qs('#contact-sujet');
      if (select) {
        select.value = lien.dataset.sujet;
        select.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });

  /* ------------------------------------------------ formulaire */
  ui.initFormulaire(qs('[data-formulaire="contact"]'), {
    surEnvoi: () => new Promise((resoudre) => setTimeout(resoudre, 700))
  });

  ui.initRevelation();
}

/* ------------------------------------------------------------------ coordonnées */
function cartesCoordonnees(coord) {
  const adresse = [coord.adresse, [coord.quartier, coord.ville].filter(Boolean).join(' '), coord.pays]
    .filter(Boolean)
    .map((ligne) => `<p>${esc(ligne)}</p>`)
    .join('');
  const postale = coord.boite_postale
    ? `<p class="mt-2 text-xs text-encre-clair">${esc(coord.boite_postale)}</p>`
    : '';

  const telephones = [
    coord.telephone ? lienTel(coord.telephone, 'telephone', 'Standard') : '',
    coord.telephone_2 ? lienTel(coord.telephone_2, 'telephone', 'Secrétariat') : '',
    coord.whatsapp
      ? `<a href="${esc(wa(coord.whatsapp))}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2.5 transition hover:text-vert-700">
           ${icone('whatsapp', 'h-4 w-4 flex-none text-vert-600')}<span>${esc(coord.whatsapp)}</span>
           <span class="pastille pastille--vert">WhatsApp</span></a>`
      : ''
  ]
    .filter(Boolean)
    .join('');

  const courriels = [
    { valeur: coord.email, libelle: 'Secrétariat général' },
    { valeur: coord.email_presse, libelle: 'Presse & médias' },
    { valeur: coord.email_licences, libelle: 'Licences & engagements' }
  ]
    .filter((item) => item.valeur)
    .map(
      (item) => `
      <div>
        <a href="mailto:${esc(item.valeur)}" class="flex items-center gap-2.5 font-medium text-vert-950 transition hover:text-vert-700">
          ${icone('mail', 'h-4 w-4 flex-none text-vert-600')}${esc(item.valeur)}
        </a>
        <p class="ml-6 text-xs text-encre-clair">${esc(item.libelle)}</p>
      </div>`
    )
    .join('');

  const horaires = (coord.horaires || [])
    .map(
      (horaire) => `
      <div class="flex items-baseline justify-between gap-4 border-b border-dashed border-sable-200 pb-2 last:border-0 last:pb-0">
        <span class="font-medium text-vert-950">${esc(horaire.jours)}</span>
        <span class="text-right text-encre-doux">${esc(horaire.heures)}</span>
      </div>`
    )
    .join('');

  const base = coord.base_nautique || {};

  return [
    carteCoordonnee('lieu', 'Siège fédéral', adresse + postale),
    carteCoordonnee('telephone', 'Téléphone & WhatsApp', telephones),
    carteCoordonnee('mail', 'Adresses e-mail', courriels),
    carteCoordonnee('horloge', "Horaires d'ouverture", horaires),
    carteCoordonnee(
      'ancre',
      base.nom || 'Base nautique',
      `<p>${esc(base.adresse || '')}</p>${
        base.indicatif ? `<p class="text-xs text-encre-clair">${esc(base.indicatif)}</p>` : ''
      }`,
      { classe: 'sm:col-span-2 lg:col-span-2' }
    )
  ].join('');
}

function lienTel(numero, nomIcone, libelle) {
  return `<a href="${esc(tel(numero))}" class="flex items-center gap-2.5 transition hover:text-vert-700">
      ${icone(nomIcone, 'h-4 w-4 flex-none text-vert-600')}
      <span>${esc(numero)}</span>
      ${libelle ? `<span class="text-xs text-encre-clair">${esc(libelle)}</span>` : ''}
    </a>`;
}

function carteCoordonnee(nomIcone, titre, corps, { classe = '' } = {}) {
  return `
  <article class="revele flex gap-5 rounded-2xl border border-sable-200 bg-white p-6 ${classe}">
    <span class="grid h-12 w-12 flex-none place-items-center rounded-xl bg-vert-50 text-vert-700">${icone(
      nomIcone,
      'h-5 w-5'
    )}</span>
    <div class="min-w-0 flex-1">
      <h3 class="font-display text-base font-bold text-vert-950">${esc(titre)}</h3>
      <div class="mt-3 space-y-2 text-sm leading-relaxed text-encre-doux">${corps}</div>
    </div>
  </article>`;
}

/* ------------------------------------------------------------------ formulaire */
function accrochesSujets() {
  return [
    { icone: 'plus', texte: "Adhésion ou affiliation d'un club, création d'une structure." },
    { icone: 'diplome', texte: 'Licences des pratiquants, catégories et engagements en compétition.' },
    { icone: 'main', texte: "Partenariat, mécénat ou parrainage d'une épreuve." },
    { icone: 'camera', texte: 'Presse, médias et demandes de reportage.' }
  ];
}

function ligneSujet(sujet) {
  return `<li class="flex items-start gap-3 text-sm leading-relaxed text-encre-doux">
      <span class="grid h-8 w-8 flex-none place-items-center rounded-lg bg-vert-50 text-vert-700">${icone(
        sujet.icone,
        'h-4 w-4'
      )}</span>
      <span class="pt-1">${esc(sujet.texte)}</span>
    </li>`;
}

function carteRapide(coord) {
  return `
  <div class="rounded-2xl border border-soleil-300 bg-soleil-50 p-6">
    <p class="flex items-center gap-2 font-display text-sm font-bold text-vert-900">${icone(
      'eclair',
      'h-4 w-4 text-soleil-600'
    )}Besoin d'une réponse rapide ?</p>
    <p class="mt-2 text-sm leading-relaxed text-encre-doux">
      Appelez le standard pendant les heures d'ouverture ou écrivez-nous sur WhatsApp.
    </p>
    <div class="mt-5 flex flex-wrap gap-3">
      ${coord.telephone ? `<a href="${esc(tel(coord.telephone))}" class="btn btn--vert btn--sm">${icone('telephone', 'h-4 w-4')}${esc(coord.telephone)}</a>` : ''}
      ${coord.whatsapp ? `<a href="${esc(wa(coord.whatsapp))}" target="_blank" rel="noopener noreferrer" class="btn btn--contour btn--sm">${icone('whatsapp', 'h-4 w-4')}WhatsApp</a>` : ''}
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ adhésion */
function etapesAdhesion() {
  return [
    {
      titre: 'Prendre contact',
      texte:
        "Écrivez au secrétariat en présentant votre projet, votre ville et le site de pratique envisagé."
    },
    {
      titre: 'Constituer le dossier',
      texte:
        "Rassemblez les statuts de l'association, la liste des dirigeants, la fiche de renseignements et le nombre de pratiquants."
    },
    {
      titre: 'Visite technique',
      texte:
        "La commission compétente évalue le plan d'eau, l'accès et les conditions de sécurité avec le club candidat."
    },
    {
      titre: 'Décision et affiliation',
      texte:
        "Le comité exécutif statue sur l'affiliation ; la fédération remet alors au club les documents officiels et son accès aux dispositifs fédéraux."
    }
  ];
}

function etapeAdhesion(etape, index) {
  return `
  <li class="revele flex gap-5" data-delai="${index * 80}">
    <span class="grid h-11 w-11 flex-none place-items-center rounded-full bg-vert-700 font-display text-base font-extrabold text-white">${index + 1}</span>
    <div>
      <h3 class="font-display text-lg font-bold text-vert-950">${esc(etape.titre)}</h3>
      <p class="mt-1.5 text-sm leading-relaxed text-encre-doux">${esc(etape.texte)}</p>
    </div>
  </li>`;
}

function piecesAdhesion() {
  return [
    "Statuts et récépissé de déclaration de l'association",
    'Liste des membres du bureau et du responsable technique',
    'Fiche de renseignements du club et de son site de pratique',
    'Inventaire du matériel nautique et des équipements de sécurité',
    "Attestation d'assurance en cours de validité"
  ];
}

/* ------------------------------------------------------------------ licences */
function cartesLicences(coord) {
  const cartes = [
    {
      icone: 'utilisateurs',
      titre: 'Pour qui ?',
      texte:
        "De l'école de pagaie aux catégories masters, la licence est ouverte à tous les pratiquants inscrits dans un club affilié à la fédération."
    },
    {
      icone: 'bouclier',
      titre: "Ce qu'elle permet",
      texte:
        "Accès encadré aux entraînements et aux compétitions officielles, couverture par l'assurance fédérale et suivi des résultats au fil de la saison."
    },
    {
      icone: 'fichier',
      titre: "Comment l'obtenir ?",
      texte:
        "La demande est déposée par le club auprès du secrétariat, accompagnée des pièces d'identité, du certificat médical et du règlement de la cotisation."
    }
  ];

  return cartes
    .map(
      (carte, index) => `
    <article class="revele carte flex flex-col p-6" data-delai="${(index % 3) * 90}">
      <span class="grid h-12 w-12 place-items-center rounded-xl bg-vert-50 text-vert-700">${icone(
        carte.icone,
        'h-6 w-6'
      )}</span>
      <h3 class="mt-5 font-display text-lg font-bold text-vert-950">${esc(carte.titre)}</h3>
      <p class="mt-2 text-sm leading-relaxed text-encre-doux">${esc(carte.texte)}</p>
    </article>`
    )
    .join('') +
    (coord.email_licences
      ? `<p class="revele md:col-span-3 text-sm text-encre-clair">Pour toute question sur les licences, écrivez à
           <a href="mailto:${esc(coord.email_licences)}" class="font-semibold text-vert-700 underline">${esc(
             coord.email_licences
           )}</a>.</p>`
      : '');
}

/* ------------------------------------------------------------------ partenariat */
function cartePartenariat(partenariat) {
  return `
  <div class="rounded-2xl border border-sable-200 bg-sable-50 p-6">
    <p class="flex items-center gap-2 font-display text-sm font-bold text-vert-900">${icone(
      'mail',
      'h-4 w-4 text-vert-600'
    )}Commission partenariats</p>
    ${
      partenariat.contact
        ? `<a href="mailto:${esc(partenariat.contact)}" class="mt-3 inline-flex items-center gap-2.5 font-medium text-vert-950 transition hover:text-vert-700">
             ${icone('fleche-droite', 'h-4 w-4 text-vert-600')}${esc(partenariat.contact)}
           </a>`
        : ''
    }
    <a href="#formulaire" data-sujet="partenariat" class="btn btn--vert btn--sm mt-5">Proposer un partenariat</a>
  </div>`;
}
