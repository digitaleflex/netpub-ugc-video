# Tests et Qualité

Le projet utilise **Jest** comme framework de test principal.

## 🧪 Lancer les Tests

### Tous les tests
Pour exécuter l'ensemble de la suite de tests :

```bash
npm test
```

### Mode Watch
Pour relancer les tests automatiquement à chaque modification de fichier :

```bash
npm run test:watch
```

### Couverture de Code (Coverage)
Pour générer un rapport de couverture :

```bash
npm run test:coverage
```
Le rapport sera généré dans le dossier `coverage/`. Vous pouvez ouvrir `coverage/lcov-report/index.html` pour visualiser les résultats.

## 🏗 Types de Tests

### Tests Unitaires
Situés généralement à côté du code source ou dans `__tests__`. Ils testent des fonctions isolées (utilitaires, hooks, resolvers simples).

### Tests d'Intégration
Testent la collaboration entre plusieurs modules (ex: un resolver GraphQL et la base de données).
*Note : Pour les tests impliquant la base de données, assurez-vous d'avoir une DB de test configurée ou utilisez des mocks.*

## ✅ Linting et Formatage

Le projet utilise probablement ESLint et Prettier (vérifier `package.json`).

- **Linter** : `npm run lint` (si disponible)
- **Type Check** : `npx tsc --noEmit` pour vérifier les types TypeScript sans compiler.
