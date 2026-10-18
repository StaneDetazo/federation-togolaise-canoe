/* ==========================================================================
   FETOC - Ossature du site (en-tête, navigation, pied de page)
   Injectée sur toutes les pages pour éviter la duplication de code.
   ========================================================================== */

import { qs, esc } from './utils.js';
import { icone } from './icons.js';
import { data, site, contact, reseaux, navigation, appelAction } from './data.js';

/* ---------------------------------------------------------------- réseaux sociaux */
export function pastillesSociales(classes = '', variante = 'clair') {
  const fond =
    variante === 'clair'
      ? 'bg-white/10 hover:bg-white/25 text-white'
      : 'bg-vert-50 hover:bg-vert-100 text-vert-700';
  return reseaux()
    .map(
      (r) => `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer"
        title="${esc(r.nom)}${r.pseudo ? ` - ${esc(r.pseudo)}` : ''}"
        class="grid h-8 w-8 place-items-center rounded-full transition ${fond} ${classes}">
        ${icone(r.id, 'h-4 w-4')}<span class="sr-only">${esc(r.nom)}</span>
      </a>`
    )
    .join('');
}

function lienNav(item, pageActive) {
  const actif = item.id === pageActive;
  return `<li><a class="lien-nav" href="${esc(item.url)}"${
    actif ? ' aria-current="page"' : ''
  }>${esc(item.libelle)}</a></li>`;
}

/* ---------------------------------------------------------------- en-tête */
function gabaritEntete(pageActive) {
  const identite = site();

  return `
  <div class="barre-progression" id="barre-progression" aria-hidden="true"></div>
  <header id="entete" class="entete fixed inset-x-0 top-0 z-50 border-b border-transparent">
    <div class="entete__barre bg-vert-950 text-white">
      <div class="mx-auto flex max-w-ecran flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 sm:px-6">
        <p class="flex items-center gap-2 text-[0.72rem] font-medium tracking-wide text-vert-100">
          ${icone('ancre', 'h-3.5 w-3.5 text-soleil-400')}
          <span class="hidden sm:inline">${esc(identite.baseline)}</span>
          <span class="sm:hidden">${esc(identite.sigle)} - ${esc(identite.pays)}</span>
        </p>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <a href="https://www.canoeicf.com/" target="_blank" rel="noopener noreferrer"
             class="hidden items-center gap-1.5 text-[0.72rem] font-medium text-vert-100 transition hover:text-white lg:flex">
            ${icone('globe', 'h-3.5 w-3.5')}Fédération internationale (ICF)</a>
          <div class="flex items-center gap-1.5">${pastillesSociales('', 'clair')}</div>
        </div>
      </div>
    </div>

    <div class="mx-auto flex max-w-ecran flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 lg:py-3">
      <a href="index.html" class="group flex flex-none items-center gap-3">
        <img src="assets/img/logo.png" alt="Logo de la ${esc(identite.nom)}" width="52" height="52"
             class="logo-marque h-11 w-11 shrink-0 transition duration-300 group-hover:scale-105 sm:h-12 sm:w-12">
        <span class="leading-tight">
          <span class="entete__nom block font-display text-[1.05rem] font-extrabold sm:text-[1.12rem]">${esc(
            identite.sigle
          )}</span>
          <span class="entete__sous-titre block max-w-[13rem] text-[0.62rem] font-medium uppercase leading-tight tracking-[0.12em]">Fédération Togolaise de Canoë</span>
        </span>
      </a>

      <nav class="hidden xl:block" aria-label="Navigation principale">
        <ul class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 xl:gap-x-4 2xl:gap-x-5">
          ${navigation().map((item) => lienNav(item, pageActive)).join('')}
        </ul>
      </nav>

      <div class="flex items-center gap-2">
        <a href="${esc(appelAction().url)}" class="btn btn--soleil btn--sm hidden xl:inline-flex">
          ${icone('plus', 'h-4 w-4')}${esc(appelAction().libelle)}
        </a>
        <button type="button" id="bouton-menu"
          class="grid h-11 w-11 place-items-center rounded-full border border-sable-200 text-vert-800 transition hover:bg-vert-50 xl:hidden"
          aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="panneau-mobile">
          ${icone('menu', 'h-5 w-5')}
        </button>
      </div>
    </div>
  </header>`;
}

