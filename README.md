# NetPub - Agence Video UGC Production Publicitaire

Bienvenue sur le dépôt officiel de NetPub.

## 📚 Documentation

La documentation complète du projet est disponible dans le dossier [`docs/`](docs/).

Veuillez consulter les guides suivants pour commencer :

- **[Vue d'ensemble](docs/01-overview.md)** : Comprendre le projet.
- **[Installation & Démarrage](docs/03-install-dev.md)** : Configurer votre environnement de développement.
- **[Architecture](docs/02-architecture-diagrams.md)** : Diagrammes techniques.
- **[Déploiement](docs/08-production-deployment.md)** : Mettre en production.

## 🚀 Démarrage Rapide (Dev)

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Lancer la base de données
docker-compose up -d db
npm run db:migrate

# Lancer le projet
npm run dev
```

Pour plus de détails, voir [`docs/03-install-dev.md`](docs/03-install-dev.md).
