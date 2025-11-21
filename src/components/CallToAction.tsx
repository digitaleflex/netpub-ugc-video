import React from 'react';
import { Link } from 'react-router-dom';
import { useChatbot } from '../contexts/ChatbotContext'; // Import useChatbot

const CallToAction: React.FC = () => {
    const { openChatbot } = useChatbot(); // Get openChatbot from context

    return (
        <section className="shared-cta-section">
            <div className="shared-cta-content">
                <h2>Prêts à donner vie à votre marque ?</h2>
                <p>Nos créateurs transforment vos idées en émotions.</p>
                <button onClick={openChatbot} className="cta-button">Parlons-en</button>
            </div>
        </section>
    );
};

export default CallToAction;
