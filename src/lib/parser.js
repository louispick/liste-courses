import { findCategory } from './categories';

// Regex patterns
const QTY_REGEX = /^(\d+(?:[.,]\d+)?)\s*(kg|g|mg|l|ml|cl|pcs|pce|paquet|boite|bouteille|tranche|poignée|botte)?\s+(.+)$/i;

export const parseInput = (input) => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let qty = 1;
  let unit = '';
  let name = trimmed;

  const match = trimmed.match(QTY_REGEX);

  if (match) {
    // We found a quantity pattern
    qty = parseFloat(match[1].replace(',', '.'));
    unit = match[2] ? match[2].toLowerCase() : '';
    name = match[3];
  }

  // Auto-capitalize first letter of name
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
