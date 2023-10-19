# Vinted clone projet le Reacteur 🚀

Ce projet est une réalisation dans le cadre du bootcamp de développement web de [Le Réacteur](https://www.lereacteur.io/). Il s'agit d'un clone du backend du site [Vinted](https://www.vinted.fr/), permettant de gérer des annonces.

## Sommaire

- [🛠 Stack technologique](#-stack-technologique)
- [🌟 Fonctionnalités](#-fonctionnalités)
- [🚀 Installation](#-installation)
- [📌 Routes disponibles](#-routes-disponibles)
- [🚀 À propos du bootcamp Le Réacteur](#-à-propos-du-bootcamp-le-réacteur)

## 🛠 Stack technologique

- Node.js
- Express.js
- MongoDB
- Cloudinary (pour le stockage d'images)

## 🌟 Fonctionnalités

- Création et connexion d'utilisateurs 👤
- Upload d'images pour les avatars et les articles 📷
- Ajout, mise à jour et suppression d'annonces 📄
- Filtrage et tri des annonces selon différents critères 🔍
- Récupération des détails d'une annonce spécifique 📋

## 🚀 Installation

1. Cloner le dépôt :

```bash
git clone https://github.com/Wormav/Vinted_clone_le_Reacteur.git
```

2. Se déplacer dans le dossier api :

```bash
cd api
```

3. Installer les dépendances :

```bash
npm install
```

4. Créer un fichier `.env` à la racine du dosser `api` avec les variables d'environnement nécessaires :

```
DB_URL=your_mongo_db_uri
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

5. Lancer le serveur :

```bash
npm run dev
```

## 📌 Routes disponibles

- `/user/signup` : inscription d'un nouvel utilisateur
- `/user/login` : connexion d'un utilisateur
- `/offer/publish` : création d'une nouvelle annonce
- `/offer/update/:id`: modifie une annonce
- `/offer/remove/:id`: supprime une annonce
- `/offers/:id` : récupération des détails d'une annonce spécifique
- `/offers` : récupération d'une liste d'annonces selon les critères fournis

## 🚀 À propos du bootcamp Le Réacteur

[Le Réacteur](https://www.lereacteur.io/) est un bootcamp de 10 semaines axé sur JavaScript, avec une spécialisation dans le stack MERN (MongoDB, Express.js, React, Node.js) ainsi que React Native. Le programme est intensif et couvre de nombreux aspects du développement web moderne.
