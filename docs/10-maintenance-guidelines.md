# Guide de Maintenance

## 📝 Logs et Monitoring

### Logs Applicatifs
L'application envoie ses logs sur la sortie standard (`stdout`/`stderr`).
- En Docker : `docker-compose logs -f app`
- Format recommandé : JSON en production pour faciliter l'ingestion par des outils (ELK, Datadog).

### Monitoring Santé
- **Endpoint Healthcheck** : `GET /health` (retourne 200 OK si le serveur et la DB répondent).
- Utilisez cet endpoint pour configurer les healthchecks Docker ou les sondes de disponibilité (Uptime Robot).

## 💾 Sauvegarde Base de Données

Il est crucial de sauvegarder régulièrement la base PostgreSQL.

### Script de Backup (Exemple)
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
docker exec -t netpub-db pg_dumpall -c -U postgres > /backups/dump_$TIMESTAMP.sql
# Conserver seulement les 7 derniers jours
find /backups -name "dump_*.sql" -mtime +7 -delete
```
*Pensez à exporter ces backups vers un stockage externe (S3, autre serveur).*

## 🔄 Mises à Jour

### Dépendances
1. Vérifier les mises à jour : `npm outdated`
2. Mettre à jour : `npm update`
3. Vérifier que tout fonctionne : `npm test`

### Base de Données (Migrations)
Lors d'un changement de schéma Prisma :
1. En Dev : `npm run db:migrate` (crée une migration).
2. En Prod : La commande de démarrage ou la pipeline CI/CD doit appliquer les migrations (`prisma migrate deploy`).

## 🧹 Nettoyage

- **Docker** : `docker system prune` périodiquement pour libérer de l'espace disque.
- **Uploads** : Si l'application gère des uploads temporaires, prévoir un cron job pour nettoyer les vieux fichiers.
