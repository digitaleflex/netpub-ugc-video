#!/bin/bash

# NetPub UGC Video - Deployment Script
# Usage: ./deploy.sh [environment]
# Environment: production (default), staging

set -e

ENVIRONMENT=${1:-production}
CONFIG_REPO="https://github.com/digitaleflex/netpub-config.git"
APP_IMAGE="eflexcloud/netpub-ugc-video:v1.1.0"

echo "🚀 Déploiement NetPub UGC Video - $ENVIRONMENT"
echo "==============================================="

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Créer le réseau proxy si nécessaire
echo "🔧 Vérification du réseau proxy..."
docker network create proxy 2>/dev/null || echo "✅ Réseau proxy existe déjà"

# Cloner/Mettre à jour le repo config
if [ ! -d "netpub-config" ]; then
    echo "📥 Clonage du repo de configuration..."
    git clone $CONFIG_REPO netpub-config
else
    echo "🔄 Mise à jour du repo de configuration..."
    cd netpub-config
    git pull
    cd ..
fi

# Aller dans le dossier config
cd netpub-config

# Créer les dossiers nécessaires
echo "📁 Création des dossiers..."
mkdir -p uploads logs

# Sélectionner l'environnement
if [ "$ENVIRONMENT" = "staging" ]; then
    ENV_FILE=".env.staging"
    echo "🏗️  Déploiement en STAGING"
else
    ENV_FILE=".env.production"
    echo "🏗️  Déploiement en PRODUCTION"
fi

# Copier le fichier env approprié
cp $ENV_FILE .env

# Pull de la dernière image
echo "🐳 Pull de l'image Docker..."
docker pull $APP_IMAGE

# Lancer l'application
echo "🚀 Démarrage de l'application..."
docker-compose up -d

# Attendre que l'app soit prête
echo "⏳ Attente du démarrage..."
sleep 10

# Vérifier le statut
echo "✅ Vérification du déploiement..."
docker-compose ps

if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "🎉 Déploiement réussi !"
    echo "🌐 Application accessible sur https://netpub.eurinhash.com"
    echo ""
    echo "📊 Commandes utiles :"
    echo "  - Logs: docker-compose logs -f app"
    echo "  - Stop: docker-compose down"
    echo "  - Restart: docker-compose restart"
else
    echo "❌ Échec du déploiement. Vérifiez les logs:"
    docker-compose logs app
    exit 1
fi