import React from 'react';
import "../assets/styles/LegalPages.css";

const TermsOfService: React.FC = () => {
  return (
    <div className="page-container legal-page">
      <header className="article-header text-center">
        <h1>Conditions Générales d'Utilisation</h1>
      </header>
      <div className="content-section">
        <p>Bienvenue sur la plateforme Netpub. En accédant à notre site web et en utilisant nos services, vous acceptez de vous conformer aux présentes conditions d'utilisation. Nous vous invitons à les lire attentivement.</p>

        <h2>Accès et Utilisation</h2>
        <p>Notre plateforme est conçue pour présenter nos réalisations et faciliter l'interaction avec notre agence. L'utilisation de nos services doit se faire dans le respect des lois en vigueur et des droits des tiers. Toute utilisation abusive ou non conforme aux présentes conditions est strictement interdite.</p>

        <h2>Propriété Intellectuelle</h2>
        <p>Tous les contenus présents sur ce site (textes, images, vidéos, logos, marques, etc.) sont la propriété exclusive de Netpub ou de ses partenaires et sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces différents éléments est strictement interdite sans l'accord écrit exprès de Netpub.</p>

        <h2>Contenus Générés par l'Utilisateur (UGC)</h2>
        <p>Lorsque vous soumettez des commentaires ou d'autres contenus sur notre plateforme, vous nous accordez une licence non exclusive, mondiale, libre de redevance, pour utiliser, reproduire, modifier, adapter, publier, traduire, distribuer et afficher ces contenus dans le cadre de nos services. Vous garantissez que vous possédez ou contrôlez tous les droits sur le contenu que vous soumettez et que l'utilisation de votre contenu par Netpub n'enfreint pas les droits d'un tiers. Vos commentaires sont traités de manière confidentielle et ne seront pas partagés publiquement sans votre consentement explicite.</p>

        <h2>Limitation de Responsabilité</h2>
        <p>Netpub s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Cependant, nous ne pouvons garantir l'exhaustivité ou l'absence d'erreurs. L'utilisation des informations et contenus disponibles sur le site se fait sous votre entière responsabilité. Netpub ne pourra être tenue responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site Netpub, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications indiquées, soit de l'apparition d'un bug ou d'une incompatibilité.</p>

        <h2>Modification des Conditions</h2>
        <p>Netpub se réserve le droit de modifier les présentes conditions d'utilisation à tout moment. Les modifications prendront effet dès leur publication sur le site. Il est de votre responsabilité de consulter régulièrement ces conditions pour prendre connaissance des éventuelles modifications.</p>

  <h2>Droit applicable et juridiction</h2>
  <p>Tout litige en relation avec l'utilisation du site Netpub est régi par le droit français. Les tribunaux compétents seront ceux du ressort du siège social de Netpub.</p>
      </div>
    </div>
  );
};

export default TermsOfService;
