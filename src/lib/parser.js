import { findCategory } from './categories.js';

// Unités reconnues → forme canonique (singulier). Les symboles métriques sont collés à la quantité.
const UNIT_ALIASES = {
  kg: 'kg', kilo: 'kg', kilos: 'kg',
  g: 'g', gr: 'g', gramme: 'g', grammes: 'g',
  mg: 'mg',
  l: 'l', litre: 'l', litres: 'l',
  ml: 'ml', cl: 'cl', dl: 'dl',
  pcs: 'pièce', pce: 'pièce', pièce: 'pièce', pièces: 'pièce', piece: 'pièce', pieces: 'pièce',
  paquet: 'paquet', paquets: 'paquet', pqt: 'paquet',
  boite: 'boîte', boites: 'boîte', boîte: 'boîte', boîtes: 'boîte', bte: 'boîte',
  bouteille: 'bouteille', bouteilles: 'bouteille', btl: 'bouteille',
  tranche: 'tranche', tranches: 'tranche',
  poignée: 'poignée', poignee: 'poignée', poignées: 'poignée',
  pincée: 'pincée', pincee: 'pincée',
  botte: 'botte', bottes: 'botte',
  pot: 'pot', pots: 'pot',
  sac: 'sac', sacs: 'sac',
  brique: 'brique', briques: 'brique',
  barquette: 'barquette', barquettes: 'barquette',
  rouleau: 'rouleau', rouleaux: 'rouleau',
  sachet: 'sachet', sachets: 'sachet',
  tube: 'tube', tubes: 'tube',
  pack: 'pack', packs: 'pack',
  plaquette: 'plaquette', plaquettes: 'plaquette',
  tablette: 'tablette', tablettes: 'tablette',
  bocal: 'bocal', bocaux: 'bocal',
  conserve: 'conserve', conserves: 'conserve',
  douzaine: 'douzaine', douzaines: 'douzaine',
};

const SYMBOL_UNITS = new Set(['kg', 'g', 'mg', 'l', 'ml', 'cl', 'dl']);
const UNIT_WORDS = Object.keys(UNIT_ALIASES).sort((a, b) => b.length - a.length).join('|');

const NUM = '(\\d+(?:[.,]\\d+)?|\\d+\\/\\d+)';
// "2kg tomates", "2 x tomates", "6 oeufs", "1/2 chou", "3 boîtes de thon"
const PREFIX_REGEX = new RegExp(`^${NUM}\\s*(?:x\\s*)?(${UNIT_WORDS})?(?=\\s|$)\\s*(.*)$`, 'i');
// "tomates 2kg", "oeufs x6", "lait 2", "oeufs 6x"
const SUFFIX_REGEX = new RegExp(`^(.+?)\\s+(?:x\\s*)?${NUM}\\s*(?:x)?\\s*(${UNIT_WORDS})?$`, 'i');

const toNumber = (raw) => {
  if (raw.includes('/')) {
    const [a, b] = raw.split('/').map(Number);
    return b ? a / b : 1;
  }
  return parseFloat(raw.replace(',', '.'));
};

const canonicalUnit = (raw) => (raw ? UNIT_ALIASES[raw.toLowerCase()] || '' : '');

// Articles/prépositions en tête du nom : "de la farine" → "farine"
const LEADING_FILLER = /^(?:(?:de la|de l'|de l’|des|du|de|d'|d’|le|la|les|l'|l’|un|une)\s+|d'|d’|l'|l’)/i;

const cleanName = (raw) => {
  let name = raw.trim().replace(/\s+/g, ' ');
  // peut y avoir plusieurs fillers enchaînés ("de la", "des")
  for (let i = 0; i < 2; i++) name = name.replace(LEADING_FILLER, '');
  name = name.replace(/^[-–—,.:;\s]+|[-–—,.:;\s]+$/g, '');
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/** Affichage "2 kg" / "500g" / "3 boîtes" */
export const formatQuantity = (qty, unit) => {
  const q = Number.isInteger(qty) ? qty : Math.round(qty * 100) / 100;
  if (!unit) return String(q);
  if (SYMBOL_UNITS.has(unit)) return `${q}${unit}`;
  const plural = q > 1 && !/s$|x$/.test(unit) ? (unit === 'bocal' ? 'bocaux' : `${unit}s`) : unit;
  return `${q} ${plural}`;
};

/** Texte éditable correspondant à un article (inverse de parseInput) */
export const itemToText = ({ name, qty, unit }) => {
  if (!unit && (!qty || qty === 1)) return name;
  const q = Number.isInteger(qty) ? qty : Math.round(qty * 100) / 100;
  if (!unit) return `${q} ${name}`;
  return SYMBOL_UNITS.has(unit) ? `${q}${unit} ${name}` : `${q} ${unit} ${name}`;
};

export const parseInput = (input) => {
  const trimmed = String(input ?? '').trim().replace(/\s+/g, ' ');
  if (!trimmed) return null;

  let qty = 1;
  let unit = '';
  let name = trimmed;

  const lotMatch = trimmed.match(/^(?:pack|lot|barquette|filet)\s+de\s+(\d+)\s+(.+)$/i);
  const prefix = trimmed.match(PREFIX_REGEX);
  if (lotMatch) {
    qty = parseInt(lotMatch[1], 10);
    name = lotMatch[2];
  } else if (prefix && prefix[3].trim()) {
    qty = toNumber(prefix[1]);
    unit = canonicalUnit(prefix[2]);
    name = prefix[3];
  } else {
    const suffix = trimmed.match(SUFFIX_REGEX);
    if (suffix) {
      name = suffix[1];
      qty = toNumber(suffix[2]);
      unit = canonicalUnit(suffix[3]);
    }
  }

  if (!Number.isFinite(qty) || qty <= 0) qty = 1;

  name = cleanName(name);
  if (!name) return null;

  return { name, qty, unit, category: findCategory(name) };
};

/** "lait, 2 oeufs; pain" → plusieurs articles (séparateurs : virgule, point-virgule, retour ligne) */
export const parseMany = (input) =>
  String(input ?? '')
    .split(/[,;\n]+/)
    .map(parseInput)
    .filter(Boolean);
