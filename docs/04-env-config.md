# Configuration et Variables d'Environnement

Le projet utilise un fichier `.env` à la racine pour gérer la configuration sensible et spécifique à l'environnement.

## 📄 Fichier `.env`

Créez un fichier `.env` basé sur `.env.example`.

### Variables Critiques

| Variable | Description | Exemple / Valeur par défaut |
|----------|-------------|-----------------------------|
| `NODE_ENV` | Environnement (development, production) | `development` |
| `PORT` | Port du serveur backend | `4000` |
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Clé secrète pour signer les tokens JWT | `une-chaine-tres-secrete-et-longue` |
| `SESSION_SECRET` | Clé pour signer les sessions express | `autre-chaine-secrete` |

### Services Tiers (Email, AI, etc.)

| Variable | Description |
|----------|-------------|
| `BREVO_SMTP_HOST` | Hôte SMTP pour l'envoi d'emails |
| `BREVO_SMTP_PORT` | Port SMTP (ex: 587) |
| `BREVO_SMTP_USER` | Utilisateur SMTP |
| `BREVO_SMTP_PASS` | Mot de passe SMTP |
| `GEMINI_API_KEY` | Clé API pour Google Gemini (IA) |
| `ADMIN_EMAIL` | Email de l'administrateur initial |
| `ADMIN_PASSWORD` | Mot de passe de l'administrateur initial |

### Configuration CORS

| Variable | Description |
|----------|-------------|
| `ALLOWED_ORIGINS` | Liste des origines autorisées (CORS), séparées par des virgules |

## ⚠️ Sécurité

- **Ne committez jamais le fichier `.env`** (il est ignoré par `.gitignore`).
- En production, assurez-vous de générer des secrets forts pour `JWT_SECRET` et `SESSION_SECRET`.
- Utilisez des variables d'environnement système ou des gestionnaires de secrets dans votre infrastructure de déploiement (ex: GitHub Secrets, Docker Secrets).
