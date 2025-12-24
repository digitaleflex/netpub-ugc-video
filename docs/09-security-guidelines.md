# Directives de Sécurité

## 🔐 Gestion des Secrets

- **Jamais de secrets dans le code.** Utilisez toujours des variables d'environnement.
- **`.env` local** : Ne jamais commiter.
- **Production** : Injectez les secrets via l'orchestrateur (Docker Swarm, K8s, ou fichier `.env` sécurisé sur le serveur).

## 🛡 Authentification & Sessions

- **JWT (JSON Web Tokens)** : Utilisés pour sécuriser l'API GraphQL.
  - Durée de vie courte recommandée (ex: 15min) + Refresh Token.
  - Stockage sécurisé côté client (HttpOnly Cookies recommandés plutôt que LocalStorage pour éviter XSS).
- **Sessions Express** :
  - `SESSION_SECRET` doit être long et aléatoire.
  - Utilisez `secure: true` (HTTPS) et `httpOnly: true` en production.

## 🌐 Sécurité Réseau & HTTP

- **HTTPS** : Obligatoire en production. Utilisez un certificat SSL (Let's Encrypt).
- **CORS** : Restreignez `ALLOWED_ORIGINS` aux domaines de votre frontend uniquement.
- **Helmet** : Utilisez `helmet` dans Express pour définir les en-têtes de sécurité HTTP (HSTS, X-Frame-Options, etc.).
- **Rate Limiting** : Protégez l'API contre les attaques par force brute et DoS.

## 🐳 Sécurité Docker

- Exécutez les conteneurs en tant qu'utilisateur non-root (déjà configuré dans le `Dockerfile`).
- Scannez régulièrement vos images pour des vulnérabilités (ex: `docker scan`).
- Mettez à jour les images de base (`node:20-alpine`, `postgres`) régulièrement.

## 🔎 Audit

- Lancez régulièrement `npm audit` pour vérifier les vulnérabilités des dépendances.
- Mettez à jour les dépendances critiques rapidement.
