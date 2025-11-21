import React from 'react';
import "../assets/styles/LegalPages.css";

const LegalMentions: React.FC = () => {
  return (
    <div className="page-container legal-page">
      <header className="article-header text-center">
        <h1>Mentions Légales</h1>
      </header>
      <div className="content-section">
        <p>Netpub est une agence de production publicitaire et UGC (User Generated Content) dédiée à la création de contenus percutants pour les marques.</p>

        <h2>Propriété intellectuelle</h2>
        <p>Tous les contenus présents sur ce site (textes, images, logos, vidéos) sont protégés par le droit d'auteur et la propriété intellectuelle. Toute reproduction, représentation ou diffusion, totale ou partielle, est interdite sauf autorisation expresse du titulaire des droits.</p>

        <h2>Limitation de responsabilité</h2>
        <p>Netpub met en œuvre des moyens raisonnables pour assurer la disponibilité et l'exactitude des informations. Cependant, Netpub ne peut garantir l'absence d'erreurs, d'interruptions ou de contenus obsolètes. Netpub ne pourra être tenue responsable des dommages directs ou indirects résultant de l'utilisation du site.</p>

        <div className="callout">Les informations institutionnelles ne sont pas affichées publiquement sur cette page. Pour toute démarche administrative, merci d'utiliser le formulaire de contact disponible sur le site.</div>
      </div>
    </div>
  );
};

export default LegalMentions;
