/* ==========================================================================
   FETOC - Bibliothèque d'icônes (SVG en ligne, sans dépendance externe)
   Usage : icone('calendrier', 'w-5 h-5 text-vert-600')
   ========================================================================== */

/** Icônes au trait (stroke). */
const TRAIT = {
  'fleche-droite': '<path d="M5 12h13"/><path d="m12 5 7 7-7 7"/>',
  'fleche-gauche': '<path d="M19 12H6"/><path d="m12 5-7 7 7 7"/>',
  'fleche-haut': '<path d="M12 19V6"/><path d="m5 12 7-7 7 7"/>',
  'chevron-bas': '<path d="m6 9 6 6 6-6"/>',
  'chevron-haut': '<path d="m6 15 6-6 6 6"/>',
  'chevron-droite': '<path d="m9 6 6 6-6 6"/>',
  'chevron-gauche': '<path d="m15 6-6 6 6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  moins: '<path d="M5 12h14"/>',
  fermer: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  recherche: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  filtre: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  calendrier:
    '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  horloge: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3.2 2"/>',
  chrono:
    '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4.5l3 1.8"/><path d="M9.5 4h5"/><path d="M12 4v1.5"/>',
  lieu: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  utilisateur:
    '<path d="M19 20v-1.7a4.3 4.3 0 0 0-4.3-4.3H9.3A4.3 4.3 0 0 0 5 18.3V20"/><circle cx="12" cy="7.5" r="4"/>',
  utilisateurs:
    '<path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20"/><circle cx="9.5" cy="7.5" r="3.5"/><path d="M21 20v-1.5a4 4 0 0 0-3-3.9"/><path d="M15.5 4.2a4 4 0 0 1 0 7.6"/>',
  mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path d="m3.2 7 8.8 5.8L20.8 7"/>',
  telephone:
    '<path d="M6.5 3h3l1.5 4-2 1.4a12 12 0 0 0 6.6 6.6l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3z"/>',
  'telechargement': '<path d="M12 3v12"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4 20h16"/>',
  fichier:
    '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  documents:
    '<path d="M8 3h5l4 4v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M13 3v4h4"/><path d="M19.5 8.5V19a2 2 0 0 1-2 2H9"/>',
  cible: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.1"/>',
  medaille: '<path d="M8.5 3 12 9l3.5-6"/><circle cx="12" cy="15" r="5.5"/><path d="M12 12.6v4.8"/>',
  trophee:
    '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.2H5.5A2.5 2.5 0 0 0 8 9.6"/><path d="M16 5.2h2.5A2.5 2.5 0 0 1 16 9.6"/><path d="M12 13v3.6"/><path d="M9 20h6l-.6-3.4H9.6z"/>',
  coeur: '<path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7C19 15.6 12 20 12 20z"/>',
  etoile: '<path d="m12 3.5 2.6 5.6 6 .8-4.3 4.2 1 6-5.3-3-5.3 3 1-6L3.4 9.9l6-.8z"/>',
  check: '<path d="m5 12.8 4.6 4.6L19 7"/>',
  'check-cercle': '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16 9.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.6M12 7.9v.1"/>',
  alerte: '<path d="M12 4.5 21 20H3z"/><path d="M12 10v4.5M12 17.4v.1"/>',
  onde: '<path d="M2.5 9c2.4-2.8 4.8-2.8 7.2 0s4.8 2.8 7.2 0 4.8-2.8 4.8 0"/><path d="M2.5 15c2.4-2.8 4.8-2.8 7.2 0s4.8 2.8 7.2 0 4.8-2.8 4.8 0"/>',
  vague: '<path d="M2 13c2.4-3 4.8-3 7.2 0s4.8 3 7.2 0 4.8-3 4.8 0"/><path d="M2 18c2.4-3 4.8-3 7.2 0s4.8 3 7.2 0 4.8-3 4.8 0"/>',
  ancre: '<path d="M12 21.5V9.5"/><circle cx="12" cy="6" r="3"/><path d="M5 12H2.5a9.5 9.5 0 0 0 19 0H19"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3.4 9.6h17.2M3.4 14.4h17.2"/><path d="M12 3c2.7 3.1 2.7 14.9 0 18M12 3c-2.7 3.1-2.7 14.9 0 18"/>',
  bouclier: '<path d="M12 3l7.5 2.6v5.7c0 4.6-3.2 8-7.5 9.7-4.3-1.7-7.5-5.1-7.5-9.7V5.6z"/><path d="m8.8 12 2.3 2.3 4.1-4.6"/>',
  feuille:
    '<path d="M4.5 19.5C3 13 7.5 5.5 20 4c1.4 8.6-2.4 15.5-11.4 15.5H4.5z"/><path d="M6.5 18c3-4 7-7 10.5-9"/>',
  diplome:
    '<path d="M3 9.5 12 5l9 4.5-9 4.5z"/><path d="M7 11.6V17c0 1.2 2.2 2.4 5 2.4s5-1.2 5-2.4v-5.4"/>',
  pousse:
    '<path d="M12 21V11"/><path d="M12 11c0-3.6 2.4-6 6-6 0 3.6-2.4 6-6 6z"/><path d="M12 15c0-2.8-1.9-4.6-4.7-4.6 0 2.8 1.9 4.6 4.7 4.6z"/>',
  ampoule:
    '<path d="M9.5 18.5h5"/><path d="M10.5 21h3"/><path d="M12 3.5a6 6 0 0 1 3.6 10.8c-.4.3-.6.8-.6 1.3v.9h-6v-.9c0-.5-.2-1-.6-1.3A6 6 0 0 1 12 3.5z"/>',
  lien: '<path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/>',
  'lien-externe':
    '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5"/>',
  partage:
    '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.3 10.8 7.4-3.6M8.3 13.2l7.4 3.6"/>',
  copier:
    '<rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M15 5.6A2.6 2.6 0 0 0 12.4 3H6a2.6 2.6 0 0 0-2.6 2.6V12A2.6 2.6 0 0 0 6 14.6"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="m10 8.6 5.4 3.4L10 15.4z"/>',
  camera:
    '<path d="M3 8.6A1.6 1.6 0 0 1 4.6 7h2.2l1.4-2.3h7.6L17.2 7h2.2A1.6 1.6 0 0 1 21 8.6v7.8A1.6 1.6 0 0 1 19.4 18H4.6A1.6 1.6 0 0 1 3 16.4z"/><circle cx="12" cy="12.4" r="3.3"/>',
  image: '<rect x="3" y="4.5" width="18" height="15" rx="3"/><circle cx="8.5" cy="10" r="1.6"/><path d="m4 18 5-4.6 4 3.4 3-2.6 4 3.8"/>',
  kayak:
    '<path d="M2.6 16c4 2.6 14.8 2.6 18.8 0-3.4 1.4-15.4 1.4-18.8 0z"/><circle cx="12" cy="7.6" r="2.3"/><path d="M9.7 10.2h4.6L14 15h-4z"/><path d="M5 12.6 19 10"/><ellipse cx="4.4" cy="13.1" rx="2" ry="1.2"/><ellipse cx="19.6" cy="9.6" rx="2" ry="1.2"/>',
  riviere:
    '<path d="m3 19 5.4-9 3.3 5.2L15 9.4 21 19z"/><path d="M3 21.4c2-1.6 4 0 6 0s4-1.6 6 0 4 0 6 0"/>',
  slalom:
    '<path d="M6.5 21V4.5M17.5 21V4.5"/><path d="M6.5 8h11" stroke-dasharray="2.6 2.2"/><path d="M3 18.6c1.7-1.4 3.4 0 5.1 0s3.4 1.4 5.1 0 3.4-1.4 5.1 0"/>',
  ballon:
    '<circle cx="12" cy="12" r="8.5"/><path d="M6.4 6.6c3 2 8.2 2 11.2 0M6.4 17.4c3-2 8.2-2 11.2 0M12 3.5v17"/>',
  equipage:
    '<ellipse cx="12" cy="6.6" rx="7.5" ry="3"/><path d="M4.5 6.6v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-9"/><path d="M4.5 11.2c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/><path d="m19.5 9 2.5-2.4"/>',
  pirogue:
    '<path d="M3.5 15c4 2.6 13 2.6 17 0-3.2 1.4-13.8 1.4-17 0z"/><path d="M9 12.4V8.2h7.2"/><path d="M12.4 8.2V5.4h4.2"/><path d="M20.4 13.6V6.5"/>',
  sup: '<ellipse cx="11" cy="16.4" rx="8" ry="2.6"/><path d="M11.5 13.4 20 4"/><circle cx="20.6" cy="3.5" r="1.7"/>',
  boussole: '<circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.2 5.6-5.4 2 2.2-5.6z"/>',
  inclusion:
    '<circle cx="12.5" cy="4.4" r="2"/><path d="M12.5 6.6V12h4.6"/><circle cx="11.4" cy="15.4" r="5.2"/><path d="M16.6 12.6V21"/>',
  figure: '<path d="m12 3 1.9 5.3L19 10.2l-5.1 1.9L12 17.4l-1.9-5.3L5 10.2l5.1-1.9z"/><path d="M17.6 15.6l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  pagaie:
    '<path d="M6 18 18 6"/><path d="M17.6 2.6a3.4 3.4 0 0 1 0 6.8 3.4 3.4 0 0 1 0-6.8z"/><path d="M6.4 21.4a3.4 3.4 0 0 1 0-6.8 3.4 3.4 0 0 1 0 6.8z"/>',
  bouee: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 3.6 3.6M18.4 5.6l-3.6 3.6M18.4 18.4l-3.6-3.6M5.6 18.4l3.6-3.6"/>',
  curseur: '<path d="M4 4h4M4 4v4"/><path d="M20 20h-4M20 20v-4"/>',
  grille: '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
  liste: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4.4" cy="6" r="1"/><circle cx="4.4" cy="12" r="1"/><circle cx="4.4" cy="18" r="1"/>',
  carte: '<path d="m9 4.5 6 2 5.5-2v13l-5.5 2-6-2-5.5 2v-13z"/><path d="M9 4.5v13M15 6.5v13"/>',
  batiment:
    '<path d="M5 20V6.5A1.5 1.5 0 0 1 6.5 5h7A1.5 1.5 0 0 1 15 6.5V20"/><path d="M15 10h3.5A1.5 1.5 0 0 1 20 11.5V20"/><path d="M3.5 20h17"/><path d="M8 9h4M8 13h4M8 17h4"/>',
  balance:
    '<path d="M12 4v16"/><path d="M6 8h12"/><path d="M6 8 3 14h6z"/><path d="M18 8l-3 6h6z"/><path d="M9 20h6"/>',
  main: '<path d="M8.5 12.5 6 10a2.2 2.2 0 0 1 3.1-3.1l2 2V4.6a1.8 1.8 0 0 1 3.6 0v4.3l1.4-1.4a1.8 1.8 0 0 1 2.6 2.6l-4.8 4.8a4.5 4.5 0 0 1-6.4-6.4"/>',
  goutte: '<path d="M12 3.5c3.4 4.2 5.5 6.8 5.5 9.8a5.5 5.5 0 0 1-11 0c0-3 2.1-5.6 5.5-9.8z"/>',
  reseau:
    '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17"/><path d="M6.2 6.2c3.4 3.4 8.2 3.4 11.6 0M6.2 17.8c3.4-3.4 8.2-3.4 11.6 0"/>',
  eclair: '<path d="M13.5 3 6 13.5h5L10.5 21 18 10.5h-5z"/>',
  televerser: '<path d="M12 16V4"/><path d="m7.5 8.5 4.5-4.5 4.5 4.5"/><path d="M4 20h16"/>',
  reglages:
    '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M4.6 7.8l1.9 1.1M17.5 15.1l1.9 1.1M4.6 16.2l1.9-1.1M17.5 8.9l1.9-1.1"/>',
  drapeau: '<path d="M6 21V4"/><path d="M6 5h11l-1.6 3.6L17 12H6z"/>'
};

