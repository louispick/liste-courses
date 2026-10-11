# Mathilde & Louis — Courses 🛒

Liste de courses collaborative (temps réel), recettes, valises de voyage et petit jeu de couple.

- **Production** : https://attrape-reves-courses.pages.dev
- **Stack** : React 19 + Vite + Tailwind 4, Firebase (Auth + Firestore), Cloudflare Pages

## Fonctionnalités

| Onglet | Ce que ça fait |
|---|---|
| **Courses** | Saisie rapide (`2kg tomates`, `oeufs x6`, `lait, pain, 3 yaourts`), tri automatique par rayon, fusion des doublons, rayon modifiable à la main |
| **Recettes** | Ingrédients saisis en texte libre, ajout en un clic à la liste |
| **Valises** | Liste type par personne, « Nouveau départ » pour tout décocher |
| **Jeu** | 20 questions par session : chacun répond pour soi puis pour l'autre |
| **Top** | Produits les plus achetés, ajout en un clic |

### Comment ça marche (courses)

- **Catégories** (`src/lib/categories.js`) : dictionnaire par rayon, accents/pluriels ignorés, reconnaissance des expressions (« jus de pomme » ≠ pomme, « pâtes » ≠ « pâté »), mots décisifs (surgelé, boîte, bébé…). La catégorie est recalculée à l'affichage : améliorer le dictionnaire corrige aussi les articles déjà présents. Un rayon choisi à la main est conservé.
- **Parseur** (`src/lib/parser.js`) : quantité devant ou derrière, `x6`, `1/2`, unités (`kg`, `boîtes`, `rouleaux`…), « de/du/des » retirés.
- **Doublons** (`src/lib/duplicates.js`) : même produit (« Œuf » = « oeufs ») → quantités additionnées avec le même rayon ; faute de frappe probable → on demande ; produits voisins (« lait » / « lait de coco ») → pas de fausse alerte.

### Jeu

Les questions sont dans `src/lib/questions.js` (règles d'ajout en tête de fichier : ne jamais changer l'id ou l'ordre d'une question existante, ajouter à la fin par paquets de 20).

## Développement

```bash
cp .env.example .env.local   # puis renseigner les clés Firebase
npm ci
npm run dev
npm test        # parseur, catégories, doublons, banque de questions
npm run lint
npm run build
```

## Déploiement

Variables `VITE_FIREBASE_*` à définir dans Cloudflare Pages (Settings → Variables). Puis `npm run deploy`
(ou push sur la branche de production si le dépôt est relié à Pages).

## Sécurité — à faire côté Firebase

1. **Règles Firestore** : publier `firestore.rules` (en renseignant les deux adresses e-mail). Sans ça, toute
   personne ayant un compte Firebase du projet peut lire/écrire les données.
2. **Authentication → Paramètres** : désactiver « Autoriser la création de comptes » (le formulaire d'inscription a
   été retiré de l'app, mais l'API reste ouverte tant que ce réglage est actif).
3. **Authentication → Domaines autorisés** : ne garder que le domaine de production et `localhost`.
