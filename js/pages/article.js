/* ==========================================================================
   FETOC - Page « Article » (page dynamique)
   Lit le paramètre « ?slug=… » et affiche l'article complet : héros,
   contenu structuré (paragraphes, titres, listes, citations), galerie,
   partage et articles liés.
   ========================================================================== */

import { demarrer, ui } from '../core/app.js';
import {
  articleParSlug,
  articlesLies,
  libelleCategorie,
  imagesGalerie,
  contact,
  videoHeroPage
} from '../core/data.js';
import { carteArticle, vignetteGalerie } from '../core/cartes.js';
import { parametreUrl, qs, esc, dateLongue } from '../core/utils.js';
import { icone } from '../core/icons.js';

demarrer().then(rendre);

function remplir(zone, html) {
  const element = qs(`[data-zone="${zone}"]`);
  if (element) element.innerHTML = html;
  return element;
}

function rendre() {
  const slug = parametreUrl('slug');
  const article = articleParSlug(slug);

  if (!article) {
    afficherIntrouvable(slug);
    return;
  }

  const categorie = libelleCategorie(article.categorie);
  document.title = `${article.titre} - Actualités`;
  qs('meta[name="description"]')?.setAttribute(
    'content',
    article.chapeau || `Actualité de la Fédération Togolaise de Canoë : ${article.titre}.`
  );

  insererDonneesStructurees(article);

  /* ------------------------------------------------ héros de l'article */
  remplir('bandeau', gabaritHeros(article, categorie));

  /* ------------------------------------------------ corps de l'article */
  remplir('contenu', gabaritContenu(article, categorie));

  ui.initRevelation();
  ui.initVisionneuse();
  ui.initCopieLiens();
}

/* ------------------------------------------------------------------ héros */
function gabaritHeros(article, categorie) {
  const meta = [
    { icone: 'calendrier', valeur: dateLongue(article.date) },
    { icone: 'utilisateur', valeur: article.auteur },
    article.lieu ? { icone: 'lieu', valeur: article.lieu } : null,
    { icone: 'horloge', valeur: `Lecture ${article.temps_lecture || 3} min` }
  ].filter(Boolean);

  const page = typeof document !== 'undefined' ? document.body?.dataset?.page ?? '' : '';
  const lienVideo = videoHeroPage(page) || videoHeroPage('actualites');
  const sourceImage = article.image || 'assets/img/banner-actualites.svg';
  const media = lienVideo
    ? `<video class="heros-media" autoplay muted loop playsinline preload="metadata"
             poster="${esc(sourceImage)}" aria-hidden="true" tabindex="-1">
         <source src="${esc(lienVideo)}" type="video/mp4">
       </video>`
    : `<img class="heros-media" src="${esc(sourceImage)}" width="1920" height="900"
            alt="${esc(article.titre)}" fetchpriority="high" decoding="async">`;

  return `
  <section class="relative isolate flex min-h-[62vh] items-end overflow-hidden bg-vert-950 text-white lg:min-h-[68vh]">
    ${media}
    <div class="heros-voile absolute inset-0" aria-hidden="true"></div>
    <div class="relative mx-auto w-full max-w-ecran px-4 pb-12 pt-40 sm:px-6 lg:pb-16">
      <nav aria-label="Fil d'Ariane" class="apparition">
        <ol class="flex flex-wrap items-center gap-2 text-xs text-vert-100/80">
          <li class="flex items-center gap-2">
            <a href="index.html" class="transition hover:text-white">Accueil</a>
            ${icone('chevron-droite', 'h-3.5 w-3.5 opacity-60')}
          </li>
          <li class="flex items-center gap-2">
            <a href="actualites.html" class="transition hover:text-white">Actualités</a>
            ${icone('chevron-droite', 'h-3.5 w-3.5 opacity-60')}
          </li>
          <li><span class="text-soleil-300">${esc(categorie)}</span></li>
        </ol>
      </nav>

      <span class="apparition mt-6 inline-flex">
        <span class="pastille pastille--soleil">${icone('onde', 'h-3.5 w-3.5')}${esc(categorie)}</span>
      </span>
      <h1 class="apparition titre-fluide mt-5 max-w-4xl text-white" style="animation-delay:.08s">${esc(
        article.titre
      )}</h1>
      ${
        article.chapeau
          ? `<p class="apparition mt-5 max-w-3xl text-base leading-relaxed text-vert-50/90 sm:text-lg" style="animation-delay:.16s">${esc(
              article.chapeau
            )}</p>`
          : ''
      }
      <ul class="apparition mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-vert-50/80" style="animation-delay:.24s">
        ${meta
          .map(
            (item) =>
              `<li class="inline-flex items-center gap-2">${icone(
                item.icone,
                'h-4 w-4 text-soleil-300'
              )}${esc(item.valeur)}</li>`
          )
          .join('')}
      </ul>
    </div>
    <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-vert-950 to-transparent" aria-hidden="true"></div>
  </section>`;
}

