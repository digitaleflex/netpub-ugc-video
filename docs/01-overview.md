# Vue d'ensemble du Projet (Overview)

## 🎯 Objectif du Projet

**NetPub Agence Video UGC Production Publicitaire** est une plateforme dédiée à la mise en relation entre créateurs de contenu UGC (User Generated Content) et marques souhaitant produire des publicités authentiques.

L'objectif est de simplifier le workflow de production vidéo, de la commande à la livraison, en passant par la validation et le paiement.

## 🛠 Stack Technique

Le projet repose sur une architecture moderne et performante :

### Frontend
- **Framework** : React 19 (via Vite)
- **Langage** : TypeScript
- **Styling** : TailwindCSS (supposé), CSS Modules ou équivalent
- **State Management** : Context API / Hooks
- **Communication API** : Apollo Client (GraphQL)

### Backend
- **Runtime** : Node.js (v20+)
- **Framework** : Express.js
- **API** : GraphQL (Apollo Server)
- **Base de Données** : PostgreSQL 15+
- **ORM** : Prisma
- **Authentification** : JWT, express-session, bcryptjs

### Infrastructure & DevOps
- **Conteneurisation** : Docker, Docker Compose
- **CI/CD** : GitHub Actions (supposé)
- **Reverse Proxy** : Nginx (en prod, optionnel)

## 👥 Personas Utilisateurs

1. **Créateur de Contenu (UGC Creator)**
   - S'inscrit et complète son profil.
   - Postule aux offres de missions.
   - Soumet ses vidéos pour validation.
   - Reçoit ses paiements.

2. **Marque / Client**
   - Crée des campagnes publicitaires.
   - Sélectionne des créateurs.
   - Valide les contenus produits.
   - Gère la facturation.

3. **Administrateur (NetPub Staff)**
   - Valide les inscriptions.
   - Modère les contenus.
   - Gère les litiges et la plateforme globale.
