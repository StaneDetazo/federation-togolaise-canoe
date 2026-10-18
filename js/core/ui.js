/* ==========================================================================
   FETOC - Composants d'interface et comportements interactifs
   ========================================================================== */

import { qs, qsa, esc, debounce, copier, reduireMouvement } from './utils.js';
import { icone } from './icons.js';

/* ---------------------------------------------------------------- notification */
let minuteurNotification = null;

export function notifier(message, type = 'succes') {
  const zone = qs('#zone-notification');
  if (!zone) return;
  const couleurs = {
    succes: 'bg-vert-800',
    info: 'bg-vert-950',
    alerte: 'bg-soleil-500 text-encre'
  };
  zone.className = `notification est-visible rounded-full px-5 py-3 text-sm font-medium text-white shadow-haute ${
    couleurs[type] || couleurs.succes
  }`;
  zone.innerHTML = `<span class="flex items-center gap-2">${icone(
    type === 'alerte' ? 'alerte' : 'check-cercle',
    'h-4 w-4'
  )}${esc(message)}</span>`;
  clearTimeout(minuteurNotification);
  minuteurNotification = setTimeout(() => zone.classList.remove('est-visible'), 4200);
}

/* ---------------------------------------------------------------- apparition au défilement */
export function initRevelation(racine = document) {
  const elements = qsa('.revele', racine);
  if (!elements.length) return;

  if (reduireMouvement() || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('est-visible'));
    return;
  }

  const observateur = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((entree) => {
        if (!entree.isIntersecting) return;
        const delai = Number(entree.target.dataset.delai || 0);
        setTimeout(() => entree.target.classList.add('est-visible'), delai);
        observateur.unobserve(entree.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  elements.forEach((element) => observateur.observe(element));
}

/** Réapplique l'animation aux éléments injectés dynamiquement. */
export function revelerNouveaux(racine) {
  initRevelation(racine);
}

/* ---------------------------------------------------------------- en-tête */
export function initEntete() {
  const entete = qs('#entete');
  const barre = qs('#barre-progression');
  const retour = qs('#retour-haut');
  if (!entete) return;

  const transparentAuDepart = document.body.dataset.entete === 'transparent';
  let dernierDefilement = window.scrollY;
  let masquerSurDescente = false;

  const maj = () => {
    const y = window.scrollY;
    const pose = y > 40;

    entete.classList.toggle('entete--transparent', transparentAuDepart && !pose);
    entete.classList.toggle('entete--pose', pose);
    entete.classList.toggle('entete--compacte', y > 120);

    // masquage lors d'une descente franche (pages sans grand héros)
    if (!transparentAuDepart) {
      const delta = y - dernierDefilement;
      if (y > 320 && delta > 6) masquerSurDescente = true;
      else if (delta < -6 || y < 200) masquerSurDescente = false;
      entete.classList.toggle('entete--masque', masquerSurDescente);
    }
    dernierDefilement = y;

    if (barre) {
      const hauteur = document.documentElement.scrollHeight - window.innerHeight;
      barre.style.width = `${hauteur > 0 ? Math.min((y / hauteur) * 100, 100) : 0}%`;
    }
    if (retour) retour.classList.toggle('est-visible', y > 700);
  };

  maj();
  window.addEventListener('scroll', maj, { passive: true });
  window.addEventListener('resize', maj);

  retour?.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: reduireMouvement() ? 'auto' : 'smooth' })
  );
}

/* ---------------------------------------------------------------- menu mobile */
export function initMenuMobile() {
  const panneau = qs('#panneau-mobile');
  const voile = qs('#voile-mobile');
  const ouvrir = qs('#bouton-menu');
  const fermer = qs('#bouton-fermer-menu');
  if (!panneau || !ouvrir) return;

  const basculer = (ouvert) => {
    panneau.classList.toggle('est-ouvert', ouvert);
    panneau.setAttribute('aria-hidden', String(!ouvert));
    ouvrir.setAttribute('aria-expanded', String(ouvert));
    document.body.classList.toggle('nav-ouverte', ouvert);
    if (voile) {
      voile.hidden = !ouvert;
      requestAnimationFrame(() => voile.classList.toggle('est-ouvert', ouvert));
    }
  };

  ouvrir.addEventListener('click', () => basculer(true));
  fermer?.addEventListener('click', () => basculer(false));
  voile?.addEventListener('click', () => basculer(false));
  qsa('a', panneau).forEach((lien) => lien.addEventListener('click', () => basculer(false)));
  document.addEventListener('keydown', (evenement) => {
    if (evenement.key === 'Escape') basculer(false);
  });
}

