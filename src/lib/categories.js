export const CATEGORIES = {
  "Fruits & Légumes": ["tomate", "pomme", "banane", "oignon", "ail", "carotte", "courgette", "poivron", "salade", "citron", "avocat", "pomme de terre", "concombre", "champignon", "fraise", "framboise", "myrtille", "orange", "clémentine", "mandarine", "poire", "raisin", "aubergine", "brocoli", "chou-fleur", "épinard", "haricot vert", "radis"],
  "Frais & Crèmerie": ["lait", "beurre", "oeuf", "oeufs", "yaourt", "fromage", "crème", "mozzarella", "emmental", "comté", "parmesan", "gruyère", "chèvre", "feta", "ricotta", "mascarpone", "skyr", "petit suisse"],
  "Viandes & Poissons": ["poulet", "boeuf", "porc", "jambon", "lardon", "saucisse", "steak", "haché", "poisson", "saumon", "thon", "crevette", "cabillaud", "dinde", "veau", "agneau"],
  "Épicerie": ["pâtes", "riz", "farine", "sucre", "sel", "poivre", "huile", "vinaigre", "conserve", "sauce", "moutarde", "ketchup", "mayonnaise", "confiture", "miel", "chocolat", "café", "thé", "biscuit", "gâteau", "céréales", "pain", "brioche", "lentille", "pois chiche", "haricot rouge"],
  "Boissons": ["eau", "jus", "soda", "bière", "vin", "sirop", "cola", "fanta", "sprite", "thé glacé"],
  "Hygiène & Maison": ["papier toilette", "essuie-tout", "lessive", "liquide vaisselle", "shampoing", "gel douche", "dentifrice", "savon", "éponge", "sac poubelle", "mouchoir", "nettoyant", "javel"],
  "Bébé": ["couche", "lingette", "lait bébé", "pot", "compote bébé"],
  "Animaux": ["croquette", "pâtée", "litière"],
  "Autre": []
};

export const normalizeItem = (text) => {
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents
};

export const findCategory = (itemName) => {
  const normalized = normalizeItem(itemName);
  
  for (const [category, items] of Object.entries(CATEGORIES)) {
    if (items.some(i => normalized.includes(normalizeItem(i)))) {
      return category;
    }
  }
  return "Autre"; // Default
};
