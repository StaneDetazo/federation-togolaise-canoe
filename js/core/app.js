/* ==========================================================================
   FETOC - Amorçage commun à toutes les pages
   Charge les données, monte l'ossature, applique le SEO et lance les
   comportements d'interface partagés.
   ========================================================================== */

import { chargerDonnees, data, site, seo, reseaux, contact, urlSite } from './data.js';
import { initLayout } from './layout.js';
import * as ui from './ui.js';
import { qs } from './utils.js';

/* ---------------------------------------------------------------- SEO */
function baliseMeta(attribut, nom, contenu) {
  if (!contenu) return;
  let balise = qs(`meta[${attribut}="${nom}"]`);
  if (!balise) {
    balise = document.createElement('meta');
    balise.setAttribute(attribut, nom);
    document.head.appendChild(balise);
  }
  balise.setAttribute('content', contenu);
}

function appliquerSeo() {
  const identite = site();
  const configuration = seo();
  const titrePage = document.title.replace(/\s*[-|-]\s*FETOC.*$/, '').trim();

  document.title = titrePage ? `${titrePage} - ${identite.sigle}` : configuration.titre_suffixe || identite.nom;

  const description =
    qs('meta[name="description"]')?.getAttribute('content') || configuration.description || '';
  baliseMeta('name', 'description', description);
  baliseMeta('name', 'keywords', configuration.mots_cles);
  baliseMeta('name', 'author', identite.nom);
  baliseMeta('name', 'theme-color', identite.couleurs?.principale);

  // Origine absolue du site : variable « seo.url_site » (data/site.json).
  // À défaut, on retombe sur l'adresse réellement servie.
  const base = (urlSite() || window.location.origin).replace(/\/+$/, '');
  const url = base + window.location.pathname + window.location.search;
  const image = new URL(configuration.image_partage || 'assets/img/og-image.png', base + '/').href;

  baliseMeta('property', 'og:type', 'website');
  baliseMeta('property', 'og:site_name', identite.nom);
  baliseMeta('property', 'og:title', document.title);
  baliseMeta('property', 'og:description', description);
  baliseMeta('property', 'og:image', image);
  baliseMeta('property', 'og:url', url);
  baliseMeta('property', 'og:locale', 'fr_TG');
  baliseMeta('name', 'twitter:card', 'summary_large_image');
  baliseMeta('name', 'twitter:title', document.title);
  baliseMeta('name', 'twitter:description', description);
  baliseMeta('name', 'twitter:image', image);

  let canonique = qs('link[rel="canonical"]');
  if (!canonique) {
    canonique = document.createElement('link');
    canonique.rel = 'canonical';
    document.head.appendChild(canonique);
  }
  canonique.href = url;

  // Données structurées : organisation sportive + WebSite
  const coord = contact();
  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: identite.nom,
    alternateName: identite.sigle,
    sport: 'Canoë-kayak',
    foundingDate: identite.creation,
    url: base + '/',
    logo: new URL('assets/img/logo.png', base + '/').href,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Agbodrafo',
      addressRegion: 'Préfecture des Lacs',
      addressCountry: 'TG'
    },
    sameAs: [...reseaux().map((r) => r.url), coord.federation_internationale?.url].filter(Boolean)
  };
  const jsonLdSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: identite.nom,
    url: base + '/',
    alternateName: identite.sigle
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify([jsonLdOrg, jsonLdSite]);
  document.head.appendChild(script);
}

/* ---------------------------------------------------------------- erreur de chargement */
function afficherErreurChargement(erreur) {
  console.error('[FETOC] Chargement des données impossible :', erreur);
  const principal = qs('#main') || document.body;
  principal.insertAdjacentHTML(
    'afterbegin',
    `<div class="mx-auto max-w-ecran px-4 py-16 sm:px-6">
      <div class="mx-auto max-w-xl rounded-2xl border border-sable-200 bg-white p-8 text-center shadow-doux">
        <p class="font-display text-xl font-bold text-vert-950">Le site est momentanément indisponible</p>
        <p class="mt-3 text-sm leading-relaxed text-encre-doux">
          Nous rencontrons un problème technique et ne pouvons pas afficher le contenu pour le moment.
          Merci de réessayer dans quelques instants.
        </p>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" data-action="reessayer" class="btn btn--vert">Réessayer</button>
          <a href="index.html" class="btn btn--contour">Retour à l'accueil</a>
        </div>
      </div>
    </div>`
  );

  qs('[data-action="reessayer"]', principal)?.addEventListener('click', () => window.location.reload());
}

/* ---------------------------------------------------------------- démarrage */
export async function demarrer() {
  try {
    await chargerDonnees();
  } catch (erreur) {
    afficherErreurChargement(erreur);
    throw erreur;
  }

  appliquerSeo();
  initLayout(document.body.dataset.page || '');

  ui.initEntete();
  ui.initMenuMobile();
  ui.initRevelation();
  ui.initAccordeons();
  ui.initCopieLiens();
  ui.initCompteurs();

  document.dispatchEvent(new CustomEvent('fetoc:pret', { detail: data }));
  return data;
}

export { ui };
