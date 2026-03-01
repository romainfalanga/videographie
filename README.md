# Vidéographie

Application web 100% frontend pour naviguer visuellement dans ses vidéos stockées sur Google Drive.

## Prérequis

- Node.js 18+
- Un projet sur [Google Cloud Console](https://console.cloud.google.com/)

## Installation

### 1. Configurer Google Cloud

1. Créer un projet sur **Google Cloud Console**
2. Activer l'**API Google Drive v3** (APIs & Services > Enable APIs)
3. Créer un identifiant **OAuth 2.0** (APIs & Services > Credentials > Create Credentials > OAuth client ID)
   - Type : **Application web**
   - Origines JavaScript autorisées : `http://localhost:5173`
   - Pour la production, ajouter aussi : `https://ton-site.netlify.app`
4. Copier le **Client ID** obtenu

### 2. Configurer l'application

1. Cloner le repo :
   ```bash
   git clone https://github.com/ton-user/videographie.git
   cd videographie
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Ouvrir `src/config.js` et remplacer `YOUR_CLIENT_ID.apps.googleusercontent.com` par ton Client ID OAuth

### 3. Lancer en développement

```bash
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

### 4. Déployer

Le projet est configuré pour **Netlify** :

1. Connecter le repo GitHub à Netlify
2. La configuration de build est dans `netlify.toml` (commande : `npm run build`, publish : `dist`)
3. Ajouter l'URL Netlify aux origines JavaScript autorisées dans Google Cloud Console

## Architecture

```
src/
├── main.js           # Point d'entrée, router
├── config.js         # Client ID OAuth
├── auth/google.js    # Authentification Google (GIS)
├── api/drive.js      # Requêtes Google Drive API v3
├── data/
│   ├── cache.js      # Gestion du LocalStorage (seul accès)
│   ├── parser.js     # Parsing des noms de fichiers vidéo
│   └── sync.js       # Synchronisation Drive → cache
├── views/            # Pages de l'application
├── components/       # Composants réutilisables
└── styles/main.css   # Styles globaux
```

## Stack technique

- **Vite** + **Vanilla JS** (modules ES)
- **CSS pur**
- **Google Identity Services** (authentification)
- **Google Drive API v3** (lecture des fichiers)
- **LocalStorage** (cache local)
