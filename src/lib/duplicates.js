import { itemKey, levenshtein } from './text.js';

/**
 * Compare un nouvel article à la liste existante.
 *  - "exact"   : même produit (casse/accents/pluriel ignorés) → on fusionne les quantités
 *  - "similar" : très probablement une faute de frappe (distance d'édition 1-2) → on demande
 * Les produits "voisins" ("lait" / "lait de coco", "tomate" / "tomate cerise") ne sont PAS des doublons.
 */
export const findDuplicate = (name, items) => {
  const key = itemKey(name);
  if (!key) return null;

  let similar = null;
  for (const item of items) {
    const other = itemKey(item.name);
    if (!other) continue;
    if (other === key) return { type: 'exact', item };

    if (!similar && Math.min(key.length, other.length) >= 4) {
      const max = Math.max(key.length, other.length) >= 9 ? 2 : 1;
      if (levenshtein(key, other) <= max) similar = { type: 'similar', item };
    }
  }
  return similar;
};

/** Deux articles de même nom : quantités additionnables seulement si l'unité est la même. */
export const sameUnit = (a, b) => (a || '') === (b || '');
