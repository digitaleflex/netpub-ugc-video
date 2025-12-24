# Best Practices & Conventions

## 📝 Conventions de Code

### Général
- **Anglais** : Code, commentaires et commits en anglais (sauf documentation spécifique utilisateur).
- **Clean Code** : Fonctions courtes, noms de variables explicites.
- **DRY (Don't Repeat Yourself)** : Extrayez la logique réutilisable.

### Frontend (React)
- **Composants Fonctionnels** : Utilisez exclusivement des hooks.
- **Structure** : Un dossier par feature ou par type (components, pages, hooks, contexts).
- **CSS** : Préférez CSS Modules ou Tailwind pour éviter les conflits globaux.

### Backend (Node/GraphQL)
- **Resolvers** : Gardez-les légers. Déplacez la logique métier dans des services ou des modèles.
- **Erreurs** : Utilisez des classes d'erreurs personnalisées et catchez-les proprement.
- **Async/Await** : Préférez `async/await` aux Promises brutes (.then).

## 🗂 Gestion de Git

### Branches
- `main` : Code de production stable.
- `develop` (optionnel) : Branche d'intégration.
- `feature/ma-feature` : Pour les nouvelles fonctionnalités.
- `fix/mon-bug` : Pour les corrections.

### Commits
Utilisez la convention **Conventional Commits** :
- `feat: add user login`
- `fix: resolve issue with payment`
- `docs: update readme`
- `chore: update dependencies`

## 🔒 Sécurité dans le Code

- **Validation** : Validez TOUTES les entrées utilisateurs (Zod, Joi).
- **Sanitization** : Échappez les sorties pour éviter XSS (React le fait par défaut, attention à `dangerouslySetInnerHTML`).
- **SQL Injection** : Prisma protège par défaut, mais attention aux requêtes brutes (`$queryRaw`).
