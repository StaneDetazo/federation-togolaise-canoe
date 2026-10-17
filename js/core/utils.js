/* ==========================================================================
   FETOC - Utilitaires génériques
   ========================================================================== */

export const qs = (selecteur, contexte = document) => contexte.querySelector(selecteur);
export const qsa = (selecteur, contexte = document) => Array.from(contexte.querySelectorAll(selecteur));

/** Crée un élément DOM à partir d'une chaîne HTML. */
export function noeud(html) {
  const gabarit = document.createElement('template');
  gabarit.innerHTML = html.trim();
  return gabarit.content.firstElementChild;
}

/** Crée un fragment DOM à partir d'une chaîne HTML (plusieurs racines). */
export function fragment(html) {
  const gabarit = document.createElement('template');
  gabarit.innerHTML = html.trim();
  return gabarit.content;
}

/** Échappe le texte destiné à être injecté dans du HTML. */
export function esc(valeur) {
  if (valeur === null || valeur === undefined) return '';
  return String(valeur)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Construit une liste d'attributs à partir d'un objet. */
export function attrs(objet = {}) {
  return Object.entries(objet)
    .filter(([, v]) => v !== null && v !== undefined && v !== false)
    .map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`))
    .join(' ');
}

/* ---------------------------------------------------------------- réseau */
const cache = new Map();

/** Charge un fichier JSON (avec mise en cache en mémoire). */
export async function fetchJSON(chemin) {
  const url = new URL(chemin, document.baseURI).href;
  if (cache.has(url)) return cache.get(url);
  const promesse = fetch(url, { cache: 'no-cache' }).then((reponse) => {
    if (!reponse.ok) throw new Error(`Impossible de charger ${chemin} (${reponse.status})`);
    return reponse.json();
  });
  cache.set(url, promesse);
  return promesse;
}

/* ---------------------------------------------------------------- dates */
const OPTIONS_LONGUES = { day: 'numeric', month: 'long', year: 'numeric' };
const OPTIONS_MOYENNES = { day: '2-digit', month: 'short', year: 'numeric' };

/** « 12 octobre 2026 » */
export function dateLongue(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('fr-FR', OPTIONS_LONGUES).format(new Date(`${iso}T12:00:00`));
}

/** « 12 oct. 2026 » */
export function dateCourte(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('fr-FR', OPTIONS_MOYENNES).format(new Date(`${iso}T12:00:00`));
}

/** « octobre 2026 » */
export function moisAnnee(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(
    new Date(`${iso}T12:00:00`)
  );
}

/** Jour et mois séparés : { jour: '12', mois: 'oct.' } */
export function jourMois(iso) {
  if (!iso) return { jour: '', mois: '' };
  const d = new Date(`${iso}T12:00:00`);
  return {
    jour: new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(d),
    mois: new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(d).replace('.', '')
  };
}

/** « 21 – 22 novembre 2026 » ou « 21 nov. – 3 déc. 2026 » */
export function periode(debut, fin) {
  if (!debut) return '';
  if (!fin || fin === debut) return dateLongue(debut);
  const d1 = new Date(`${debut}T12:00:00`);
  const d2 = new Date(`${fin}T12:00:00`);
  const memeMois = d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  if (memeMois) {
    const j1 = new Intl.DateTimeFormat('fr-FR', { day: 'numeric' }).format(d1);
    return `${j1} – ${dateLongue(fin)}`;
  }
  return `${dateCourte(debut)} – ${dateLongue(fin)}`;
}

/** Nombre de jours restants avant une date (négatif si passée). */
export function joursRestants(iso) {
  const cible = new Date(`${iso}T12:00:00`);
  const aujourdhui = new Date();
  aujourdhui.setHours(12, 0, 0, 0);
  return Math.round((cible - aujourdhui) / 86400000);
}

/** Convertit un objet Date en « AAAA-MM-JJ ». */
export function iso(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/* ---------------------------------------------------------------- listes */
export function parDateDesc(liste, champ = 'date') {
  return [...liste].sort((a, b) => String(b[champ] || '').localeCompare(String(a[champ] || '')));
}

export function parDateAsc(liste, champ = 'date') {
  return [...liste].sort((a, b) => String(a[champ] || '').localeCompare(String(b[champ] || '')));
}

export function groupePar(liste, cle) {
  return liste.reduce((acc, item) => {
    const valeur = typeof cle === 'function' ? cle(item) : item[cle];
    (acc[valeur] = acc[valeur] || []).push(item);
    return acc;
  }, {});
}

export function unique(liste) {
  return Array.from(new Set(liste));
}

/* ---------------------------------------------------------------- texte */
export function sansAccents(texte = '') {
  return texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Recherche insensible à la casse et aux accents. */
export function correspond(texte = '', requete = '') {
  if (!requete) return true;
  return sansAccents(String(texte).toLowerCase()).includes(sansAccents(requete.toLowerCase()));
}

export function initiales(nom = '') {
  return nom
    .split(/\s+/)
    .filter((mot) => mot.length > 2 || /^[A-ZÀ-Ý]/.test(mot))
    .slice(0, 2)
    .map((mot) => mot[0])
    .join('')
    .toUpperCase();
}

export function tronquer(texte = '', longueur = 160) {
  if (texte.length <= longueur) return texte;
  return `${texte.slice(0, texte.lastIndexOf(' ', longueur)).trim()}…`;
}

export function deliberation(valeur) {
  return new Intl.NumberFormat('fr-FR').format(valeur);
}

/* ---------------------------------------------------------------- interaction */
export function debounce(fn, delai = 220) {
  let minuteur;
  return (...args) => {
    clearTimeout(minuteur);
    minuteur = setTimeout(() => fn(...args), delai);
  };
}

export function parametreUrl(nom, valeurParDefaut = null) {
  return new URLSearchParams(window.location.search).get(nom) ?? valeurParDefaut;
}

/** Copie un texte dans le presse-papier avec repli pour les navigateurs anciens. */
export async function copier(texte) {
  try {
    await navigator.clipboard.writeText(texte);
    return true;
  } catch (erreur) {
    const zone = document.createElement('textarea');
    zone.value = texte;
    zone.setAttribute('readonly', '');
    zone.style.position = 'fixed';
    zone.style.opacity = '0';
    document.body.appendChild(zone);
    zone.select();
    const ok = document.execCommand('copy');
    zone.remove();
    return ok;
  }
}

/** Vrai si l'élément est visible dans la fenêtre. */
export function dansFenetre(element, marge = 0) {
  const rect = element.getBoundingClientRect();
  return rect.top <= window.innerHeight + marge && rect.bottom >= -marge;
}

export const reduireMouvement = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