/* ---------------------------------------------------------------- accordéons */
export function initAccordeons(racine = document) {
  qsa('.accordeon', racine).forEach((bloc) => {
    const resume = qs('summary', bloc);
    const contenu = qs('.accordeon__contenu', bloc);
    if (!resume || !contenu) return;
    resume.setAttribute('aria-expanded', String(bloc.open));
    bloc.addEventListener('toggle', () => resume.setAttribute('aria-expanded', String(bloc.open)));
  });
}

/* ---------------------------------------------------------------- visionneuse d'images */
export function initVisionneuse(selecteur = '.galerie-item') {
  const elements = qsa(selecteur);
  if (!elements.length) return;

  let visionneuse = qs('#visionneuse');
  const controlesPrets = Boolean(visionneuse);
  if (!visionneuse) {
    visionneuse = document.createElement('div');
    visionneuse.id = 'visionneuse';
    visionneuse.className = 'visionneuse';
    visionneuse.setAttribute('role', 'dialog');
    visionneuse.setAttribute('aria-modal', 'true');
    visionneuse.setAttribute('aria-label', "Visionneuse d'images");
    visionneuse.innerHTML = `
      <button type="button" data-fermer class="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25" aria-label="Fermer">${icone(
        'fermer',
        'h-5 w-5'
      )}</button>
      <figure class="flex max-h-full flex-col items-center gap-4">
        <img src="" alt="">
        <figcaption class="text-center text-sm text-vert-100/90"></figcaption>
      </figure>
      <button type="button" data-precedent class="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25" aria-label="Image précédente">${icone(
        'chevron-gauche',
        'h-5 w-5'
      )}</button>
      <button type="button" data-suivant class="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25" aria-label="Image suivante">${icone(
        'chevron-droite',
        'h-5 w-5'
      )}</button>`;
    document.body.appendChild(visionneuse);
  }

  const image = qs('img', visionneuse);
  const legende = qs('figcaption', visionneuse);
  let index = 0;

  const afficher = (i) => {
    index = (i + elements.length) % elements.length;
    const source = elements[index];
    const img = qs('img', source);
    image.src = img?.dataset.full || img?.src || '';
    image.alt = img?.alt || '';
    legende.textContent = source.dataset.legende || img?.alt || '';
  };

  const ouvrir = (i) => {
    afficher(i);
    visionneuse.classList.add('est-ouvert');
    document.body.style.overflow = 'hidden';
  };
  const fermerVue = () => {
    visionneuse.classList.remove('est-ouvert');
    document.body.style.overflow = '';
  };

  elements.forEach((element, i) => {
    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');
    element.addEventListener('click', () => ouvrir(i));
    element.addEventListener('keydown', (evenement) => {
      if (evenement.key === 'Enter' || evenement.key === ' ') {
        evenement.preventDefault();
        ouvrir(i);
      }
    });
  });

  qs('[data-fermer]', visionneuse).addEventListener('click', fermerVue);
  qs('[data-precedent]', visionneuse).addEventListener('click', () => afficher(index - 1));
  qs('[data-suivant]', visionneuse).addEventListener('click', () => afficher(index + 1));
  visionneuse.addEventListener('click', (evenement) => {
    if (evenement.target === visionneuse || evenement.target.tagName === 'FIGURE') fermerVue();
  });
  document.addEventListener('keydown', (evenement) => {
    if (!visionneuse.classList.contains('est-ouvert')) return;
    if (evenement.key === 'Escape') fermerVue();
    if (evenement.key === 'ArrowLeft') afficher(index - 1);
    if (evenement.key === 'ArrowRight') afficher(index + 1);
  });
}

