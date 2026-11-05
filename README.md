# Site institutionnel - Fédération Togolaise de Canoë (FETOC)

Site vitrine multi-pages de la **Fédération Togolaise de Canoë (FETOC)** : une
association nationale de canoë-kayak et de sports de pagaie du Togo.

Le site est **statique** (HTML + CSS + JavaScript, sans framework ni étape de
build). Tous les contenus affichés proviennent de fichiers **JSON** dans
`data/` : ils jouent le rôle du futur back-office. Pour faire vivre le site, il
suffit de modifier ces fichiers, aucune ligne de code n'a besoin d'être touchée.

---

## 1. Démarrage rapide

Le site charge ses données via `fetch()`. Les navigateurs **bloquent**
`fetch()` lorsqu'une page est ouverte depuis `file://` : il faut donc un petit
serveur HTTP local.

```bash
# Depuis la racine du projet
python3 -m http.server 8000
# ou
npm start            # même commande (python3, port 8000)
# ou, sans Python
npm run serve        # npx serve, port 8000
```

Puis ouvrez <http://localhost:8000/>.

### Vérification du projet

```bash
npm run verifier
```

Le script `outils/verification.mjs` contrôle :

1. la validité des fichiers JSON de `data/` (site, taxonomies, pages et
   collections) ;
2. la présence des ressources locales, des liens des pages HTML et la
   cohérence de l'URL publique (`seo.url_site`) dans les pages et le sitemap ;
3. la cohérence des identifiants (clubs, disciplines, événements, articles,
   partenaires) et des références de collection des pages ;
4. la présence des fichiers référencés dans les données et les scripts
   (visuels `assets/`, styles, scripts) ;
5. le rendu des composants à partir des données réelles ;
6. la structure globale du projet.

La sortie attendue se termine par **`0 erreur(s), 0 avertissement(s)`**.

Un fichier référencé absent est signalé par le contrôle : les visuels, styles
et scripts manquants sont des **erreurs** (le rendu casse).

---

## 2. Arborescence

```
federation-canoe/
├── index.html                 Accueil (9 blocs)
├── federation.html            La Fédération
├── disciplines.html           Disciplines & activités
├── clubs.html                 Clubs affiliés (annuaire)
├── club.html                  Fiche d'un club   (?id=<club>)
├── competitions.html          Compétitions & calendrier
├── actualites.html            Actualités (+ galerie)
├── article.html               Article            (?slug=<article>)
├── contact.html               Contact & adhésion
├── mentions-legales.html      Mentions légales
├── confidentialite.html       Politique de confidentialité
├── accessibilite.html         Déclaration d'accessibilité
├── css/
│   └── styles.css             Design system (composants, animations)
├── js/
│   ├── tailwind.config.js     Jetons de design (couleurs, polices, ombres)
│   ├── core/                  Modules partagés
│   │   ├── app.js             Amorçage, SEO, notifications
│   │   ├── data.js            Accès aux données + filtres
│   │   ├── layout.js          En-tête, pied de page, menu mobile
│   │   ├── ui.js              Formulaires, visionneuse, révélation, etc.
│   │   ├── cartes.js          Fonctions de rendu réutilisables
│   │   ├── icons.js           Bibliothèque d'icônes SVG
│   │   └── utils.js           Utilitaires (dates, échappement, URL…)
│   └── pages/                 Un module par page
│       ├── accueil.js         federation.js    disciplines.js
│       ├── clubs.js           club.js          competitions.js
│       ├── actualites.js      article.js       contact.js
│       └── legal.js           (partagé par les 3 pages légales)
├── data/                      ★ Contenus (futur back-office)
│   ├── site.json              Identité, contacts, réseaux, navigation, pied
│   ├── taxonomies.json        Listes de référence (familles, régions, types…)
│   ├── pages/                 Textes propres à chaque page
│   │   ├── accueil.json       federation.json    disciplines.json
│   │   ├── clubs.json         competitions.json  actualites.json
│   │   └── contact.json
│   └── collections/           Objets réutilisables (tableaux)
│       ├── disciplines.json   clubs.json         evenements.json
│       └── articles.json      galerie.json       partenaires.json
├── assets/img/                Visuels locaux (logo.png, og-image.png, galerie/, discipline/, partenaires/)
├── outils/verification.mjs    Contrôle qualité
├── package.json
└── README.md
```

