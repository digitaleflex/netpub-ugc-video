# Exécution du Projet

## 💻 En Développement (Local)

Pour lancer l'environnement complet de développement (Frontend + Backend) avec rechargement à chaud (HMR) :

```bash
npm run dev
```

La commande utilise `concurrently` pour exécuter :
1. **Frontend (Vite)** sur `http://localhost:5173`
2. **Backend (Nodemon/ts-node)** sur `http://localhost:4000`

### Dépannage Développement

- **Erreur de connexion DB** : Assurez-vous que le conteneur Docker `db` est lancé (`docker-compose up -d db`).
- **Port déjà utilisé** : Vérifiez qu'aucun autre processus n'utilise les ports 4000 ou 5173 (`lsof -i :4000`).

## 🐳 En Production (Docker)

L'application est conçue pour être exécutée via Docker en production. Le `docker-compose.yml` fourni configure l'application et la base de données.

### Lancer avec Docker Compose

```bash
docker-compose up -d --build
```

Cela va :
1. Construire l'image de l'application (multi-stage build).
2. Lancer le conteneur PostgreSQL (`db`).
3. Lancer le conteneur de l'application (`app`).

L'application sera accessible sur `http://localhost:4000`.

### Gestion des Conteneurs

- **Arrêter** : `docker-compose down`
- **Voir les logs** : `docker-compose logs -f`
- **Redémarrer** : `docker-compose restart app`

### Note sur l'Architecture Docker

Le conteneur `app` exécute le serveur Node.js backend.
Le build Frontend est copié dans le dossier `dist/` à l'intérieur de l'image.
*Note : Vérifiez la configuration du serveur (`server.ts`) pour vous assurer que les fichiers statiques du frontend sont bien servis en production, ou configurez un reverse-proxy (Nginx) en amont pour servir `/` vers le frontend et `/graphql` vers le backend.*