/* ---------------------------------------------------------------- compteurs */
export function initCompteurs(racine = document) {
  const compteurs = qsa('[data-compteur]', racine);
  if (!compteurs.length) return;

  const animer = (element) => {
    const cible = Number(element.dataset.compteur || 0);
    if (reduireMouvement() || !Number.isFinite(cible)) {
      element.textContent = element.dataset.compteur || '';
      return;
    }
    const duree = 1200;
    const debut = performance.now();
    const etape = (maintenant) => {
      const progression = Math.min((maintenant - debut) / duree, 1);
      const valeur = Math.round(cible * (1 - Math.pow(1 - progression, 3)));
      element.textContent = new Intl.NumberFormat('fr-FR').format(valeur);
      if (progression < 1) requestAnimationFrame(etape);
    };
    requestAnimationFrame(etape);
  };

  if (!('IntersectionObserver' in window)) {
    compteurs.forEach(animer);
    return;
  }
  const observateur = new IntersectionObserver((entrees) => {
    entrees.forEach((entree) => {
      if (!entree.isIntersecting) return;
      animer(entree.target);
      observateur.unobserve(entree.target);
    });
  });
  compteurs.forEach((element) => observateur.observe(element));
}

/* ---------------------------------------------------------------- filtres génériques */
/**
 * Branche un groupe de boutons (data-filtre) sur un rendu.
 * @param {Object} options
 */
export function initFiltres({ conteneur, attribut = 'filtre', surChangement }) {
  const groupe = qs(conteneur);
  if (!groupe) return;
  const boutons = qsa(`[data-${attribut}]`, groupe);

  const activer = (bouton) => {
    boutons.forEach((b) => {
      const actif = b === bouton;
      b.classList.toggle('est-actif', actif);
      b.setAttribute('aria-pressed', String(actif));
    });
    surChangement(bouton.dataset[attribut], bouton);
  };

  boutons.forEach((bouton) => bouton.addEventListener('click', () => activer(bouton)));
  const initial = boutons.find((b) => b.classList.contains('est-actif')) || boutons[0];
  if (initial) activer(initial);
}

/* ---------------------------------------------------------------- formulaires */
const MESSAGES = {
  valueMissing: 'Ce champ est obligatoire.',
  typeMismatch: "Le format saisi n'est pas valide.",
  tooShort: 'Saisie trop courte.',
  patternMismatch: "Le format saisi n'est pas valide."
};

export function initFormulaire(formulaire, { surEnvoi } = {}) {
  if (!formulaire) return;
  const champs = qsa('input, select, textarea', formulaire);

  const messageErreur = (champ) => {
    const erreur = MESSAGES[champ.validity.valueMissing && champ.type !== 'email' ? 'valueMissing' : 'typeMismatch'];
    return champ.dataset.message || erreur;
  };

  const afficherErreur = (champ, erreur) => {
    const zone = qs(`[data-erreur="${champ.name}"]`, formulaire);
    champ.setAttribute('aria-invalid', String(Boolean(erreur)));
    champ.classList.toggle('border-red-400', Boolean(erreur));
    if (zone) {
      zone.textContent = erreur ? messageErreur(champ) : '';
      zone.hidden = !erreur;
    }
  };

  champs.forEach((champ) => {
    champ.addEventListener('blur', () => {
      if (champ.value.trim() === '' && !champ.required) return afficherErreur(champ, false);
      afficherErreur(champ, !champ.checkValidity());
    });
    champ.addEventListener('input', () => {
      if (champ.getAttribute('aria-invalid') === 'true') afficherErreur(champ, !champ.checkValidity());
    });
  });

  formulaire.addEventListener('submit', async (evenement) => {
    evenement.preventDefault();
    let premierInvalide = null;
    champs.forEach((champ) => {
      const invalide = !champ.checkValidity();
      afficherErreur(champ, invalide);
      if (invalide && !premierInvalide) premierInvalide = champ;
    });

    if (premierInvalide) {
      premierInvalide.focus();
      notifier('Merci de corriger les champs signalés.', 'alerte');
      return;
    }

    const donnees = Object.fromEntries(new FormData(formulaire).entries());
    const bouton = qs('button[type="submit"]', formulaire);
    const libelle = bouton?.innerHTML;
    if (bouton) {
      bouton.disabled = true;
      bouton.innerHTML = 'Envoi en cours…';
    }

    try {
      await (surEnvoi ? surEnvoi(donnees) : Promise.resolve());
      formulaire.reset();
      notifier(
        formulaire.dataset.messageSucces ||
          'Message enregistré. La fédération vous répondra dans les meilleurs délais.'
      );
      qs('[data-confirmation]', formulaire)?.removeAttribute('hidden');
    } catch (erreur) {
      notifier("L'envoi a échoué. Merci de réessayer ou de contacter la fédération via son compte Instagram.", 'alerte');
    } finally {
      if (bouton) {
        bouton.disabled = false;
        bouton.innerHTML = libelle;
      }
    }
  });
}

