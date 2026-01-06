import { findCategory } from './categories';

const UNITS = [
  'kg', 'g', 'mg', 
  'l', 'ml', 'cl', 
  'pcs', 'pce', 'pièce', 'piece',
  'paquet', 'paquets', 'pqt',
  'boite', 'boites', 'bte',
  'bouteille', 'bouteilles', 'btl',
  'tranche', 'tranches',
  'poignée', 'pincée',
  'botte', 'bottes',
  'pot', 'pots',
  'sac', 'sacs'
].join('|');

const PREFIX_REGEX = new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*(${UNITS})?\\s+(.+)$`, 'i');
const SUFFIX_REGEX = new RegExp(`^(.+?)\\s+(\\d+(?:[.,]\\d+)?)\\s*(${UNITS})?$`, 'i');

export const parseInput = (input) => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let qty = 1;
  let unit = '';
  let name = trimmed;

  // Essai 1 : Quantité au début ("2kg Tomates")
  let match = trimmed.match(PREFIX_REGEX);
  
  if (match) {
    qty = parseFloat(match[1].replace(',', '.'));
    unit = match[2] ? match[2].toLowerCase() : '';
    name = match[3];
  } else {
    // Essai 2 : Quantité à la fin ("Tomates 2kg")
    match = trimmed.match(SUFFIX_REGEX);
    if (match) {
      name = match[1];
      qty = parseFloat(match[2].replace(',', '.'));
      unit = match[3] ? match[3].toLowerCase() : '';
    }
  }

  // Nettoyage du nom
  name = name.trim();
  
  // Suppression des prépositions parasites (de, d', des) en début de nom
  // ex: "300g de farine" -> "farine"
  name = name.replace(/^(de\s+|d'|des\s+)/i, "");

  // Capitalisation
  name = name.charAt(0).toUpperCase() + name.slice(1);

  const category = findCategory(name);

  return {
    name,
    qty,
    unit,
    category,
    originalInput: input
  };
};
