import React, { useState } from 'react';
import './dashboard.css';

interface MisunderstoodIntention {
  id: string;
  phrase: string;
  detectedIntent: string;
  correctIntent: string;
  suggestedResponse: string;
  corrected: boolean;
}

const mockMisunderstoodIntentions: MisunderstoodIntention[] = [
  {
    id: 'int-1',
    phrase: 'Je veux savoir le prix de vos vidéos',
    detectedIntent: 'Demander un rendez-vous',
    correctIntent: 'Demander les tarifs',
    suggestedResponse: 'Nos tarifs sont disponibles sur la page Services.',
    corrected: false,
  },
  {
    id: 'int-2',
    phrase: 'Faites-vous des pubs pour Instagram ?',
    detectedIntent: 'Question générale',
    correctIntent: 'Services spécifiques',
    suggestedResponse: 'Oui, nous créons des publicités adaptées à Instagram.',
    corrected: false,
  },
  {
    id: 'int-3',
    phrase: 'Comment je peux commander un UGC ?',
    detectedIntent: 'Passer une commande',
    correctIntent: 'Processus de commande UGC',
    suggestedResponse: 'Vous pouvez commander un UGC via notre page de commande.',
    corrected: true,
  },
];

const Learning: React.FC = () => {
  const [intentions, setIntentions] = useState<MisunderstoodIntention[]>(mockMisunderstoodIntentions);
  const [retraining, setRetraining] = useState(false);

  const handleCorrect = (id: string) => {
    setIntentions(prev => prev.map(intent => 
      intent.id === id ? { ...intent, corrected: true } : intent
    ));
  };

  const handleRetrain = () => {
    setRetraining(true);
    setTimeout(() => {
      setRetraining(false);
      alert('Bot successfully retrained!');
    }, 3000);
  };

  return (
    <div className="dashboard-section learning-view">
      <h1>Chatbot Learning & Training</h1>
      <p>Help your chatbot improve by reviewing and correcting misunderstood intentions.</p>

      <div className="learning-grid">
        <div className="misunderstood-intentions-panel widget">
          <h2>Intentions mal comprises</h2>
          <ul className="intention-list">
            {intentions.map(intent => (
              <li key={intent.id} className={`intention-item ${intent.corrected ? 'corrected' : ''}`}>
                <div className="intention-phrase">
                  <strong>Phrase:</strong> "{intent.phrase}"
                </div>
                <div className="intention-details">
                  <p>Détecté: <span className="detected-intent">{intent.detectedIntent}</span></p>
                  <p>Correct: <span className="correct-intent">{intent.correctIntent}</span></p>
                  <p>Réponse suggérée: <em>"{intent.suggestedResponse}"</em></p>
                </div>
                {!intent.corrected && (
                  <button onClick={() => handleCorrect(intent.id)} className="correct-button">
                    Corriger
                  </button>
                )}
                {intent.corrected && <span className="corrected-badge">✅ Corrigé</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="retrain-bot-panel widget">
          <h2>Réentraîner le bot</h2>
          <p>Après avoir corrigé les intentions, réentraînez le bot pour qu'il apprenne de vos modifications.</p>
          <button onClick={handleRetrain} disabled={retraining} className="retrain-button">
            {retraining ? (
              <span className="loader"></span>
            ) : (
              'Réentraîner le bot'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Learning;
