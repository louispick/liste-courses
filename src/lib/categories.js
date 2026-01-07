export const CATEGORIES = {
  "Fruits & Légumes": [
    "tomate", "pomme", "banane", "oignon", "ail", "carotte", "courgette", "poivron", "salade", "citron", "avocat", "concombre", "champignon", "fraise", "framboise", "myrtille", "orange", "clémentine", "mandarine", "poire", "raisin", "aubergine", "brocoli", "chou", "épinard", "haricot", "radis", "poireau", "céleri", "navet", "courge", "potimarron", "butternut", "kiwi", "melon", "pastèque", "pêche", "abricot", "cerise", "mangue", "ananas", "fruit", "legume", "légume", "verdure", "herbe", "persil", "ciboulette", "basilic", "coriandre", "menthe",
    "pomme de terre", "patate", "pdt" // Synonymes patates
  ],
  "Frais & Crèmerie": [
    "lait", "beurre", "oeuf", "yaourt", "fromage", "crème", "creme", "mozzarella", "mozza", "emmental", "comté", "parmesan", "gruyère", "chèvre", "feta", "ricotta", "mascarpone", "skyr", "petit suisse", "blanc", "faisselle", "camembert", "brie", "roquefort", "bleu", "gouda", "mimolette", "raclette", "fondue", "tartiflette", "reblochon"
  ],
  "Viandes & Poissons": [
    "poulet", "boeuf", "porc", "jambon", "lardon", "saucisse", "steak", "haché", "poisson", "saumon", "thon", "crevette", "cabillaud", "dinde", "veau", "agneau", "viande", "boucher", "charcuterie", "saucisson", "terrine", "pâté", "rillettes", "merguez", "chipolata", "cordon bleu", "nugget", "surimi", "moule", "huitre", "saint jacques", "calamar"
  ],
  "Épicerie": [
    "pâtes", "pate", "riz", "farine", "sucre", "sel", "poivre", "huile", "vinaigre", "conserve", "sauce", "moutarde", "ketchup", "mayonnaise", "mayo", "confiture", "miel", "chocolat", "café", "thé", "biscuit", "gâteau", "céréales", "pain", "brioche", "lentille", "pois", "haricot rouge", "épice", "bouillon", "cube", "levure", "vanille", "cacao", "nutella", "pâte à tartiner", "chips", "apéro", "cacahuète", "noix", "amande", "noisette", "semoule", "blé", "quinoa", "biscotte", "tartine"
  ],
  "Boissons": [
    "eau", "jus", "soda", "bière", "vin", "sirop", "cola", "fanta", "sprite", "thé glacé", "ice tea", "café", "alcool", "whisky", "rhum", "vodka", "pastis", "cidre", "champagne"
  ],
  "Hygiène & Maison": [
    "papier toilette", "pq", "essuie-tout", "sopalin", "lessive", "liquide vaisselle", "shampoing", "gel douche", "dentifrice", "savon", "éponge", "sac poubelle", "mouchoir", "nettoyant", "javel", "produit", "wc", "toilette", "brosse", "rasoir", "mousse", "déo", "déodorant", "coton", "couche", "lingette"
  ],
  "Bébé": [
    "lait bébé", "pot", "compote bébé", "biberon", "tétine"
  ],
  "Animaux": [
    "croquette", "pâtée", "litière", "chien", "chat", "oiseau", "poisson"
  ],
  "Autre": []
};

export const normalizeItem = (text) => {
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents
};

export const findCategory = (itemName) => {
  const normalized = normalizeItem(itemName);
  
  // Algorithme amélioré : 
  // 1. On cherche d'abord les correspondances exactes ou "mot entier" pour éviter les faux positifs
  // ex: "Thé" ne doit pas matcher dans "Menthe"
  
  for (const [category, items] of Object.entries(CATEGORIES)) {
    for (const keyword of items) {
        const normKeyword = normalizeItem(keyword);
        
        // Si le mot clé est contenu dans le nom de l'article
        if (normalized.includes(normKeyword)) {
            return category;
        }
        
        // Gestion singulier/pluriel basique (si le mot-clé + 's' est dans l'article)
        if (normalized.includes(normKeyword + 's') || normalized.includes(normKeyword + 'x')) {
            return category;
        }
    }
  }
  return "Autre"; // Default
};
