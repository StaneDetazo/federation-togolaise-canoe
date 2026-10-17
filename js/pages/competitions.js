/* ==========================================================================
   FETOC - Page « Compétitions & calendrier »
   Calendrier filtrable, résultats publiés, classements et informations
   pratiques pour les engagements.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import {
  data,
  agenda,
  saisons,
  typesEvenement,
  saisonCourante,
  derniersResultats,
  classements,
  libelleDiscipline
} from '../core/data.js';
import { bandeauPage, carteEvenement, blocEssentiel } from '../core/cartes.js';
import { qs, qsa, esc, dateLongue } from '../core/utils.js';
import { icone } from '../core/icons.js';

demarrer().then(rendre);

const etat = { saison: saisonCourante(), type: 'toutes' };

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
      titre: entete.titre || 'Compétitions & calendrier',
      chapeau: entete.chapeau || 'Le calendrier officiel de la fédération.',
      image: 'assets/img/banner-competitions.svg',
      fil: 'Vie sportive',
      section: 'Compétitions & calendrier'
    })
  );

  /* ------------------------------------------------ l'essentiel */
  remplir(
    'essentiel',
    blocEssentiel({
      points: [
        {
          icone: 'calendrier',
          titre: 'Le calendrier officiel',
          texte: 'Championnats, coupes, trophées, régates et stages de la saison.'
        },
        {
          icone: 'etoile',
          titre: 'Résultats et classements',
          texte: 'Les podiums et classements publiés au fil des épreuves.'
        },
        {
          icone: 'utilisateurs',
          titre: 'Pour tous les niveaux',
          texte: 'Épreuves jeunes, seniors et loisirs, sur tout le territoire.'
        },
        {
          icone: 'check-cercle',
          titre: 'Comment participer',
          texte: 'Engagements via un club affilié, avec une licence en règle.'
        }
      ]
    })
  );

  texte('entete-chapeau', entete.chapeau);
  texte('entete-texte', entete.texte);

  /* ------------------------------------------------ filtres saisons */
  const zoneSaisons = remplir(
    'filtres-saisons',
    saisons()
      .map(
        (saison) => `
      <button type="button" class="pastille-filtre${saison.id === etat.saison ? ' est-actif' : ''}"
        data-saison="${esc(saison.id)}" aria-pressed="${saison.id === etat.saison}">
        ${esc(saison.libelle)}${saison.statut === 'en cours' ? ' •' : ''}
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
  afficherResultats();
  afficherClassements();

  /* ------------------------------------------------ informations pratiques */
  texte('infos-titre', infos.titre || 'Informations pratiques');
  remplir(
    'infos-licences',
    (infos.licences || [])
      .map(
        (licence) => `
      <li class="revele flex items-start gap-3 text-sm leading-relaxed text-encre-doux">
        <span class="mt-0.5 flex-none text-vert-600">${icone('check-cercle', 'h-5 w-5')}</span>
        <span>${esc(licence)}</span>
      </li>`
      )
      .join('')
  );
  texte('infos-reglement', infos.reglement);
  texte('infos-contact', infos.contact);
  const iconeReglement = qs('[data-icone-reglement]');
  if (iconeReglement) iconeReglement.innerHTML = icone('documents', 'h-4 w-4 text-vert-600');

  ui.initRevelation();
}

/* ------------------------------------------------------------------ agenda */
function afficherAgenda() {
  const liste = agenda({ saison: etat.saison, type: etat.type });
  const zone = qs('[data-zone="agenda-liste"]');
  if (!zone) return;

  if (!liste.length) {
    zone.innerHTML = `<div class="col-span-full rounded-2xl border border-dashed border-sable-300 bg-white px-6 py-16 text-center">
      <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-vert-50 text-vert-600">${icone(
        'calendrier',
        'h-6 w-6'
      )}</span>
      <p class="mt-4 font-display text-lg font-bold text-vert-900">Aucun rendez-vous pour cette sélection</p>
      <p class="mx-auto mt-2 max-w-md text-sm text-encre-doux">Modifiez la saison ou le type de rendez-vous, ou consultez l'ensemble du calendrier fédéral.</p>
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
    compteur.textContent = `${liste.length} rendez-vous affiché${liste.length > 1 ? 's' : ''}.`;
  }
}

