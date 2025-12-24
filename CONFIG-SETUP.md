# Instructions pour pousser le repo de configuration

## 1. Créer le repo GitHub

1. Allez sur https://github.com/digitaleflex
2. Cliquez "New repository"
3. Nom: `netpub-config`
4. **IMPORTANT**: Rendez-le **PRIVÉ** (Private)
5. Ne cochez pas "Add a README" ni ".gitignore"
6. Cliquez "Create repository"

## 2. Pousser la configuration

```bash
# Depuis le dossier racine du projet
cd config
../push-config.sh
```

## 3. Vérifier sur GitHub

- Allez sur https://github.com/digitaleflex/netpub-config
- Vérifiez que tous les fichiers sont présents
- Le repo doit être marqué comme "Private"

## 4. Déploiement sur VPS

Une fois le repo poussé, sur votre VPS:

```bash
# Télécharger et exécuter le script de déploiement
wget https://raw.githubusercontent.com/digitaleflex/netpub-ugc-video/main/deploy.sh
chmod +x deploy.sh
./deploy.sh production
```

## 🔒 Sécurité

- Le repo `netpub-config` contient TOUS les secrets
- Il doit absolument rester **PRIVÉ**
- Ne partagez jamais son contenu
- Utilisez des clés SSH pour l'accès si possible