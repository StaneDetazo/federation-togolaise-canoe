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

1. la validité JSON des 8 fichiers de `data/` ;
2. la présence des ressources locales, des liens des pages HTML et la
   cohérence de l'URL publique (`seo.url_site`) dans les pages et le sitemap ;
3. la cohérence des identifiants (événements, clubs, classements, articles) ;
4. la présence des fichiers référencés dans les données et les scripts
   (visuels `assets/`, documents `documents/`, styles, scripts) ;
5. le rendu des composants à partir des données réelles ;
6. la structure globale du projet.

La sortie attendue se termine par **`0 erreur(s), 0 avertissement(s)`**.

Un fichier référencé absent est signalé par le contrôle : les visuels, styles
et scripts manquants sont des **erreurs** (le rendu casse).

Pour les documents, la disponibilité est déclarée dans les données : une fiche
marquée `"disponible": false` (voir `federation.json`) est **annoncée mais pas
encore publiée** - elle n'est pas contrôlée et s'affiche avec la pastille
« Bientôt disponible » au lieu d'un lien de téléchargement. Un document marqué
disponible (par défaut) mais dont le fichier est absent de `documents/` reste
signalé par un simple **avertissement**, et la carte bascule elle aussi sur
« Bientôt disponible » (vérification à l'affichage).

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
│   ├── site.json              Identité, navigation, contacts, réseaux
│   ├── federation.json        Histoire, missions, vision, bureau, documents
│   ├── disciplines.json       Disciplines, familles, parcours, formations
│   ├── clubs.json             Clubs affiliés
│   ├── competitions.json      Calendrier, résultats, classements
│   ├── actualites.json        Articles et communiqués
│   ├── partenaires.json       Partenaires et offre de partenariat
│   └── galerie.json           Galerie photographique
├── assets/img/                Visuels (SVG : bannières, illustrations ; PNG : logo.png, og-image.png)
├── documents/                 PDF téléchargeables (statuts, règlements…)
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
petits accesseurs (`clubs()`, `evenementsAvenir()`, `articleParSlug(slug)`, …).
Les composants d'affichage sont dans `js/core/cartes.js`.

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

Chaque héros (bannière d'accueil et bandeaux des pages intérieures) peut
afficher une **vidéo de fond** en plus de son image. Les liens sont centralisés
dans `data/site.json` → `videos_heros`, une entrée par identifiant de page
(`data-page` du `<body>`) :

```json
"videos_heros": {
  "accueil": "https://…/video.mp4",
  "federation": "https://…/video.mp4"
}
```

- La clé correspond à `data-page` (`accueil`, `federation`, `disciplines`,
  `clubs`, `competitions`, `actualites`, `contact`).
- La vidéo est lue en boucle, en sourdine, sans contrôles (`muted`, `loop`,
  `playsinline`) ; l'image de la bannière sert de `poster` de secours.
- Sans lien (ou si la page n'a pas d'entrée), la bannière retombe sur son image.
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

Un partenaire n'est affiché que si **les deux** conditions sont vraies :

```js
participation_confirmee === true && utilisation_logo_autorisee === true && p.logo
```

Voir `partenairesAffiches()` dans `js/core/data.js`. La page `contact.html`
affiche en plus l'offre `devenir_partenaire`.

### 3.7 Blocs récapitulatifs « L'essentiel »

Chaque page intérieure (sauf « La Fédération ») ouvre sur un bandeau
récapitulatif rendu par `blocEssentiel({ points })` (`js/core/cartes.js`) dans la
zone `data-zone="essentiel"`. Les points sont définis dans le module de la page et
résument la rubrique pour une lecture rapide, sans remplacer le contenu détaillé.

---

## 4. Cartographie page ↔ données

| Page | Fichier(s) de données | Zones principales |
| --- | --- | --- |
| Accueil | `site`, `federation.chiffres_cles`, `disciplines`, `actualites`, `competitions`, `clubs`, `galerie`, `partenaires` | 9 blocs : bannière, fédération en bref, disciplines, actualités (3), prochains événements, clubs, images, partenaires, appel final |
| La Fédération | `federation` | `presentation`, `illustration`, `histoire`, `missions` |
| Disciplines | `disciplines` | `entete`, `familles`, `liste`, `parcours`, `formations`, `sites_de_pratique` |
| Clubs | `clubs` | `entete`, `regions`, `liste`, `devenir_club` |
| Fiche club | `clubs` | lecture de `?id=<club.id>` |
| Compétitions | `competitions` | `entete`, `saison_courante`, `saisons`, `types`, `statuts`, `evenements`, `classements`, `informations_pratiques` |
| Actualités | `actualites`, `galerie` | `entete`, `categories`, `liste` |
| Article | `actualites`, `galerie` | lecture de `?slug=<article.slug>` |
| Contact | `site.contact`, `partenaires` | `#formulaire`, `#adhesion`, `#licences`, `#partenariat` |
| Pages légales | `site` | date de mise à jour |

### Chiffres clés (Accueil / Fédération)

`federation.chiffres_cles` présente les indicateurs de la fédération :

- `indicatifs` : valeurs calculées automatiquement à partir des données
  (`source: "calcule"`, ex. nombre de clubs, de régions, de disciplines) ou
  fixes (`source: "fixe"`, ex. base nautique de Togoville).

### Valeurs de statut d'un événement

`competitions.statuts` définit les libellés des statuts utilisés dans
`evenements[].statut` : `a_venir`, `en_cours`, `termine`, `reporte`, `annule`.

---

## 5. Pages, ancres et liens

Les liens internes vers des ancres attendues par les autres pages :

- `competitions.html#resultats`, `competitions.html#<evenement.id>`
- `disciplines.html#<discipline.id>`
- `club.html?id=<club.id>`
- `article.html?slug=<article.slug>`
- `contact.html#adhesion`, `contact.html#licences`, `contact.html#partenariat`
- `actualites.html#galerie`

Les fiches dynamiques (`club.html`, `article.html`) gèrent un état « non
trouvé » lorsque l'identifiant est absent ou inconnu.

---

## 6. Accessibilité et bonnes pratiques

- Navigation au clavier, lien d'évitement, focus visibles.
- Contrastes adaptés (héros sombres, texte blanc).
- Animations désactivées si `prefers-reduced-motion` est actif.
- Textes alternatifs, `aria-*` et libellés explicites sur les contrôles.
- Formulaires avec validation côté client et confirmation à l'utilisateur.

---

## 7. Déploiement

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
