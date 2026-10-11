// Utilitaires de normalisation de texte partagés (catégories, parseur, doublons).

const STOPWORDS = new Set([
  'de', 'du', 'des', 'd', 'la', 'le', 'les', 'l', 'un', 'une', 'a', 'au', 'aux',
  'en', 'et', 'pour', 'avec', 'sans', 'sur', 'ou',
]);

/** minuscules, sans accents, œ→oe, ponctuation → espaces */
export const normalizeText = (text = '') =>
  String(text)
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Singulier "brutal" : même transformation des deux côtés (dico + saisie), donc cohérent. */
export const stem = (word) => {
  if (word.length > 3 && /[sx]$/.test(word)) return word.slice(0, -1);
  return word;
};

/** "Tomates cerises" → ["tomate", "cerise"] (sans mots vides) */
export const tokenize = (text) =>
  normalizeText(text)
    .split(' ')
    .filter((w) => w && !STOPWORDS.has(w))
    .map(stem);

/** Clé canonique d'un nom d'article : "Œufs" et "oeuf" donnent la même clé. */
export const itemKey = (name) => tokenize(name).join(' ');

export const levenshtein = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[b.length];
};
