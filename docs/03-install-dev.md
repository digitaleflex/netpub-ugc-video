# Guide d'Installation (Développement)

Ce guide explique comment configurer l'environnement de développement local.

## 📋 Prérequis

Assurez-vous d'avoir installé les outils suivants :

- **Node.js** (v20 recommandé)
- **npm** (v10+)
- **Docker** et **Docker Compose** (pour la base de données locale)
- **Git**

## 🚀 Installation étape par étape

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-repo>
   cd netpub-agence-video-ugc-production-publicitaire
   ```

2. **Installer les dépendances**
   À la racine du projet (monorepo) :
   ```bash
   npm install
   ```
   Cela installera les dépendances pour le frontend et le backend.

3. **Configurer les variables d'environnement**
   Copiez le fichier d'exemple et ajustez les valeurs (voir [Configuration](04-env-config.md) pour les détails).
   ```bash
   cp .env.example .env
   ```

4. **Lancer la base de données (via Docker)**
   Pour démarrer uniquement la base de données PostgreSQL nécessaire au développement :
   ```bash
   docker-compose up -d db
   ```

5. **Initialiser la base de données**
   Appliquez les migrations Prisma et générez le client :
   ```bash
   npm run db:migrate
   npm run db:generate
   ```
   (Optionnel) Pour remplir la base avec des données de test :
   ```bash
   npm run db:seed
   ```

6. **Lancer le projet**
   Pour lancer le frontend et le backend simultanément :
   ```bash
   npm run dev
   ```

   - **Frontend** : http://localhost:5173
   - **Backend** : http://localhost:4000/graphql

## 🛠 Commandes Utiles

- `npm run dev:frontend` : Lance uniquement le frontend.
- `npm run dev:backend` : Lance uniquement le backend.
- `npm run db:studio` : Ouvre Prisma Studio pour explorer la DB (http://localhost:5555).
