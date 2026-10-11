import { tokenize } from './text.js';

// Ordre = ordre d'affichage (parcours type d'un supermarché).
// Les noms des catégories historiques sont conservés pour ne pas casser les données existantes.
export const CATEGORIES = {
  'Fruits & Légumes': [
    'tomate', 'pomme', 'banane', 'oignon', 'echalote', 'ail', 'carotte', 'courgette', 'poivron', 'salade',
    'laitue', 'mache', 'roquette', 'citron', 'citron vert', 'avocat', 'concombre', 'champignon', 'fraise',
    'framboise', 'myrtille', 'mure', 'orange', 'clementine', 'mandarine', 'pamplemousse', 'poire', 'raisin',
    'aubergine', 'brocoli', 'chou', 'chou fleur', 'epinard', 'haricot vert', 'haricot', 'radis', 'poireau',
    'celeri', 'navet', 'courge', 'potiron', 'potimarron', 'butternut', 'kiwi', 'melon', 'pasteque', 'peche',
    'nectarine', 'abricot', 'prune', 'cerise', 'mangue', 'ananas', 'figue', 'grenade', 'fruit', 'legume',
    'verdure', 'herbe', 'persil', 'ciboulette', 'basilic', 'coriandre', 'menthe', 'thym', 'romarin',
    'gingembre', 'betterave', 'fenouil', 'asperge', 'artichaut', 'endive', 'patate douce', 'patate',
    'pomme de terre', 'pdt', 'petit pois', 'mais', 'piment', 'cresson', 'salade composee', 'fruit sec',
  ],
  'Boulangerie': [
    'pain', 'baguette', 'croissant', 'pain au chocolat', 'brioche', 'viennoiserie', 'pain de mie',
    'pain burger', 'pain hot dog', 'bun', 'ficelle', 'pain complet', 'pain aux cereales', 'chausson',
    'pain perdu', 'tarte', 'eclair', 'flan patissier', 'galette des rois',
  ],
  'Viandes & Poissons': [
    'poulet', 'boeuf', 'porc', 'jambon', 'lardon', 'saucisse', 'steak', 'hache', 'viande hachee', 'poisson',
    'saumon', 'thon', 'crevette', 'cabillaud', 'colin', 'merlu', 'truite', 'dorade', 'bar', 'sardine',
    'maquereau', 'dinde', 'veau', 'agneau', 'canard', 'lapin', 'viande', 'charcuterie', 'saucisson',
    'terrine', 'pate de campagne', 'rillette', 'merguez', 'chipolata', 'cordon bleu', 'nugget', 'surimi',
    'moule', 'huitre', 'saint jacques', 'calamar', 'escalope', 'cote de porc', 'cote de boeuf', 'entrecote',
    'roti', 'blanc de poulet', 'cuisse', 'filet', 'bacon', 'chorizo', 'knacki', 'poulet roti', 'foie gras',
    'boudin', 'andouillette', 'gigot', 'jambonneau', 'tranche de jambon', 'pilon', 'aiguillette',
  ],
  'Frais & Crèmerie': [
    'lait', 'beurre', 'oeuf', 'yaourt', 'yaourt grec', 'fromage', 'creme', 'creme fraiche', 'mozzarella',
    'mozza', 'emmental', 'comte', 'parmesan', 'gruyere', 'chevre', 'feta', 'ricotta', 'mascarpone', 'skyr',
    'petit suisse', 'fromage blanc', 'faisselle', 'camembert', 'brie', 'roquefort', 'bleu', 'gouda',
    'mimolette', 'raclette', 'reblochon', 'fromage rape', 'rape', 'creme dessert', 'danette', 'dessert lacte',
    'margarine', 'pate feuilletee', 'pate brisee', 'pate sablee', 'pate a pizza', 'pate a tarte',
    'houmous', 'tzatziki', 'guacamole', 'tofu', 'seitan', 'lait ribot', 'lait fermente', 'kefir',
    'fromage a raclette', 'cancoillotte', 'chaource', 'munster', 'boursin', 'kiri', 'vache qui rit',
    'lait vegetal', 'boisson vegetale', 'creme liquide', 'chantilly', 'cottage cheese',
  ],
  'Surgelés': [
    'surgele', 'congele', 'glace', 'sorbet', 'pizza', 'poisson pane', 'frite', 'legume surgele',
    'epinard surgele', 'gratin', 'lasagne', 'glaçon', 'glacon', 'bac a glacon', 'steak hache surgele',
    'poelee', 'beignet', 'burger surgele', 'cornet', 'esquimau', 'buche glacee',
  ],
  'Épicerie': [
    'pate', 'spaghetti', 'tagliatelle', 'penne', 'fusilli', 'macaroni', 'coquillette', 'lasagne seche',
    'riz', 'farine', 'sucre', 'sucre glace', 'sel', 'poivre', 'huile', 'huile d olive', 'vinaigre',
    'vinaigre balsamique', 'conserve', 'sauce', 'sauce tomate', 'coulis', 'moutarde', 'ketchup', 'mayonnaise',
    'mayo', 'confiture', 'miel', 'chocolat', 'cafe', 'the', 'infusion', 'tisane', 'biscuit', 'gateau',
    'cereale', 'muesli', 'granola', 'flocon d avoine', 'lentille', 'pois chiche', 'haricot rouge',
    'haricot blanc', 'feve', 'epice', 'bouillon', 'cube', 'levure', 'vanille', 'cacao', 'nutella',
    'pate a tartiner', 'chips', 'aperitif', 'cacahuete', 'noix', 'noix de cajou', 'amande', 'noisette',
    'pistache', 'semoule', 'couscous', 'ble', 'quinoa', 'boulgour', 'polenta', 'biscotte', 'tartine',
    'compote', 'tomate pelee', 'tomate concassee', 'concentre de tomate', 'puree', 'chapelure', 'maizena',
    'lait de coco', 'creme de coco', 'lait d amande', 'sirop d agave', 'sucre vanille', 'pate d amande',
    'cornichon', 'olive', 'capre', 'sardine a l huile', 'thon en boite', 'maïs', 'tortilla', 'wrap',
    'galette', 'cracker', 'gaufrette', 'madeleine', 'speculoos', 'bonbon', 'chewing gum', 'pastille',
    'pop corn', 'popcorn', 'soupe', 'veloute', 'plat cuisine', 'nouille', 'ramen', 'sauce soja', 'wasabi',
    'gingembre confit', 'beurre de cacahuete', 'pate de curry', 'curry', 'paprika', 'cumin', 'cannelle',
    'herbes de provence', 'ail en poudre', 'sucre roux', 'cassonade', 'edulcorant', 'fecule', 'gelatine',
    'colorant', 'pepite de chocolat', 'chocolat noir', 'chocolat au lait', 'chocolat patissier',
    'chocolat chaud', 'cafe moulu', 'capsule', 'dosette', 'cafe soluble', 'chicoree', 'ovomaltine',
  ],
  'Boissons': [
    'eau', 'eau gazeuse', 'jus', 'jus d orange', 'jus de pomme', 'soda', 'biere', 'vin', 'vin rouge',
    'vin blanc', 'rose', 'sirop', 'cola', 'coca', 'pepsi', 'fanta', 'sprite', 'orangina', 'schweppes',
    'the glace', 'ice tea', 'limonade', 'alcool', 'whisky', 'rhum', 'vodka', 'gin', 'pastis', 'cidre',
    'champagne', 'prosecco', 'biere sans alcool', 'perrier', 'badoit', 'evian', 'volvic', 'red bull',
    'tonic', 'ginger beer', 'liqueur', 'aperitif alcool', 'kombucha', 'smoothie', 'nectar', 'lait de soja',
  ],
  'Hygiène & Maison': [
    'papier toilette', 'pq', 'essuie tout', 'sopalin', 'lessive', 'adoucissant', 'liquide vaisselle',
    'tablette lave vaisselle', 'pastille lave vaisselle', 'sel lave vaisselle', 'rincage', 'shampoing',
    'apres shampoing', 'gel douche', 'dentifrice', 'brosse a dent', 'fil dentaire', 'bain de bouche', 'savon',
    'eponge', 'sac poubelle', 'mouchoir', 'nettoyant', 'javel', 'eau de javel', 'produit menager',
    'produit vaisselle', 'wc', 'brosse', 'rasoir', 'mousse a raser', 'deo', 'deodorant', 'coton',
    'coton tige', 'lingette', 'serviette hygienique', 'tampon', 'protege slip', 'creme hydratante', 'creme solaire',
    'parfum', 'maquillage', 'demaquillant', 'papier alu', 'papier cuisson', 'film alimentaire', 'sac congelation',
    'sac de congelation', 'aluminium', 'pile', 'ampoule', 'bougie', 'allumette', 'briquet', 'desodorisant',
    'anticalcaire', 'degraissant', 'serpillere', 'balai', 'gant', 'vitre', 'nettoyant vitre', 'nettoyant sol',
    'nettoyant wc', 'pansement', 'doliprane', 'paracetamol', 'ibuprofene', 'serviette', 'nappe', 'torchon',
    'sac plastique', 'couche', 'mouchoir en papier',
  ],
  'Bébé': [
    'lait bebe', 'lait infantile', 'lait 2eme age', 'lait croissance', 'petit pot', 'compote bebe', 'biberon',
    'tetine', 'lingette bebe', 'couche bebe', 'cereale bebe', 'bouillie', 'liniment', 'creme change',
    'serum physiologique', 'gigoteuse', 'bavoir',
  ],
  'Animaux': [
    'croquette', 'patee', 'litiere', 'nourriture chat', 'nourriture chien', 'friandise chien',
    'friandise chat', 'os a macher', 'graine oiseau', 'collier antipuce', 'sac a crotte', 'granule lapin',
  ],
  'Autre': [],
};

