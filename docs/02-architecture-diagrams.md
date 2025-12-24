# Architecture du Système

## 🏗 Diagramme Global

L'architecture est composée d'un frontend React (SPA) communiquant avec une API GraphQL Backend. La base de données PostgreSQL stocke les données persistantes.

```mermaid
graph TD
    User[Utilisateur] -->|HTTPS| Frontend[Frontend (React/Vite)]
    Frontend -->|GraphQL Query/Mutation| Backend[Backend API (Node.js/Apollo)]
    Backend -->|Prisma Client| DB[(PostgreSQL Database)]
    Backend -->|SMTP| Email[Service Email (Brevo)]
    Backend -->|API| Gemini[Google Gemini AI]
```

## 🐳 Architecture Docker (Production)

En production, l'application est conteneurisée. Le backend sert l'API et peut servir les fichiers statiques du frontend (selon configuration).

```mermaid
graph LR
    subgraph Docker Network
        App[Container App (Node.js)]
        DB[Container DB (PostgreSQL)]
    end

    Internet -->|Port 4000| App
    App -->|Port 5432| DB
```

## 📂 Structure des Dossiers

- **`backend/`** : Code source du serveur Node.js/Express/GraphQL.
- **`src/`** : Code source du frontend React.
- **`prisma/`** : Schéma de base de données et migrations.
- **`public/`** : Fichiers statiques publics.
- **`types/`** : Définitions TypeScript partagées.
- **`docs/`** : Documentation du projet.

## 🔄 Flux de Données

1. **Authentification** : Le client envoie ses identifiants -> Backend valide et retourne un JWT (ou Cookie Session).
2. **Requête API** : Le client envoie une requête GraphQL avec le token -> Backend vérifie le token -> Exécute le Resolver -> Interroge la DB -> Retourne la réponse JSON.