/* ---------------------------------------------------------------- copie de lien */
export function initCopieLiens(racine = document) {
  qsa('[data-copier]', racine).forEach((bouton) => {
    bouton.addEventListener('click', async () => {
      const valeur = bouton.dataset.copier || window.location.href;
      const ok = await copier(valeur);
      notifier(ok ? 'Lien copié dans le presse-papier.' : 'Copie impossible sur ce navigateur.', ok ? 'succes' : 'alerte');
    });
  });
}

/* ---------------------------------------------------------------- recherche instantanée */
export function initRecherche(champ, surSaisie) {
  if (!champ) return;
  champ.addEventListener('input', debounce(() => surSaisie(champ.value), 200));
}

/* ---------------------------------------------------------------- onglets (accessibles) */
export function initOnglets(conteneur) {
  const racine = qs(conteneur);
  if (!racine) return;
  const onglets = qsa('[role="tab"]', racine);
  const panneaux = qsa('[role="tabpanel"]', racine);

  const activer = (onglet) => {
    onglets.forEach((o) => {
      const actif = o === onglet;
      o.setAttribute('aria-selected', String(actif));
      o.tabIndex = actif ? 0 : -1;
      o.classList.toggle('est-actif', actif);
    });
    panneaux.forEach((p) => {
      p.hidden = p.id !== onglet.getAttribute('aria-controls');
    });
  };

  onglets.forEach((onglet) => {
    onglet.addEventListener('click', () => activer(onglet));
    onglet.addEventListener('keydown', (evenement) => {
      const index = onglets.indexOf(onglet);
      if (evenement.key === 'ArrowRight') activer(onglets[(index + 1) % onglets.length]);
      if (evenement.key === 'ArrowLeft') activer(onglets[(index - 1 + onglets.length) % onglets.length]);
    });
  });
  if (onglets.length) activer(onglets.find((o) => o.getAttribute('aria-selected') === 'true') || onglets[0]);
}

/* ---------------------------------------------------------------- soulignement de la navigation */
export function initSectionActive(selecteurSections = 'section[id]', selecteurLiens = 'a.lien-nav') {
  const sections = qsa(selecteurSections);
  const liens = qsa(selecteurLiens).filter((lien) => lien.hash);
  if (!sections.length || !liens.length) return;

  const observateur = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((entree) => {
        if (!entree.isIntersecting) return;
        liens.forEach((lien) => {
          lien.classList.toggle('est-actif', lien.hash === `#${entree.target.id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((section) => observateur.observe(section));
}

/* ---------------------------------------------------------------- utilitaires d'affichage */
export function etatVide({ icone: nom = 'onde', titre, texte, action }) {
  return `<div class="revele rounded-2xl border border-dashed border-sable-300 bg-sable-50 px-8 py-14 text-center">
      <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-vert-50 text-vert-600">${icone(
        nom,
        'h-6 w-6'
      )}</span>
      <p class="mt-4 font-display text-lg font-bold text-vert-900">${esc(titre)}</p>
      ${texte ? `<p class="mx-auto mt-2 max-w-md text-sm text-encre-doux">${esc(texte)}</p>` : ''}
      ${action ? `<div class="mt-6">${action}</div>` : ''}
    </div>`;
}

export function puce({ libelle, valeur, icone: nom = 'check' }) {
  return `<span class="inline-flex items-center gap-2 rounded-full bg-vert-50 px-3.5 py-1.5 text-[0.8rem] font-medium text-vert-700">
      ${icone(nom, 'h-4 w-4')}${esc(libelle)}${valeur ? `<strong class="font-semibold text-vert-900">${esc(valeur)}</strong>` : ''}
    </span>`;
}