---

## 3. Architecture front-end

### 3.1 Chargement des pages

Chaque page HTML contient uniquement sa structure et ses zones vides. Le
comportement est le suivant :

- l'en-tête et le pied de page sont injectés par `js/core/layout.js` dans les
  conteneurs `#site-header` et `#site-footer` ;
- la balise `<body>` porte `data-page="<nom>"` (utilisé pour le lien actif du
  menu) et, sur les pages qui s'ouvrent sur un héros sombre,
  `data-entete="transparent"` ;
- `js/core/app.js` charge les données, injecte le layout, applique le SEO puis
  appelle la fonction de rendu du module de page correspondant.

### 3.2 Données

`js/core/data.js` est la **seule** couche qui connaît les fichiers JSON. Les
pages n'accèdent jamais directement à `data/… .json` ; elles passent par des
petits accesseurs (`page('accueil')`, `clubs()`, `agenda()`,
`articleParSlug(slug)`, …). Les composants d'affichage sont dans
`js/core/cartes.js`.

Trois familles de fichiers coexistent :

- `site.json` : configuration globale (identité, contacts, réseaux, menu, pied
  de page, vidéos, SEO) ;
- `taxonomies.json` : listes de référence partagées (familles de disciplines,
  régions, types d'événements, saisons, catégories…) ;
- `pages/*.json` : textes d'une page ; `collections/*.json` : objets affichés
  dans les listes (clubs, articles, événements…).

Une page référence une collection avec la clé `"collection": "<nom>"` ; le
texte de la section reste dans le fichier de page.

Pour ajouter un contenu, en général :

1. ajouter l'entrée dans le JSON correspondant ;
2. si un nouveau champ est nécessaire, l'exposer via un accesseur de `data.js` ;
3. réutiliser un composant de `cartes.js` (ou en ajouter un) dans le module de
   page.

Aucune donnée n'est codée en dur dans le HTML.

### 3.3 Tailwind CSS

Le site utilise **Tailwind Play CDN** (`cdn.tailwindcss.com`) configuré par
`js/tailwind.config.js` (chargé en script classique avant le CDN). Les jetons de
design y sont déclarés :

| Jeton | Rôle |
| --- | --- |
| `vert-*` | Couleur principale (vert `#0E7048` → `#0B5A3A`), titres, liens, boutons |
| `soleil-*` | Accent (jaune `#FFC72C`), **utilisé avec parcimonie** |
| `sable-*` | Fonds neutres chauds, bordures |
| `encre*` | Textes (`encre`, `encre-doux`, `encre-clair`) |
| `font-display` / `font-sans` | Archivo / Inter |
| `max-w-ecran` | Largeur maximale du conteneur de page |
| `max-w-lecture` | Largeur de lecture confortable (textes longs) |
| `shadow-doux` | Ombre douce réutilisée sur les cartes |

Les composants récurrents (boutons `.btn`, pastilles `.pastille`, accordéons,
galerie, prose `.prose-fetoc`, héros, etc.) sont définis dans `css/styles.css`.

### 3.4 Vidéos de fond des héros

Chaque héros (bannière d'accueil et bandeaux des pages intérieures) affiche une
**vidéo de fond**. Les liens sont centralisés dans `data/site.json` →
`videos`, une entrée par identifiant de page (`data-page` du `<body>`) :

```json
"videos": {
  "accueil": "https://…/video.mp4",
  "federation": "https://…/video.mp4"
}
```

- La clé correspond à `data-page` (`accueil`, `federation`, `disciplines`,
  `clubs`, `competitions`, `actualites`, `contact`).
- La vidéo est lue en boucle, en sourdine, sans contrôles (`muted`, `loop`,
  `playsinline`).
- Sans lien (ou si la page n'a pas d'entrée), le héros s'affiche sur le fond
  vert foncé, sans média.
- Les préférences système `prefers-reduced-motion: reduce` désactivent la vidéo.

Les vidéos par défaut sont des séquences d'illustration libres (Pexels), que la
fédération peut remplacer par ses propres films à tout moment.

### 3.5 Image d'illustration « La fédération en bref »

L'illustration de droite de la section d'accueil *La fédération en bref* est une
**photo externe** (Pexels), référencée directement dans `index.html`. Comme pour
les vidéos, la fédération peut la remplacer par une de ses propres photographies :

```html
<img src="https://images.pexels.com/photos/…/pexels-photo-….jpeg?…"
     width="1600" height="1200" loading="lazy" decoding="async" …>
```

- Elle est chargée en différé (`loading="lazy" decoding="async"`) et affichée en
  `object-cover` dans un cadre 4/3 (`width`/`height`).
- **Adaptez le recadrage à l'orientation de la photo** : un `fit=crop` demandé à
  l'hébergeur (Pexels/Imgix) cale le recadrage avant l'envoi, ce qui évite au
  navigateur de rogner une image portrait dans un cadre paysage (ici la photo
  `34429317` est en portrait 3/4 : le recadrage 4/3 en conserve ~63 %).
- Le contrôle `npm run verifier` **ne vérifie pas** les liens externes
  (`http(s)`) : si le visuel est remplacé par un fichier local, placer celui-ci
  dans `assets/img/` pour qu'il soit contrôlé.
- Pensez à mettre à jour l'attribut `alt` et la légende (`figcaption`) en même
  temps que la photo.

### 3.6 Règle d'affichage des partenaires

La collection `partenaires` ne contient que les partenariats confirmés ; un
partenaire peut être masqué ponctuellement avec `"participation_confirmee":
false` (voir `partenairesAffiches()` dans `js/core/data.js`). Sa carte affiche
une vignette, la catégorie et le `role` ; si `url` est renseignée, la carte
devient cliquable. La vignette suit cet ordre de priorité :

1. `logo` si `logo_autorise` vaut `true` (logo officiel) ;
2. `favicon` (icône du site partenaire, fichier local dans
   `assets/img/partenaires/`) ;
3. à défaut, le `sigle` (ou les trois premières lettres du `nom`).

La page `contact.html` affiche en plus les textes du bloc `partenaires` de
`pages/contact.json`.

### 3.7 Utiliser ses propres photos

Tous les visuels des listes sont pilotés par un champ `image` dans les fichiers
JSON. Une valeur peut être une URL (`https://…`) ou un chemin local
(`assets/img/…`). Pour remplacer une photo par la vôtre :

1. déposer le fichier dans le dossier correspondant, par exemple
   `assets/img/discipline/`, `assets/img/clubs/`, `assets/img/actualites/`… ;
2. renseigner le champ `image` de l'élément concerné ;
3. pour une discipline, mettre aussi à jour `galerie[]` (les visuels de la
   fiche détaillée) ;
4. lancer `npm run verifier` : un chemin local absent est signalé.

| Contenu | Fichier | Champ |
| --- | --- | --- |
| Disciplines | `data/collections/disciplines.json` | `image`, `galerie[]` |
| Clubs | `data/collections/clubs.json` | `image` |
| Événements | `data/collections/evenements.json` | `image` |
| Actualités | `data/collections/articles.json` | `image` |
| Galerie | `data/collections/galerie.json` | `image` |
| Accueil (« en bref ») | `data/pages/accueil.json` | `bref.image` |
| Fédération (illustration) | `data/pages/federation.json` | `presentation.illustration.image` |
| Partenaires | `data/collections/partenaires.json` | `favicon` ou `logo` |

Conseils : privilégier des photos **paysage** (les cartes recadrent en 16/10),
1280 à 1600 px de large, au format JPEG ou WebP et sous ~300 Ko. Le seul visuel
encore codé en dur est l'arrière-plan de l'appel final dans `index.html` : son
`src` peut être remplacé par un fichier local.

---

## 4. Cartographie page ↔ données

| Page | Fichier(s) de données | Zones principales |
| --- | --- | --- |
| Accueil | `pages/accueil.json`, `site`, collections `disciplines`, `articles`, `evenements`, `clubs`, `galerie`, `partenaires` | 9 blocs : bannière, fédération en bref, disciplines, actualités (3), prochains événements, clubs, images, partenaires, appel final |
| La Fédération | `pages/federation.json` | `entete`, `presentation`, `histoire`, `missions`, `appel` |
| Disciplines | `pages/disciplines.json`, collections `disciplines` | `entete`, `presentation`, `formations`, `sites_de_pratique`, `appel` |
| Clubs | `pages/clubs.json`, collections `clubs` | `entete`, `annuaire`, `reperes`, `devenir_club` |
| Fiche club | `collections/clubs.json` | lecture de `?id=<club.id>` |
| Compétitions | `pages/competitions.json`, collections `evenements` | `entete`, `calendrier`, `informations_pratiques`, `reglement` |
| Actualités | `pages/actualites.json`, collections `articles`, `galerie` | `entete`, `introduction`, `galerie`, `suivre_actualite` |
| Article | `collections/articles.json`, `collections/galerie.json` | lecture de `?slug=<article.slug>` |
| Contact | `pages/contact.json`, `site.contact`, collections `partenaires` | `coordonnees`, `orientation`, `partenaires` |
| Pages légales | `site` | date de mise à jour |

### Chiffres clés (Accueil)

`pages/accueil.json` → `bref.chiffres_cles` présente les indicateurs affichés
sous « La fédération en bref » (`id`, `libelle`, `valeur`, `note`). L'accueil
affiche également les repères du héros (`reperes_heros`).

### Valeurs de statut d'un événement

`taxonomies.json` → `statuts_evenements` définit les libellés des statuts
utilisés dans `evenements[].statut` : `a_venir`, `en_cours`, `termine`,
`reporte`, `annule`.

---

## 5. Guide : mettre à jour les contenus (`data/`)

Tous les contenus affichés proviennent de `data/`. Les textes d'une page sont
dans `pages/<page>.json` ; les objets des listes sont dans
`collections/<collection>.json` ; les listes de référence partagées sont dans
`taxonomies.json`. On modifie le JSON et la page se met à jour, sans toucher au
code.

### 5.1 Écrire un JSON valide

- guillemets **doubles**, une virgule **entre** les éléments et **jamais après
  le dernier** ;
- accents acceptés (fichiers en UTF-8) ;
- **omettre les champs vides** plutôt que d'écrire `null` ou `[]` ;
- un filtre « Toutes / Tous » n'est jamais stocké : le code l'ajoute devant la
  liste de référence ;
- **ne pas modifier un `"id"` ni un `"slug"`** : ils servent aux liens internes
  (`club.html?id=…`, `article.html?slug=…`) ;
- le champ `"source"` est une métadonnée interne, jamais affichée ;
- `"a_la_une": true` met l'élément en avant sur la page d'accueil ;
- images : URL `https://…` **ou** fichier local (`assets/img/…`) ;
- après toute modification : `npm run verifier`, puis **Ctrl+Maj+R** au
  navigateur.

### 5.2 `site.json` - identité, contacts, menu, pied de page

| Bloc | Rôle | Champs |
| --- | --- | --- |
| `identite` | Nom, sigle, slogan, siège | `nom`, `sigle`, `slogan`, `pays`, `langue`, `creation`, `siege`, `couleurs` |
| `contact` | Coordonnées (page Contact, pied de page, article) | `email`, `telephones[]`, `federation_internationale`, `note` |
| `reseaux` | Réseaux sociaux officiels | `id`, `nom`, `url`, `pseudo` |
| `navigation` | Menu principal (ordre affiché) | `id`, `libelle`, `url` |
| `appel_action` | Bouton d'en-tête | `libelle`, `url` |
| `pied` | Pied de page | `description`, `liens_utiles[]`, `mentions[]`, `credit` |
| `videos` | Vidéo de fond, une entrée par page | clé = `data-page` de la `<body>` |
| `seo` | URL publique et description par défaut | `url_site`, `title_suffixe`, `description`, `mots_cles` |

Coordonnées : un numéro normal utilise `url` en `tel:` ; un numéro WhatsApp
utilise `url` en `https://wa.me/…` **et** `"whatsapp": true`.

```json
"email":      { "libelle": "fetoc228@gmail.com", "url": "mailto:fetoc228@gmail.com" },
"telephones": [
  { "libelle": "(+228) 73 26 90 56", "url": "tel:+22873269056" },
  { "libelle": "+33 7 58 65 77 81", "url": "https://wa.me/33758657781", "whatsapp": true }
]
```

### 5.3 `pages/federation.json` - page « La Fédération »

| Bloc | Affiche | Champs |
| --- | --- | --- |
| `entete` | Bandeau | `etiquette`, `titre`, `fil_ariane` |
| `presentation` | Intro + image | `etiquette`, `titre`, `chapeau`, `paragraphes[]`, `illustration` (`image`, `legende`) |
| `histoire` | Frise historique | `etiquette`, `titre`, `chapeau`, `paragraphes[]`, `chronologie[]` (`annee`, `titre`, `texte`) |
| `missions` | Missions | `etiquette`, `titre`, `chapeau`, `liste[]` (`titre`, `texte`, `icone`) |
| `appel` | Appel de clôture | `etiquette`, `titre`, `chapeau`, `cta` |

> Les blocs `identite_officielle`, `comite_executif` et `affiliations` existent
> encore mais ne sont plus affichés : conservés en réserve.

### 5.4 `pages/disciplines.json` et `collections/disciplines.json`

Textes de page :

- `entete`, `presentation`, `appel` : titres, chapeaux et paragraphes ;
- `formations` : `etiquette`, `titre`, `chapeau`, `paragraphes[]`, `liste[]`
  (`nom`, `date`, `lieu`, `cadre`, `source`), `note` ;
- `sites_de_pratique` : `etiquette`, `titre`, `chapeau`, `paragraphes[]`,
  `liste[]` (`nom`, `region`, `usage`).

Collection des activités (`collections/disciplines.json`) : `id`, `nom`,
`nom_court`, `famille` (id de `taxonomies.familles_disciplines`), `icone`,
`a_la_une`, `description`, `image` (visuel de la carte), `galerie[]` (visuels
de la fiche), `source`.

### 5.5 `pages/clubs.json` et `collections/clubs.json`

Textes de page :

- `entete`, `annuaire`, `reperes` (`liste[]` : `valeur`, `libelle`, `texte`,
  `icone`), `devenir_club` (`etiquette`, `titre`, `chapeau`, `note`, `cta`).

Collection des clubs : `id`, `nom`, `region` (id de
`taxonomies.regions`), `ville`, `site_pratique`, `presentation`, `image`,
`a_la_une`, `source`.

Pour **ajouter un club**, copier un bloc de la collection et changer au minimum
`id`, `nom`, `presentation` et `image`.

### 5.6 `pages/competitions.json` et `collections/evenements.json`

Textes de page :

- `entete` ;
- `calendrier` : `etiquette`, `titre`, `paragraphes[]`, `collection` ;
- `informations_pratiques` : `etiquette`, `titre`, `paragraphes[]`, `question`,
  `cta` ;
- `reglement` : `titre`, `paragraphes[]`.

Collection des événements : `id`, `titre`, `type` (id de
`taxonomies.types_evenements`), `discipline_id` (id d'une discipline), `saison`
(id de `taxonomies.saisons`), `periode`, `date_debut` (`AAAA-MM-JJ`), `lieu`,
`organisateur`, `statut` (clé de `taxonomies.statuts_evenements`),
`description`, `chiffres[]` (`libelle`, `valeur`), `a_la_une`, `image`,
`source`.

### 5.7 `pages/actualites.json`, `collections/articles.json` et `collections/galerie.json`

Textes de page :

- `entete`, `introduction`, `suivre_actualite` (réseaux sociaux) ;
- `galerie` : `etiquette`, `titre`, `chapeau`, `note`, `collection`.

Collection des articles : `id`, `slug`, `titre`, `categorie` (id de
`taxonomies.categories_actualites`), `date`, `periode`, `auteur`, `lieu`,
`temps_lecture`, `a_la_une`, `chapeau`, `image`, `tags[]`, `source`,
`articles_lies[]` (slugs), `contenu[]`. Le corps de l'article est une suite de
blocs :

| `type` | Champs |
| --- | --- |
| `p` (défaut) | `texte` |
| `h2`, `h3` | `texte` |
| `ul` | `items[]` |
| `quote` | `texte`, `auteur` (facultatif) |

Collection de la galerie : `id`, `image`, `source`.

Pour **ajouter une photo** : déposer le fichier dans `assets/img/gallery/`, puis
ajouter une entrée avec un `id` unique.

### 5.8 `collections/partenaires.json`

Chaque partenaire : `id`, `nom`, `sigle`, `categorie` (id de
`taxonomies.categories_partenaires`), `role`, `url`, `niveau`, `favicon`
(chemin local vers l'icône du site partenaire), `logo` (logo officiel,
facultatif) et `logo_autorise`. La collection ne contient que les partenariats
confirmés ; un partenaire peut être masqué ponctuellement avec
`"participation_confirmee": false`.

---

## 6. Pages, ancres et liens

Les liens internes vers des ancres attendues par les autres pages :

- `competitions.html#<evenement.id>`
- `disciplines.html#<discipline.id>`
- `club.html?id=<club.id>`
- `article.html?slug=<article.slug>`
- `actualites.html#galerie`

Les fiches dynamiques (`club.html`, `article.html`) gèrent un état « non
trouvé » lorsque l'identifiant est absent ou inconnu.

---

## 7. Accessibilité et bonnes pratiques

- Navigation au clavier, lien d'évitement, focus visibles.
- Contrastes adaptés (héros sombres, texte blanc).
- Animations désactivées si `prefers-reduced-motion` est actif.
- Textes alternatifs, `aria-*` et libellés explicites sur les contrôles.
- Formulaires avec validation côté client et confirmation à l'utilisateur.

---

## 8. Déploiement

Le site est purement statique : il peut être servi par n'importe quel
hébergeur de fichiers (Netlify, GitHub Pages, Vercel, un simple Nginx…).

Points d'attention :

1. **définir l'URL publique** (variable unique). Renseignez le domaine réel
   dans `data/site.json` → `seo.url_site` (actuellement l'adresse de
   développement `http://localhost:8125`), puis appliquez-la :

   ```bash
   npm run url
   ```

   `seo.url_site` est la **source unique** de l'adresse du site. Le script
   `outils/url-site.mjs` la reporte sur les 13 pages (balises `canonical`,
   `og:url`, `og:image`, `twitter:image`, soit 52 balises) et sur les 28 URL
   de `sitemap.xml`. Les robots des réseaux sociaux lisant le **HTML brut**
   (sans exécuter le JavaScript), c'est cette valeur écrite en dur qu'ils
   voient : il faut donc relancer `npm run url` après chaque changement.
   Le script est idempotent et ne touche ni les liens externes (polices, CDN,
   vidéos), ni les instructions de développement (`http://localhost:8000`).
   À défaut de valeur, `js/core/app.js` retombe sur l'origine réellement
   servie : le site reste fonctionnel même si la variable est vide ;

2. conserver l'arborescence (les chemins `data/…`, `js/…`, `assets/…` sont
   relatifs à la racine) ;
3. servir en **HTTPS** ;
4. vérifier `npm run verifier` (0 erreur) et contrôler visuellement les pages.
   La vérification signale (avertissement) toute page ou tout sitemap dont
   l'origine ne correspond plus à `seo.url_site` : pensez alors à
   `npm run url`.