// Mots qui, où qu'ils apparaissent dans le nom, imposent la catégorie.
// ex: "pizza surgelée", "thon en boîte", "haricots verts en conserve"
const OVERRIDE_TOKENS = new Map([
  ['surgele', 'Surgelés'],
  ['congele', 'Surgelés'],
  ['boite', 'Épicerie'],
  ['conserve', 'Épicerie'],
  ['bocal', 'Épicerie'],
  ['bebe', 'Bébé'],
  ['chien', 'Animaux'],
  ['chat', 'Animaux'],
]);

// Index { "phrase stemmée" → catégorie } + longueur max d'une phrase
const PHRASES = new Map();
let MAX_PHRASE = 1;
for (const [category, words] of Object.entries(CATEGORIES)) {
  for (const w of words) {
    const key = tokenize(w).join(' ');
    if (!key) continue;
    // le premier ajout gagne : l'ordre des catégories donne la priorité sur les doublons
    if (!PHRASES.has(key)) PHRASES.set(key, category);
    MAX_PHRASE = Math.max(MAX_PHRASE, key.split(' ').length);
  }
}

// Phrases à privilégier explicitement sur un mot isolé de même graphie dans une autre catégorie
// (ex: "pomme de terre" doit battre "pomme" ; géré par la recherche "phrase la plus longue d'abord").