/* ------------------------------------------------------------------ corps */
function gabaritContenu(article, categorie) {
  const url = window.location.href;
  const galerie = (article.galerie || []).map((src) => imageArticle(article, src));

  return `
  <section class="bg-white py-14 lg:py-20">
    <div class="mx-auto max-w-ecran px-4 sm:px-6">
      <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16">
        <article class="min-w-0">
          <a href="actualites.html" class="lien-fleche text-sm font-semibold text-vert-700">
            ${icone('fleche-gauche', 'h-4 w-4')}Toutes les actualités
          </a>

          <div class="prose-fetoc mt-8 max-w-lecture">
            ${(article.contenu || []).map(blocContenu).join('')}
          </div>

          ${
            galerie.length
              ? `<div class="mt-12">
                   <h2 class="font-display text-xl font-bold text-vert-950">En images</h2>
                   <div class="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
                     ${galerie
                       .map((image, index) => vignetteGalerie(image, { delai: (index % 3) * 70 }))
                       .join('')}
                   </div>
                 </div>`
              : ''
          }

          ${
            (article.tags || []).length
              ? `<div class="mt-12 border-t border-sable-200 pt-8">
                   <p class="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-encre-clair">Mots-clés</p>
                   <div class="mt-4 flex flex-wrap gap-2">
                     ${article.tags
                       .map((tag) => `<span class="pastille pastille--gris">${esc(tag)}</span>`)
                       .join('')}
                   </div>
                 </div>`
              : ''
          }

          <div class="mt-10 flex flex-col gap-4 rounded-2xl border border-sable-200 bg-sable-50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-encre-doux">Une question sur cette actualité ? Contactez la fédération.</p>
            <div class="flex flex-none flex-wrap gap-3">
              <a href="contact.html" class="btn btn--vert btn--sm">Nous contacter</a>
              <a href="actualites.html" class="btn btn--contour btn--sm">Plus d'actualités</a>
            </div>
          </div>
        </article>

        <aside class="revele revele--droite">
          <div class="space-y-6 lg:sticky lg:top-28">
            ${carteResume(article, categorie)}
            ${cartePartage(article, url)}
            ${carteLettre()}
          </div>
        </aside>
      </div>
    </div>
  </section>

  ${blocArticlesLies(article)}`;
}

/* ------------------------------------------------------------------ blocs */
function blocContenu(bloc) {
  switch (bloc.type) {
    case 'h2':
      return `<h2>${esc(bloc.texte)}</h2>`;
    case 'h3':
      return `<h3>${esc(bloc.texte)}</h3>`;
    case 'ul':
      return `<ul>${(bloc.items || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
    case 'quote':
      return `<blockquote>${esc(bloc.texte)}${
        bloc.auteur
          ? `<footer class="mt-3 font-sans text-sm font-semibold not-italic text-vert-700">- ${esc(
              bloc.auteur
            )}</footer>`
          : ''
      }</blockquote>`;
    default:
      return `<p>${esc(bloc.texte)}</p>`;
  }
}

function imageArticle(article, src) {
  return (
    imagesGalerie().find((image) => image.src === src) || {
      src,
      titre: article.titre,
      lieu: article.lieu || 'Togo',
      date: article.date
    }
  );
}

/* ------------------------------------------------------------------ encadrés */
function carteResume(article, categorie) {
  const lignes = [
    { icone: 'calendrier', libelle: 'Publié le', valeur: dateLongue(article.date) },
    { icone: 'utilisateur', libelle: 'Auteur', valeur: article.auteur },
    { icone: 'documents', libelle: 'Rubrique', valeur: categorie },
    article.lieu ? { icone: 'lieu', libelle: 'Lieu', valeur: article.lieu } : null,
    { icone: 'horloge', libelle: 'Temps de lecture', valeur: `${article.temps_lecture || 3} min` }
  ].filter(Boolean);

  return `
  <div class="rounded-2xl border border-sable-200 bg-white p-6 shadow-doux">
    <p class="font-display text-sm font-bold uppercase tracking-[0.12em] text-vert-900">En résumé</p>
    <dl class="mt-4 space-y-4">
      ${lignes
        .map(
          (ligne) => `
        <div class="flex items-start gap-3">
          <span class="mt-0.5 flex-none text-vert-600">${icone(ligne.icone, 'h-4 w-4')}</span>
          <div class="min-w-0">
            <dt class="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-encre-clair">${esc(
              ligne.libelle
            )}</dt>
            <dd class="text-sm font-medium text-vert-950">${esc(ligne.valeur)}</dd>
          </div>
        </div>`
        )
        .join('')}
    </dl>
  </div>`;
}

function cartePartage(article, url) {
  const liens = [
    {
      nom: 'Facebook',
      icone: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      nom: 'X',
      icone: 'x',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
        article.titre
      )}`
    },
    {
      nom: 'WhatsApp',
      icone: 'whatsapp',
      href: `https://wa.me/?text=${encodeURIComponent(`${article.titre} ${url}`)}`
    },
    {
      nom: 'LinkedIn',
      icone: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    }
  ];

  return `
  <div class="rounded-2xl border border-sable-200 bg-sable-50 p-6">
    <p class="flex items-center gap-2 font-display text-sm font-bold text-vert-900">${icone(
      'partage',
      'h-4 w-4 text-vert-600'
    )}Partager l'article</p>
    <div class="mt-4 flex flex-wrap gap-2">
      ${liens
        .map(
          (lien) => `
        <a href="${esc(lien.href)}" target="_blank" rel="noopener noreferrer" title="Partager sur ${esc(
          lien.nom
        )}" aria-label="Partager sur ${esc(lien.nom)}"
           class="grid h-10 w-10 place-items-center rounded-full bg-white text-vert-700 shadow-doux transition hover:bg-vert-700 hover:text-white">
          ${icone(lien.icone, 'h-4 w-4')}
        </a>`
        )
        .join('')}
      <button type="button" data-copier="${esc(url)}" title="Copier le lien" aria-label="Copier le lien"
        class="grid h-10 w-10 place-items-center rounded-full bg-white text-vert-700 shadow-doux transition hover:bg-vert-700 hover:text-white">
        ${icone('copier', 'h-4 w-4')}
      </button>
    </div>
  </div>`;
}

