/* ==========================================================================
   FETOC - Pages juridiques (mentions légales, confidentialité, accessibilité)
   Page de contenu statique : amorçage commun et date de mise à jour.
   ========================================================================== */

import { demarrer } from '../core/app.js';
import { qsa, dateLongue, iso } from '../core/utils.js';

demarrer().then(() => {
  const aujourdhui = dateLongue(iso());
  qsa('[data-maj]').forEach((element) => {
    element.textContent = aujourdhui;
  });
});
