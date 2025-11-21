import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import useOnScreen from '../hooks/useOnScreen';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { useChatbot } from '../contexts/ChatbotContext'; // Import useChatbot
import ThankYouModal from '../components/ThankYouModal'; // Import the new modal component
import SEO from '../components/SEO';
import { fetchCsrfToken } from '../utils/csrf';

const GRAPHQL_ENDPOINT = '/graphql'; // Assuming your GraphQL endpoint is /graphql

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false); // To show the modal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactFormRef = useRef<HTMLDivElement>(null);
  const isContactFormVisible = useOnScreen(contactFormRef as React.RefObject<HTMLElement>, { threshold: 0.1 });

  const directInfoRef = useRef<HTMLDivElement>(null);
  const isDirectInfoVisible = useOnScreen(directInfoRef as React.RefObject<HTMLElement>, { threshold: 0.1 });

  const socialMarqueeRef = useRef<HTMLDivElement>(null);
  const isSocialMarqueeVisible = useOnScreen(socialMarqueeRef as React.RefObject<HTMLElement>, { threshold: 0.1 });

  const contactFooterRef = useRef<HTMLDivElement>(null);
  const isContactFooterVisible = useOnScreen(contactFooterRef as React.RefObject<HTMLElement>, { threshold: 0.1 });

  const socialLinks = [
    {
      icon: <FaInstagram />,
      name: 'Instagram',
      url: 'https://ig.me/m/netp_ub?ref=w42213878'
    },
    {
      icon: <FaTiktok />,
      name: 'TikTok',
      url: '#' // Keep existing TikTok link if no new one provided
    },
    {
      icon: <FaYoutube />,
      name: 'YouTube',
      url: '#' // Keep existing YouTube link if no new one provided
    },
    {
      icon: <FaLinkedin />,
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/netpub-agence-58b01b24a'
    },
    {
      icon: <FaFacebook />,
      name: 'Facebook',
      url: 'https://m.me/718880621299556?ref=w42216004'
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      company: '',
      service: '',
      message: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const csrf = await fetchCsrfToken();
      if (!csrf) {
        throw new Error('CSRF token not available');
      }

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf,
        },
        body: JSON.stringify({
          query: `
            mutation SendContactMessage($name: String!, $email: String!, $company: String, $service: String, $message: String!) {
              sendContactMessage(name: $name, email: $email, company: $company, service: $service, message: $message)
            }
          `,
          variables: formData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.data && result.data.sendContactMessage) {
        setSubmitted(true);
      } else {
        console.error('Error sending contact message:', result.errors);
        setError(result.errors ? result.errors[0].message : 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Erreur lors de la soumission du formulaire:', err);
      setError('Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const contactDetails = [
    {
      icon: FiPhone,
      label: 'Appelez-nous (Europe)',
      value: '+33 7 65 87 17 49',
      href: 'tel:+33765871749',
    },
    {
      icon: FiPhone,
      label: 'Appelez-nous (Afrique)',
      value: '+229 01 54 10 21 25',
      href: 'tel:+2290154102125',
    },
    {
      icon: FiMail,
      label: 'Écrivez-nous',
      value: 'hello@netpub.agency',
      href: 'mailto:hello@netpub.agency',
    },
    {
      icon: FiMapPin,
      label: 'Basés à',
      value: 'Paris & Cotonou',
    },
    {
      icon: FiClock,
      label: 'Disponibles',
      value: 'Lun – Sam, 9h → 19h',
    },
  ];

  const { openChatbot } = useChatbot(); // Get openChatbot from context

  return (
    <div className="page-container contact-page">
      <SEO 
        title="Contactez-Nous - Démarrons Votre Projet Vidéo"
        description="Contactez l\'agence NetPub pour discuter de votre projet de vidéo UGC ou publicitaire. Remplissez notre formulaire, appelez-nous, ou utilisez notre chatbot pour une réponse immédiate."
        keywords="contact, devis, collaboration, projet vidéo, agence UGC, nous contacter, netpub"
      />

      {/* Section Hero - On crée ensemble ? */}
      <section className="contact-hero-section">
        <video className="contact-hero-video-bg" src="/grok-video-badaba1c-f52f-423e-b1ec-fc1c29427aa1 (1).mp4" autoPlay loop muted playsInline></video>
        <div className="contact-hero-content text-center">
          <h1 className="contact-hero-title">Un projet. Une idée. Une vision ? Parlons-en.</h1>
          <p className="contact-hero-subtitle">Remplissez le formulaire ou contactez-nous directement — on adore les nouveaux défis.</p>
          <Link to="#contact-form-section" className="cta-button contact-hero-cta">Lancer une collaboration</Link>
        </div>
      </section>

      <div className="contact-form-and-info-wrapper">
        {/* Section Formulaire de Contact */}
        <section id="contact-form-section" ref={contactFormRef} className={`contact-form-section fade-up-section ${isContactFormVisible ? 'is-visible' : ''}`}>
          <div className="contact-form-card">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Votre nom, parce qu’on aime savoir à qui on parle…" />
              </div>
              <div className="form-group">
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Un mail pour vous répondre (promis, pas de spam)" />
              </div>
              <div className="form-group">
                <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Votre entreprise (optionnel)" />
              </div>
              <div className="form-group">
                <select id="service" name="service" value={formData.service} onChange={handleChange}>
                  <option value="">Quel service vous intéresse ?</option>
                  <option value="UGC">Vidéos UGC</option>
                  <option value="Publicités émotionnelles">Publicités émotionnelles</option>
                  <option value="Storytelling & Scénarisation">Storytelling & Scénarisation</option>
                  <option value="Montage & Optimisation Ads">Montage & Optimisation Ads</option>
                  <option value="Design sonore & voix-off émotionnelle">Design sonore & voix-off émotionnelle</option>
                  <option value="Branding & Identité visuelle">Branding & Identité visuelle</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="Parlez-nous de votre projet, de vos rêves, de vos défis…"></textarea>
              </div>
              <button type="submit" className="cta-button" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
        </section>

        {/* Section Informations Directes */}
        <section ref={directInfoRef} className={`direct-info-section fade-up-section ${isDirectInfoVisible ? 'is-visible' : ''}`}>
          <div className="direct-info-card">
            <h3 className="text-3xl font-bold mb-8 text-slate-900">Besoin d'une réponse immédiate ?</h3>
            <p className="text-md text-gray-600 mb-4">Notre assistant virtuel est là pour vous aider 24h/24 et 7j/7. Posez-lui vos questions sur nos services, nos tarifs ou pour toute autre information.</p>
            <button onClick={openChatbot} className="cta-button-secondary inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-full shadow-sm text-blue-600 bg-blue-50 hover:bg-blue-100">
              Discuter avec notre Chatbot
            </button>
          </div>
        </section>
      </div>

      {/* Section Réseaux sociaux (bande dynamique) */}
      <section ref={socialMarqueeRef} className={`social-marquee-section bg-gray-900 text-white py-8 fade-up-section ${isSocialMarqueeVisible ? 'is-visible' : ''}`}>
        <div className="social-marquee-track">
            {socialLinks.map((social, index) => (
              <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="social-marquee-item">
                {social.icon}
                <span className="ml-2">{social.name}</span>
              </a>
            ))}
            {socialLinks.map((social, index) => (
              <a key={index + socialLinks.length} href={social.url} target="_blank" rel="noopener noreferrer" className="social-marquee-item" aria-hidden="true">
                {social.icon}
                <span className="ml-2">{social.name}</span>
              </a>
            ))}
        </div>
      </section>

      {/* Section Footer “Let’s Create Magic.” */}
      <section ref={contactFooterRef} className={`contact-footer-section text-center fade-up-section ${isContactFooterVisible ? 'is-visible' : ''}`}>
        <h2 className="contact-footer-title">Les grandes idées naissent toujours d’une première conversation.</h2>
        <p className="contact-footer-subtitle">Contactez-nous, et donnons vie à la vôtre.</p>
        <button onClick={openChatbot} className="cta-button contact-footer-cta">Contactez-nous directement</button>
      </section>

      <ThankYouModal
        isOpen={submitted}
        onClose={handleCloseModal}
        clientName={formData.name}
        clientEmail={formData.email}
      />
    </div>
  );
};

export default Contact;