/* ---------------------------------------------------------------- menu mobile */
function gabaritMenuMobile(pageActive) {
  const identite = site();
  const coord = contact();
  return `
  <div class="voile-mobile fixed inset-0 z-[55] bg-vert-950/60 backdrop-blur-sm xl:hidden" id="voile-mobile" hidden></div>
  <aside id="panneau-mobile" aria-hidden="true" aria-label="Menu mobile"
    class="panneau-mobile fixed right-0 top-0 z-[58] flex h-full w-[min(92vw,25rem)] flex-col overflow-y-auto bg-white shadow-haute xl:hidden">
    <div class="flex items-center justify-between border-b border-sable-200 px-5 py-4">
      <div class="flex items-center gap-3">
        <img src="assets/img/logo.png" alt="" width="40" height="40" class="logo-marque h-10 w-10">
        <div class="leading-tight">
          <p class="font-display text-sm font-extrabold text-vert-900">${esc(identite.sigle)}</p>
          <p class="text-[0.62rem] uppercase tracking-[0.14em] text-encre-clair">Navigation</p>
        </div>
      </div>
      <button type="button" id="bouton-fermer-menu"
        class="grid h-10 w-10 place-items-center rounded-full border border-sable-200 text-vert-800 transition hover:bg-vert-50"
        aria-label="Fermer le menu">${icone('fermer', 'h-5 w-5')}</button>
    </div>

    <nav class="flex-1 px-3 py-4" aria-label="Navigation mobile">
      <ul class="space-y-1">
        ${navigation()
          .map(
            (item) => `<li><a href="${esc(item.url)}"
            class="flex items-center justify-between rounded-xl px-4 py-3 text-[0.95rem] font-medium transition ${
              item.id === pageActive ? 'bg-vert-50 text-vert-700' : 'text-encre-doux hover:bg-sable-50'
            }">${esc(item.libelle)}${icone('chevron-droite', 'h-4 w-4 opacity-30')}</a></li>`
          )
          .join('')}
      </ul>
    </nav>

    <div class="space-y-4 border-t border-sable-200 px-5 py-5">
      <a href="${esc(appelAction().url)}" class="btn btn--vert w-full">${icone('plus', 'h-4 w-4')}${esc(
    appelAction().libelle
  )}</a>
      <div class="space-y-2.5 text-sm text-encre-doux">
        <p class="flex items-start gap-2.5">${icone(
          'lieu',
          'mt-0.5 h-4 w-4 flex-none text-vert-600'
        )}<span>Siège : ${esc(coord.siege)}<br>${esc(coord.pays)}</span></p>
        ${
          coord.email
            ? `<p class="flex items-center gap-2.5">${icone(
                'mail',
                'h-4 w-4 flex-none text-vert-600'
              )}<a class="break-all hover:text-vert-700" href="${esc(coord.email.url)}">${esc(
                coord.email.libelle
              )}</a></p>`
            : ''
        }
        ${(coord.telephones || [])
          .map(
            (tel) => `<p class="flex items-center gap-2.5">${icone(
              tel.whatsapp ? 'whatsapp' : 'telephone',
              'h-4 w-4 flex-none text-vert-600'
            )}<a class="hover:text-vert-700" href="${esc(tel.url)}">${esc(tel.libelle)}</a></p>`
          )
          .join('')}
        <p class="flex items-center gap-2.5">${icone(
          'instagram',
          'h-4 w-4 flex-none text-vert-600'
        )}<a class="hover:text-vert-700" href="${esc(coord.instagram?.url)}" target="_blank" rel="noopener noreferrer">${esc(
          coord.instagram?.pseudo
        )}</a></p>
      </div>
      <div class="flex items-center gap-2">${pastillesSociales('', 'sombre')}</div>
    </div>
  </aside>`;
}

/* ---------------------------------------------------------------- pied de page */
function gabaritPied() {
  const identite = site();
  const coord = contact();
  const pied = data.site?.pied ?? {};
  const lien = (l) => `<li><a href="${esc(l.url)}" class="group flex items-center gap-2 text-sm text-vert-100/85 transition hover:text-white">
        <span class="h-px w-3 bg-soleil-400/70 transition-all group-hover:w-5"></span>${esc(l.libelle)}</a></li>`;

  return `
  <footer class="pied relative mt-auto bg-vert-950 text-white">
    <svg class="block h-[40px] w-full text-vert-950" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
      <path fill="currentColor" d="M0 30c120-20 240-20 360 0s240 20 360 0 240-20 360 0 240 20 360 0v30H0z"/>
    </svg>

    <div class="mx-auto max-w-ecran px-4 pb-10 pt-2 sm:px-6">
      <div class="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div>
          <div class="flex items-center gap-3">
            <img src="assets/img/logo.png" alt="" width="48" height="48" class="logo-marque h-12 w-12">
            <div>
              <p class="font-display text-lg font-extrabold">${esc(identite.sigle)}</p>
              <p class="text-[0.68rem] uppercase tracking-[0.16em] text-soleil-300">${esc(identite.pays)}</p>
            </div>
          </div>
          <p class="mt-4 max-w-sm text-sm leading-relaxed text-vert-100/80">${esc(pied.description || '')}</p>
          <p class="mt-4 flex items-center gap-2 text-sm font-medium text-soleil-300">${icone('ancre', 'h-4 w-4')}Fondée le 13 février 2024 à Agbodrafo</p>
          <div class="mt-5 flex items-center gap-2">${pastillesSociales('', 'clair')}</div>
        </div>

        <nav aria-labelledby="pied-nav">
          <p id="pied-nav" class="font-display text-sm font-bold uppercase tracking-[0.12em]">Navigation</p>
          <ul class="mt-4 space-y-2.5">${navigation().map(lien).join('')}</ul>
        </nav>

        <nav aria-labelledby="pied-liens">
          <p id="pied-liens" class="font-display text-sm font-bold uppercase tracking-[0.12em]">Liens utiles</p>
          <ul class="mt-4 space-y-2.5">${(pied.liens_utiles || []).map(lien).join('')}</ul>
        </nav>

        <div>
          <p class="font-display text-sm font-bold uppercase tracking-[0.12em]">Nous joindre</p>
          <ul class="mt-4 space-y-3 text-sm text-vert-100/85">
            <li class="flex items-start gap-2.5">${icone('lieu', 'mt-0.5 h-4 w-4 flex-none text-soleil-400')}<span>Siège : ${esc(
    coord.siege
  )}<br>${esc(coord.pays)}</span></li>
            ${
              coord.email
                ? `<li class="flex items-center gap-2.5">${icone(
                    'mail',
                    'h-4 w-4 flex-none text-soleil-400'
                  )}<a href="${esc(coord.email.url)}" class="break-all transition hover:text-white">${esc(
                    coord.email.libelle
                  )}</a></li>`
                : ''
            }
            ${(coord.telephones || [])
              .map(
                (tel) => `<li class="flex items-center gap-2.5">${icone(
                  tel.whatsapp ? 'whatsapp' : 'telephone',
                  'h-4 w-4 flex-none text-soleil-400'
                )}<a href="${esc(tel.url)}" class="transition hover:text-white">${esc(tel.libelle)}</a></li>`
              )
              .join('')}
            <li class="flex items-center gap-2.5">${icone(
              'instagram',
              'h-4 w-4 flex-none text-soleil-400'
            )}<a href="${esc(coord.instagram?.url)}" target="_blank" rel="noopener noreferrer" class="transition hover:text-white">${esc(
    coord.instagram?.pseudo
  )}</a></li>
            <li class="flex items-center gap-2.5">${icone(
              'globe',
              'h-4 w-4 flex-none text-soleil-400'
            )}<a href="${esc(coord.federation_internationale?.url)}" target="_blank" rel="noopener noreferrer" class="transition hover:text-white">${esc(
    coord.federation_internationale?.nom
  )}</a></li>
          </ul>
        </div>
      </div>

      <div class="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-[0.78rem] text-vert-100/70 md:flex-row md:items-center md:justify-between">
        <p>© <span id="annee-courante">${new Date().getFullYear()}</span> ${esc(identite.nom)}${
    pied.credit ? ` - ${esc(pied.credit)}` : ''
  }</p>
        <ul class="flex flex-wrap items-center gap-x-5 gap-y-2">
          ${(pied.mentions || [])
            .map((m) => `<li><a href="${esc(m.url)}" class="transition hover:text-white">${esc(m.libelle)}</a></li>`)
            .join('')}
        </ul>
      </div>
    </div>
  </footer>`;
}

/* ---------------------------------------------------------------- montage */
export function initLayout(pageActive) {
  const ancreEntete = qs('#site-header');
  const ancrePied = qs('#site-footer');
  if (ancreEntete) ancreEntete.outerHTML = gabaritEntete(pageActive);
  if (ancrePied) ancrePied.outerHTML = gabaritPied();

  document.body.insertAdjacentHTML('beforeend', gabaritMenuMobile(pageActive));
  document.body.insertAdjacentHTML(
    'beforeend',
    `<button type="button" id="retour-haut" aria-label="Revenir en haut de la page"
      class="retour-haut fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-vert-700 text-white shadow-haute transition hover:bg-vert-600">
      ${icone('fleche-haut', 'h-5 w-5')}
    </button>
    <div id="zone-notification" class="notification" role="status" aria-live="polite"></div>`
  );
}
