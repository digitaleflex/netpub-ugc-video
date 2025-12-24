#!/bin/bash

# Script pour pousser le repo de configuration vers GitHub
# Usage: ./push-config.sh

set -e

echo "🚀 Push du repo de configuration vers GitHub"
echo "============================================="

# Vérifier qu'on est dans le bon dossier
if [ ! -f "docker-compose.yml" ] || [ ! -f ".env.production" ]; then
    echo "❌ Erreur: exécutez ce script depuis le dossier config/"
    echo "Usage: cd config && ../push-config.sh"
    exit 1
fi

# Ajouter le remote si pas déjà présent
if ! git remote get-url origin &>/dev/null; then
    echo "🔗 Ajout du remote origin..."
    git remote add origin https://github.com/digitaleflex/netpub-config.git
fi

# Pousser vers GitHub
echo "📤 Push vers GitHub..."
git push -u origin main

echo ""
echo "✅ Repo de configuration poussé avec succès !"
echo "🔒 Pensez à rendre le repo PRIVÉ sur GitHub"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Allez sur https://github.com/digitaleflex/netpub-config"
echo "2. Settings > Danger Zone > Make private"
echo "3. Le repo est prêt pour le déploiement"