/* ------------------------------------------------------------------ résultats */
function afficherResultats() {
  const zoneTitre = qs('[data-zone="resultats-titre"]');
  if (zoneTitre) zoneTitre.textContent = 'Les derniers podiums';

  const resultats = derniersResultats(4);
  const zone = qs('[data-zone="resultats-liste"]');
  if (!zone) return;

  if (!resultats.length) {
    zone.innerHTML = `<p class="col-span-full rounded-2xl border border-dashed border-sable-300 bg-sable-50 px-6 py-12 text-center text-sm text-encre-doux">
      Les résultats seront publiés ici.</p>`;
    return;
  }

  const couleurs = ['text-soleil-600', 'text-encre-clair', 'text-encre-clair'];
  zone.innerHTML = resultats
    .map(
      (evenement) => `
    <article class="revele rounded-2xl border border-sable-200 bg-white p-6 sm:p-7">
      <div class="flex flex-wrap items-center gap-3">
        <span class="pastille pastille--vert">${esc(dateLongue(evenement.date_debut))}</span>
        <span class="text-xs text-encre-clair">${esc(evenement.lieu)}</span>
      </div>
      <h3 class="mt-3 font-display text-lg font-bold leading-snug text-vert-950">${esc(evenement.titre)}</h3>
      <ol class="mt-5 space-y-2">
        ${(evenement.resultats?.podium || [])
          .map(
            (ligne, index) => `
          <li class="flex items-center gap-4 rounded-xl bg-sable-50 px-4 py-3">
            <span class="grid h-8 w-8 flex-none place-items-center rounded-full bg-white font-display text-sm font-extrabold ${
              couleurs[index] || 'text-encre-clair'
            } shadow-doux">${esc(ligne.rang)}</span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-display text-sm font-semibold text-vert-950">${esc(ligne.nom)}</span>
              <span class="block text-xs text-encre-clair">${esc(ligne.club)}</span>
            </span>
            ${
              ligne.marque
                ? `<span class="flex-none font-display text-sm font-bold text-vert-700">${esc(ligne.marque)}</span>`
                : ''
            }
          </li>`
          )
          .join('')}
      </ol>
      <a href="competitions.html#${esc(evenement.id)}" class="lien-fleche mt-5 text-sm font-semibold text-vert-700">
        Voir l'épreuve ${icone('fleche-droite', 'h-4 w-4')}
      </a>
    </article>`
    )
    .join('');
}

/* ------------------------------------------------------------------ classements */
function afficherClassements() {
  const zoneTitre = qs('[data-zone="classements-titre"]');
  if (zoneTitre) zoneTitre.textContent = 'Classements de la saison';

  const liste = classements();
  const zone = qs('[data-zone="classements-liste"]');
  if (!zone) return;

  if (!liste.length) {
    zone.innerHTML = `<p class="rounded-2xl border border-dashed border-sable-300 bg-white px-6 py-12 text-center text-sm text-encre-doux">
      Les classements seront publiés au fil de la saison.</p>`;
    return;
  }

  zone.innerHTML = liste
    .map((classement) => {
      const entetes = classement.colonnes || ['Rang', 'Équipe', 'Catégorie', 'Points'];
      return `
      <article class="revele overflow-hidden rounded-2xl border border-sable-200 bg-white">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-sable-200 px-6 py-5">
          <div>
            <h3 class="font-display text-lg font-bold text-vert-950">${esc(classement.titre)}</h3>
            <p class="mt-1 text-xs text-encre-clair">${esc(
              libelleDiscipline(classement.discipline_id)
            )} · ${esc(classement.note)}</p>
          </div>
          <span class="pastille pastille--gris">${esc(classement.saison)}</span>
        </header>
        <div class="overflow-x-auto">
          <table class="tableau-fetoc">
            <thead>
              <tr>${entetes.map((entete) => `<th scope="col">${esc(entete)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${classement.lignes
                .map((ligne) => {
                  const troisieme = ligne.manches ?? ligne.categorie ?? '';
                  const nom = ligne.club_id
                    ? `<a href="club.html?id=${encodeURIComponent(ligne.club_id)}" class="font-medium text-vert-950 transition hover:text-vert-700">${esc(
                        ligne.nom
                      )}</a>`
                    : `<span class="font-medium text-vert-950">${esc(ligne.nom)}</span>`;
                  return `
                  <tr>
                    <td class="w-16 font-display font-bold text-vert-700">${esc(ligne.rang)}</td>
                    <td>${nom}</td>
                    <td class="text-encre-doux">${esc(troisieme)}</td>
                    <td class="font-display font-bold text-vert-950">${esc(ligne.points)}</td>
                  </tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </article>`;
    })
    .join('');
}