function carteLettre() {
  const coord = contact();
  return `
  <div class="rounded-2xl border border-soleil-300 bg-soleil-50 p-6">
    <p class="font-display text-sm font-bold text-vert-900">Une question sur cet article ?</p>
    <p class="mt-2 text-sm leading-relaxed text-encre-doux">
      ${esc(coord.note || '')}
    </p>
    <div class="mt-5 space-y-2.5 text-sm">
      <a href="${esc(coord.instagram?.url)}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2.5 text-encre-doux transition hover:text-vert-700">
        ${icone('instagram', 'h-4 w-4 text-vert-600')}${esc(coord.instagram?.pseudo)}
      </a>
      <a href="contact.html" class="flex items-center gap-2.5 font-semibold text-vert-700 transition hover:text-vert-800">
        ${icone('fleche-droite', 'h-4 w-4')}Page contact
      </a>
    </div>
  </div>`;
}

function blocArticlesLies(article) {
  const lies = articlesLies(article, 3);
  if (!lies.length) return '';

  return `
  <section class="bg-sable-50 py-16 lg:py-20">
    <div class="mx-auto max-w-ecran px-4 sm:px-6">
      <header class="revele flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="etiquette text-vert-600">À lire aussi</p>
          <h2 class="mt-4 font-display text-2xl font-bold text-vert-950">Articles en lien</h2>
        </div>
        <a href="actualites.html" class="btn btn--contour flex-none">Toutes les actualités</a>
      </header>
      <div class="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        ${lies.map((lie) => carteArticle(lie)).join('')}
      </div>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ SEO */
function insererDonneesStructurees(article) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.titre,
    description: article.chapeau,
    datePublished: article.date,
    image: article.image ? new URL(article.image, document.baseURI).href : undefined,
    author: { '@type': 'Organization', name: article.auteur },
    publisher: { '@type': 'Organization', name: 'Fédération Togolaise de Canoë' },
    articleSection: libelleCategorie(article.categorie),
    mainEntityOfPage: window.location.href
  });
  document.head.appendChild(script);
}

/* ------------------------------------------------------------------ introuvable */
function afficherIntrouvable(slug) {
  remplir(
    'bandeau',
    `<section class="relative isolate flex min-h-[58vh] items-end overflow-hidden bg-vert-950 text-white lg:min-h-[62vh]">
      <img class="heros-media" src="assets/img/banner-actualites.svg" width="1920" height="700" alt="" fetchpriority="high" decoding="async">
      <div class="heros-voile absolute inset-0" aria-hidden="true"></div>
      <div class="relative mx-auto w-full max-w-ecran px-4 pb-12 pt-40 sm:px-6 lg:pb-16">
        <p class="apparition etiquette text-soleil-300">Actualités</p>
        <h1 class="apparition titre-fluide mt-4 max-w-3xl text-white" style="animation-delay:.08s">Article introuvable</h1>
        <p class="apparition mt-5 max-w-2xl text-base leading-relaxed text-vert-50/90" style="animation-delay:.16s">
          Cet article n'existe pas ou n'est plus publié.
        </p>
      </div>
      <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-vert-950 to-transparent" aria-hidden="true"></div>
    </section>`
  );
  remplir(
    'contenu',
    `<section class="bg-white py-20 lg:py-28">
      <div class="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <span class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-soleil-100 text-soleil-700">${icone(
          'alerte',
          'h-7 w-7'
        )}</span>
        <h2 class="mt-6 font-display text-2xl font-bold text-vert-950">Cette actualité n'a pas été trouvée</h2>
        <p class="mt-3 text-base leading-relaxed text-encre-doux">
          ${
            slug
              ? `Aucun article ne correspond à la référence « ${esc(slug)} ».`
              : "Aucun article n'a été indiqué dans le lien."
          }
          Parcourez l'ensemble des publications de la fédération.
        </p>
        <a href="actualites.html" class="btn btn--vert mt-8">Voir toutes les actualités</a>
      </div>
    </section>`
  );
  ui.initRevelation();
}
