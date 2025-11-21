import React from 'react';
import "../assets/styles/LegalPages.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="page-container legal-page">
      <header className="article-header text-center">
        <h1>Politique de Confidentialité & Cookies</h1>
      </header>
      <div className="content-section">
        <p>Chez Netpub, la protection de vos données personnelles est une priorité. Cette politique explique comment nous collectons, traitons et protégeons les informations que vous nous confiez lors de l'utilisation de nos services.</p>

        <h2>Collecte des données</h2>
        <p>Nous collectons uniquement les données nécessaires au bon fonctionnement du service (par exemple : informations de contact, contenus partagés volontairement, et données techniques anonymisées pour les statistiques). Ces données servent à fournir et améliorer nos services.</p>

        <h2>Utilisation des données</h2>
        <p>Les données collectées sont utilisées pour : la fourniture du service, l'amélioration produit, la sécurité et la relation client. Elles sont accessibles aux équipes internes dans un cadre strict et sécurisé.</p>

        <h2>Confidentialité et non-partage</h2>
        <p>Nous ne vendons pas vos données personnelles. Elles ne sont pas partagées à des tiers à des fins commerciales sans votre consentement. Des prestataires tiers peuvent intervenir pour l'hébergement ou les services techniques, sous contrat garantissant la confidentialité.</p>

        <h2>Cookies</h2>
        <p>Le site utilise des cookies nécessaires au fonctionnement et des cookies optionnels pour l'analyse et l'amélioration du service. Vous pouvez gérer vos préférences via votre navigateur ou les outils proposés par le site.</p>

        <h2>Vos droits</h2>
        <p>Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification, de suppression, de limitation et d'opposition sur vos données personnelles. Pour exercer vos droits, merci d'utiliser le formulaire de contact disponible sur le site.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
