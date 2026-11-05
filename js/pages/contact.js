/* ==========================================================================
   FETOC - Page « Contact »
   Coordonnées officielles : e-mail, téléphone (dont WhatsApp),
   réseaux sociaux officiels et fiche auprès de la Fédération
   internationale de canoë-kayak.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import { page, site, contact, partenairesAffiches, reseaux } from '../core/data.js';
import { bandeauPage, cartePartenaire } from '../core/cartes.js';
import { qs, esc } from '../core/utils.js';
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

function rendre() {
  const coord = contact();
  const identite = site();
  const pageContact = page('contact');
  const entete = pageContact.entete ?? {};
  const coordonnees = pageContact.coordonnees ?? {};
  const textes = coordonnees.cartes ?? {};
  const orientation = pageContact.orientation ?? {};
  const partenairesPage = pageContact.partenaires ?? {};

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

  /* ------------------------------------------------ en-tête des coordonnées */
  texte('coordonnees-etiquette', coordonnees.etiquette);
  texte('coordonnees-titre', coordonnees.titre);
  texte('coordonnees-organisation', coordonnees.organisation);

  /* ------------------------------------------------ coordonnées */
  const cartes = [];

  if (coord.email) {
    cartes.push(`
      <a href="${esc(coord.email.url)}"
         class="revele group flex flex-col rounded-2xl border border-sable-200 bg-white p-6 transition hover:border-vert-200 hover:shadow-doux">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-vert-50 text-vert-700">
          ${icone('mail', 'h-6 w-6')}
        </span>
        <span class="mt-5 font-display text-lg font-bold text-vert-950">${esc(
          textes.email?.titre
        )}</span>
        <span class="mt-1 break-all text-sm font-semibold text-vert-700">${esc(coord.email.libelle)}</span>
        <span class="mt-3 text-sm leading-relaxed text-encre-doux">${esc(
          textes.email?.description
        )}</span>
        <span class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-vert-700">
          ${esc(textes.email?.action)} ${icone('fleche-droite', 'h-4 w-4')}
        </span>
      </a>`);
  }

  if ((coord.telephones || []).length) {
    cartes.push(`
      <div class="revele flex flex-col rounded-2xl border border-sable-200 bg-white p-6">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-vert-50 text-vert-700">
          ${icone('telephone', 'h-6 w-6')}
        </span>
        <span class="mt-5 font-display text-lg font-bold text-vert-950">${esc(
          textes.telephone?.titre
        )}</span>
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
        <span class="mt-4 text-sm leading-relaxed text-encre-doux">${esc(
          textes.telephone?.note
        )}</span>
      </div>`);
  }

  reseaux().forEach((reseau) => {
    cartes.push(`
      <a href="${esc(reseau.url)}" target="_blank" rel="noopener noreferrer"
         class="revele group flex flex-col rounded-2xl border border-sable-200 bg-white p-6 transition hover:border-vert-200 hover:shadow-doux">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-vert-50 text-vert-700">
          ${icone(reseau.id, 'h-6 w-6')}
        </span>
        <span class="mt-5 font-display text-lg font-bold text-vert-950">${esc(reseau.nom)}</span>
        <span class="mt-1 text-sm font-semibold text-vert-700">${esc(reseau.pseudo || 'Page officielle')}</span>
        <span class="mt-3 text-sm leading-relaxed text-encre-doux">${esc(
          textes.reseaux?.description
        )}</span>
        <span class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-vert-700">
          ${esc(textes.reseaux?.action)} ${icone('fleche-droite', 'h-4 w-4')}
        </span>
      </a>`);
  });

  cartes.push(`
      <div class="revele flex flex-col rounded-2xl border border-sable-200 bg-sable-50 p-6">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-white text-vert-700">
          ${icone('lieu', 'h-6 w-6')}
        </span>
        <span class="mt-5 font-display text-lg font-bold text-vert-950">${esc(
          textes.siege?.titre
        )}</span>
        <span class="mt-1 text-sm font-semibold text-vert-700">${esc(identite.siege)}</span>
        <span class="mt-3 text-sm leading-relaxed text-encre-doux">${esc(
          textes.siege?.description
        )}</span>
      </div>`);

  if (coord.federation_internationale) {
    cartes.push(`
      <a href="${esc(coord.federation_internationale.url)}" target="_blank" rel="noopener noreferrer"
         class="revele group flex flex-col rounded-2xl border border-sable-200 bg-white p-6 transition hover:border-vert-200 hover:shadow-doux">
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-soleil-100 text-soleil-700">
          ${icone('globe', 'h-6 w-6')}
        </span>
        <span class="mt-5 font-display text-lg font-bold text-vert-950">${esc(
          textes.federation_internationale?.titre
        )}</span>
        <span class="mt-1 text-sm font-semibold text-vert-700">${esc(coord.federation_internationale.nom)}</span>
        <span class="mt-3 text-sm leading-relaxed text-encre-doux">${esc(
          textes.federation_internationale?.description
        )}</span>
        <span class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-vert-700">
          ${esc(textes.federation_internationale?.action)} ${icone('fleche-droite', 'h-4 w-4')}
        </span>
      </a>`);
  }

  remplir('coordonnees-grille', cartes.join(''));

  /* ------------------------------------------------ orientation */
  texte('orientation-etiquette', orientation.etiquette);
  texte('orientation-titre', orientation.titre);
  texte('orientation-chapeau', orientation.chapeau);
  texte('orientation-note', orientation.note);

  remplir(
    'orientation-grille',
    (orientation.liste || [])
      .map(
        (bloc, index) => `
      <article class="revele flex flex-col rounded-2xl border border-sable-200 bg-white p-6" data-delai="${index * 70}">
        <span class="grid h-11 w-11 place-items-center rounded-xl bg-vert-50 text-vert-700">${icone(
          bloc.icone,
          'h-5 w-5'
        )}</span>
        <h3 class="mt-5 font-display text-lg font-bold text-vert-950">${esc(bloc.titre)}</h3>
        <p class="mt-2 flex-1 text-sm leading-relaxed text-encre-doux">${esc(bloc.texte)}</p>
        <a href="${esc(bloc.lien?.url)}" class="lien-fleche mt-5 inline-flex items-center gap-2 text-sm font-semibold text-vert-700 transition hover:text-vert-900">
          ${esc(bloc.lien?.libelle)}${icone('fleche-droite', 'h-4 w-4')}
        </a>
      </article>`
      )
      .join('')
  );

  /* ------------------------------------------------ partenaires */
  const partenaires = partenairesAffiches();
  remplir(
    'partenaires',
    `
    <div class="rounded-3xl border border-sable-200 bg-sable-50 p-8 sm:p-10">
      <div class="max-w-2xl">
        <p class="etiquette text-vert-600">${esc(partenairesPage.etiquette)}</p>
        <h2 class="mt-4 font-display text-2xl font-bold text-vert-950">${esc(
          partenairesPage.titre
        )}</h2>
        <p class="mt-3 text-sm leading-relaxed text-encre-doux">
          ${esc(partenairesPage.chapeau)}
        </p>
      </div>
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${partenaires.map((partenaire) => cartePartenaire(partenaire)).join('')}
      </div>
    </div>`
  );

  ui.initRevelation();
}
