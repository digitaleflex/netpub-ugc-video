# Pipeline CI/CD

Le projet utilise (ou devrait utiliser) GitHub Actions pour l'intégration et le déploiement continu.

## 🔄 Workflows GitHub Actions

Les workflows sont définis dans `.github/workflows/`.

### 1. CI (Continuous Integration)
Déclenché sur chaque `push` et `pull_request` vers `main` ou `develop`.

**Étapes typiques :**
1. **Checkout** du code.
2. **Setup Node.js**.
3. **Install dependencies** (`npm ci`).
4. **Lint & Type Check**.
5. **Run Tests** (`npm test`).
6. **Build** (`npm run build`) pour vérifier que la compilation fonctionne.

### 2. CD (Continuous Deployment) - *À configurer*
Déclenché sur un `push` vers la branche `main` (ou via un tag de release).

**Étapes typiques :**
1. **Build Docker Image**.
2. **Push to Registry** (Docker Hub, GHCR, AWS ECR).
3. **Deploy** : Connexion SSH au serveur de production et mise à jour des conteneurs (`docker-compose pull && docker-compose up -d`).

## 🔑 Secrets GitHub

Pour que la CI/CD fonctionne, les secrets suivants doivent être configurés dans le repo GitHub (Settings > Secrets and variables > Actions) :

- `DATABASE_URL` (pour les tests d'intégration si nécessaire)
- `DOCKER_USERNAME` / `DOCKER_PASSWORD` (pour le push d'image)
- `SSH_PRIVATE_KEY` (pour le déploiement)
- `HOST_IP` / `HOST_USER` (infos du serveur)
- Variables d'environnement de production (`JWT_SECRET`, etc.)
