# Mathilde & Louis - Courses 🛒

Une application de liste de courses collaborative, ultra-rapide et intuitive, conçue spécialement pour Mathilde et Louis.

## 🔗 Liens
- **Production URL**: https://attrape-reves-courses.pages.dev
- **Repo GitHub**: https://github.com/louispick/liste-courses

## 🛠 Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **Hosting**: Cloudflare Pages
- **Smart Features**: 
  - Regex parsing (Quantité/Unité/Nom)
  - Fuzzy Search (Doublons)
  - Auto-catégorisation

## 🚀 Fonctionnalités
1. **Saisie Rapide**: "2kg tomates" est automatiquement parsé.
2. **Anti-Doublon**: Détection intelligente (ex: "Oeuf" vs "Oeufs").
3. **Catégories**: Tri automatique par rayon.
4. **Recettes**: Ajout en un clic de tous les ingrédients d'une recette.
5. **Multi-User**: Liste synchronisée en temps réel entre les comptes connectés.

## ⚠️ Configuration Requise
Pour que l'application fonctionne, **Firebase Authentication (Email/Password)** et **Firestore Database** doivent être activés dans la console Firebase.

## 📱 Installation (PWA)
L'application est responsive et conçue pour être "installée" sur l'écran d'accueil de ton mobile (Ajouter à l'écran d'accueil).
