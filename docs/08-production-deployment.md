# Déploiement en Production

## 📦 Stratégie de Déploiement

La stratégie recommandée repose sur **Docker** pour garantir la cohérence entre les environnements.

### Prérequis Serveur
- Un serveur Linux (Ubuntu/Debian recommandé).
- **Docker** et **Docker Compose** installés.
- Un nom de domaine configuré (DNS A Record pointant vers l'IP du serveur).

## 🚀 Procédure de Déploiement Manuelle

1. **Préparer le serveur**
   Créer un dossier pour le projet :
   ```bash
   mkdir -p /opt/netpub-app
   cd /opt/netpub-app
   ```

2. **Transférer les fichiers nécessaires**
   Vous avez besoin du `docker-compose.yml` et d'un fichier `.env` de production.
   ```bash
   scp docker-compose.yml user@server:/opt/netpub-app/
   # Créer le .env sur place
   nano .env
   ```

3. **Lancer l'application**
   Si vous utilisez une image pré-construite (recommandé) :
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
   Si vous buildez sur le serveur (moins recommandé) :
   ```bash
   docker-compose up -d --build
   ```

## 🔄 Mise à jour (Rollout)

Pour mettre à jour l'application :
1. `docker-compose pull` (récupérer la dernière image)
2. `docker-compose up -d` (recréer les conteneurs avec la nouvelle image)
3. `docker image prune -f` (nettoyer les anciennes images)

## 🔙 Rollback

En cas de problème critique :
1. Modifiez le `docker-compose.yml` pour pointer vers le tag de l'image précédente (ex: `image: myapp:v1.2`).
2. `docker-compose up -d`.

## 🛡 Reverse Proxy (Nginx/Traefik)

Il est fortement recommandé de ne pas exposer le port 4000 directement. Utilisez un reverse proxy pour :
- Gérer le SSL/HTTPS (Let's Encrypt).
- Rediriger le port 80/443 vers le port 4000 du conteneur.
- Servir les fichiers statiques (si non géré par Node).