export const normalizeItem = (text) => tokenize(text).join(' ');

/**
 * Catégorie d'un article. Stratégie :
 *  1. mots "forts" (surgelé, boîte, bébé…) ;
 *  2. de gauche à droite, la phrase connue la plus longue — le 1er nom est en général le "noyau"
 *     en français ("jus de pomme" → jus, "compote de pomme" → compote) ;
 *  3. à défaut, correspondance sur un mot isolé ; sinon "Autre".
 */
export const findCategory = (itemName) => {
  // "pâté" (avec accent final) ≠ "pâtes" : on le tranche avant la normalisation des accents
  if (/p[âa]t[ée]s?\b/i.test(itemName) && /pât[ée]/i.test(itemName) && !/pâtes?\b/i.test(itemName)) {
    return 'Viandes & Poissons';
  }
  const tokens = tokenize(itemName);
  if (tokens.length === 0) return 'Autre';

  // Si le nom entier est connu, on s'arrête là ("lait bébé", "chocolat noir"…)
  const whole = tokens.join(' ');
  if (PHRASES.has(whole)) return PHRASES.get(whole);

  for (const t of tokens) {
    if (OVERRIDE_TOKENS.has(t)) return OVERRIDE_TOKENS.get(t);
  }

  for (let i = 0; i < tokens.length; i++) {
    for (let n = Math.min(MAX_PHRASE, tokens.length - i); n >= 1; n--) {
      const hit = PHRASES.get(tokens.slice(i, i + n).join(' '));
      if (hit) return hit;
    }
  }
  return 'Autre';
};

export const CATEGORY_NAMES = Object.keys(CATEGORIES);