/** Icônes pleines (fill) - réseaux sociaux notamment. */
const PLEIN = {
  facebook:
    '<path d="M13.4 21v-7.5h2.5l.4-2.9h-2.9V8.8c0-.8.3-1.4 1.5-1.4h1.6V4.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2h-2.5v2.9h2.5V21z"/>',
  instagram:
    '<path d="M12 2.6c-2.6 0-2.9 0-3.9.1-1 0-1.7.2-2.3.4a4.6 4.6 0 0 0-1.7 1.1A4.6 4.6 0 0 0 3 5.9c-.2.6-.4 1.3-.4 2.3C2.6 9.2 2.6 9.5 2.6 12s0 2.8.1 3.8c0 1 .2 1.7.4 2.3.3.6.6 1.2 1.1 1.7.5.5 1 .8 1.7 1.1.6.2 1.3.4 2.3.4 1 .1 1.3.1 3.8.1s2.9 0 3.9-.1c1 0 1.7-.2 2.3-.4a4.6 4.6 0 0 0 1.7-1.1 4.6 4.6 0 0 0 1.1-1.7c.2-.6.4-1.3.4-2.3.1-1 .1-1.3.1-3.8s0-2.8-.1-3.8c0-1-.2-1.7-.4-2.3a4.6 4.6 0 0 0-1.1-1.7 4.6 4.6 0 0 0-1.7-1.1c-.6-.2-1.3-.4-2.3-.4-1-.1-1.3-.1-3.8-.1zm0 1.8c2.5 0 2.8 0 3.8.1.9 0 1.4.2 1.7.3.4.2.7.4 1 .7.3.3.5.6.7 1 .1.3.3.8.3 1.7.1 1 .1 1.3.1 3.8s0 2.8-.1 3.8c0 .9-.2 1.4-.3 1.7-.2.4-.4.7-.7 1-.3.3-.6.5-1 .7-.3.1-.8.3-1.7.3-1 .1-1.3.1-3.8.1s-2.8 0-3.8-.1c-.9 0-1.4-.2-1.7-.3a2.8 2.8 0 0 1-1-.7 2.8 2.8 0 0 1-.7-1c-.1-.3-.3-.8-.3-1.7-.1-1-.1-1.3-.1-3.8s0-2.8.1-3.8c0-.9.2-1.4.3-1.7.2-.4.4-.7.7-1 .3-.3.6-.5 1-.7.3-.1.8-.3 1.7-.3 1-.1 1.3-.1 3.8-.1zm0 3.1a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm0 9.1a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2zm7-9.3a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0z"/>',
  youtube:
    '<path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.1 5 12 5 12 5s-6.1 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 9 2 12 2 12s0 3 .4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.9 19 12 19 12 19s6.1 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8C22 15 22 12 22 12s0-3-.4-4.8zM10 15V9l5.2 3z"/>',
  tiktok:
    '<path d="M14.6 3h2.7c.1 1.2.6 2.3 1.4 3.2.8.8 1.9 1.3 3 1.4v2.7a7.4 7.4 0 0 1-4.4-1.5v6.4a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v2.8a3 3 0 1 0 2.2 2.9z"/>',
  whatsapp:
    '<path d="M12 2.4A9.5 9.5 0 0 0 3.8 16.7L2.4 21.6l4.9-1.4A9.5 9.5 0 1 0 12 2.4zm0 1.8a7.7 7.7 0 0 1 0 15.4 7.6 7.6 0 0 1-3.9-1.1l-.4-.2-2.4.6.7-2.4-.2-.4a7.7 7.7 0 0 1 6.2-11.9zm-2.4 3.9c-.2 0-.5.1-.7.3-.3.3-.8.9-.8 1.9s.7 2.1.8 2.2c.1.2 1.4 2.2 3.4 3 .5.2.9.3 1.2.4.6.1 1.1.1 1.5 0 .5-.1 1.3-.6 1.5-1.1.2-.5.2-1 .1-1.1 0-.1-.2-.2-.4-.3l-1.4-.7c-.2-.1-.4-.1-.5.1l-.6.8c-.1.2-.3.2-.5.1-.2-.1-.9-.4-1.7-1.1-.6-.5-1-1.2-1.1-1.4-.1-.2 0-.3.1-.4l.5-.6c.1-.2.1-.3 0-.5l-.6-1.5c-.1-.3-.3-.3-.5-.3z"/>',
  linkedin:
    '<path d="M5 4.4a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2zM3.4 10h3.2v10.6H3.4zM9.4 10h3v1.5c.6-1 1.7-1.8 3.4-1.8 2.5 0 4 1.6 4 4.7v6.2h-3.2v-5.7c0-1.5-.6-2.4-1.9-2.4-1.2 0-2.1.8-2.1 2.4v5.7H9.4z"/>',
  whatsapp2: '',
  x: '<path d="M17.6 3h3.2l-7 8 7.4 10h-5.8l-4.5-6.1L5.6 21H2.4l7.4-8.4L2.7 3H8.6l4.2 5.7zM16.4 19.2h1.7L7.4 4.7H5.6z"/>'
};

const GABARIT_TRAIT = (chemins, classes) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="${classes}" aria-hidden="true" focusable="false">${chemins}</svg>`;

const GABARIT_PLEIN = (chemins, classes) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="${classes}" aria-hidden="true" focusable="false">${chemins}</svg>`;

/** Renvoie le code SVG d'une icône. */
export function icone(nom, classes = 'w-5 h-5') {
  if (PLEIN[nom]) return GABARIT_PLEIN(PLEIN[nom], classes);
  return GABARIT_TRAIT(TRAIT[nom] || TRAIT['onde'], classes);
}

export const iconesSociales = ['facebook', 'instagram', 'youtube', 'tiktok', 'whatsapp'];

export const nomsIcones = Object.keys(TRAIT);
