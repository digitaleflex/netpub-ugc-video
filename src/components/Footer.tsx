import React from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedinIn, FaInstagram, FaTiktok, FaFacebookF, FaXTwitter } from 'react-icons/fa6';

const Footer: React.FC = () => {
    return (
        <footer className="app-footer">
            <div className="footer-main-content">
                {/* Colonne 1: Identité */}
                <div className="footer-column footer-identity">
                    <h2 className="footer-logo">Netpub</h2>
                </div>

                {/* Colonne 2: Navigation */}
                <div className="footer-column">
                    <h4 className="column-heading">Navigation</h4>
                    <ul className="footer-links">
                        <li><Link to="/" className="footer-link">Accueil</Link></li>
                        <li><Link to="/about" className="footer-link">À propos</Link></li>
                        <li><Link to="/services" className="footer-link">Services</Link></li>
                        <li><Link to="/portfolio" className="footer-link">Portfolio</Link></li>
                        <li><Link to="/contact" className="footer-link">Contact</Link></li>
                    </ul>
                </div>

                {/* Colonne 3: Réseaux sociaux */}
                <div className="footer-column">
                    <h4 className="column-heading">Réseaux sociaux</h4>
                    <ul className="footer-links">
                        <li><a href="https://ig.me/m/netp_ub?ref=w42213878" className="footer-link">Instagram</a></li>
                        <li><a href="#" className="footer-link">TikTok</a></li>
                        <li><a href="https://m.me/718880621299556?ref=w42216004" className="footer-link">Facebook</a></li>
                        <li><a href="https://www.linkedin.com/in/netpub-agence-58b01b24a" className="footer-link">LinkedIn</a></li>
                    </ul>
                </div>

                {/* Colonne 4: Mentions légales */}
                <div className="footer-column">
                    <h4 className="column-heading">Mentions légales</h4>
                    <ul className="footer-links">
                        <li><Link to="/legal-mentions" className="footer-link">Mentions Légales</Link></li>
                        <li><Link to="/privacy-policy" className="footer-link">Confidentialité & Cookies</Link></li>
                        <li><Link to="/terms-of-service" className="footer-link">Conditions d'utilisation</Link></li>
                    </ul>
                </div>

                {/* Colonne 5: Signature */}
                <div className="footer-column footer-signature">
                    <p className="footer-copyright">© Netpub 2025</p>
                    <p className="footer-tagline">Votre agence vidéo UGC & Spots 4K pour réseaux sociaux.</p>
                    <p className="footer-tagline">Créons ensemble des publicités qui font ressentir, pas juste regarder.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
