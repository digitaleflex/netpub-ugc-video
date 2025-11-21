import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ThankYouModal.module.css';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  clientEmail: string;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({ isOpen, onClose, clientName, clientEmail }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} ${styles.thankYouModal}`} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalCloseButton} onClick={onClose}>&times;</button>
        <div className={styles.thankYouHeader}>
          <div className={styles.thankYouIcon}>🎉</div>
          <h1>Merci {clientName}!</h1>
        </div>
        <div className={styles.thankYouBody}>
          <p className={styles.lead}>Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.</p>
          <div className={styles.thankYouDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📧</span>
              <span>Un email de confirmation vous a été envoyé à <strong>{clientEmail}</strong></span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>⏰</span>
              <span>Réponse sous 24h ouvrées</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📞</span>
              <span>
                Contact :<br />
                Europe: +33 7 65 87 17 49<br />
                Afrique: +229 01 54 10 21 25
              </span>
            </div>
          </div>
        </div>
        <div className={styles.thankYouActions}>
          <Link to="/" className={styles.ctaButtonPrimary} onClick={onClose}>Retour à l'accueil</Link>
          <Link to="/portfolio" className={styles.ctaButtonSecondary} onClick={onClose}>Voir notre portfolio</Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal;