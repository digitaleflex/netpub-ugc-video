import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, FunctionDeclaration, Type, Modality } from '@google/genai';
import { ChatMessage, PortfolioCategory } from '../types';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { useChatbot } from '../contexts/ChatbotContext'; // Import the context hook
import { NotificationService } from '../lib/notifications';
import { fetchCsrfToken } from '../utils/csrf';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const prendreRendezVous: FunctionDeclaration = {
    name: 'prendreRendezVous',
    description: "Prendre un rendez-vous pour un service spécifique à une date et une heure données.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            service: {
                type: Type.STRING,
                description: `Le service qui intéresse le client. Doit être l'une des options suivantes : '${PortfolioCategory.VIDEO_UGC}' ou '${PortfolioCategory.VIDEO_SPOT_PUBLICITAIRE}'.`,
            },
            date: {
                type: Type.STRING,
                description: "La date souhaitée pour le rendez-vous, au format 'JJ/MM/AAAA' ou une description textuelle comme 'demain' ou 'mardi prochain'.",
            },
            heure: {
                type: Type.STRING,
                description: "L'heure souhaitée pour le rendez-vous, au format 'HH:MM' ou une description textuelle comme 'l'après-midi' ou '15h'.",
            },
        },
        required: ['service', 'date', 'heure'],
    },
};

const passerCommande: FunctionDeclaration = {
    name: 'passerCommande',
    description: "Passer une commande pour un service spécifique avec des détails additionnels.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            service: {
                type: Type.STRING,
                description: `Le service que le client souhaite commander. Doit être l'une des options suivantes : '${PortfolioCategory.VIDEO_UGC}' ou '${PortfolioCategory.VIDEO_SPOT_PUBLICITAIRE}'.`,
            },
            details: {
                type: Type.STRING,
                description: "Un bref résumé des besoins ou des détails spécifiques pour la commande.",
            },
        },
        required: ['service', 'details'],
    },
};

const collecterInfosClient: FunctionDeclaration = {
    name: 'collecterInfosClient',
    description: "Collecter les informations du client pour le contacter. Tous les paramètres sont optionnels pour permettre une collecte progressive.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            nom: {
                type: Type.STRING,
                description: "Le nom complet du client.",
            },
            prenom: {
                type: Type.STRING,
                description: "Le prénom du client.",
            },
            telephone: {
                type: Type.STRING,
                description: "Le numéro de téléphone du client.",
            },
            telephoneEurope: {
                type: Type.STRING,
                description: "Le numéro de téléphone européen du client (optionnel, pour les clients européens).",
            },
            email: {
                type: Type.STRING,
                description: "L'adresse email du client.",
            },
            besoin: {
                type: Type.STRING,
                description: "Le besoin ou projet du client.",
            },
        },
        // Removed 'required' array
    },
};

const collecterFeedbackSite: FunctionDeclaration = {
    name: 'collecterFeedbackSite',
    description: "Collecter le feedback du client sur comment il a trouvé le site.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            feedback: {
                type: Type.STRING,
                description: "Comment le client a trouvé le site (ex: Google, réseaux sociaux, bouche-à-oreille, etc.).",
            },
        },
        required: ['feedback'],
    },
};


const Chatbot: React.FC = () => {
    const { isOpen, toggleChatbot, closeChatbot } = useChatbot(); // Use context
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [userInfoCollected, setUserInfoCollected] = useState(false);
    const [feedbackCollected, setFeedbackCollected] = useState(false);
    const [recognitionError, setRecognitionError] = useState<string | null>(null);

    const aiRef = useRef<GoogleGenAI | null>(null);
    const recognitionRef = useRef<any | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const API_KEY = (import.meta as any).env.VITE_API_KEY;
    const GRAPHQL_ENDPOINT = '/graphql';

    // Notification logic removed for now, can be re-added if needed via context

    const speakText = async (text: string) => {
        if (!aiRef.current || !audioContextRef.current || !text) return;
        try {
            const response = await aiRef.current.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (typeof base64Audio === 'string' && base64Audio) {
                try {
                    const audioBuffer = await decodeAudioData(
                        base64Audio,
                        audioContextRef.current
                    );
                    const source = audioContextRef.current.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContextRef.current.destination);
                    source.start();
                } catch (decodeError) {
                    // silent fail
                }
            }
        } catch (error) {
            // silent fail
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (!aiRef.current) {
                if (!API_KEY) {
                    // silent fail
                } else {
                    aiRef.current = new GoogleGenAI({ apiKey: API_KEY as string });
                }
            }
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (messages.length === 0) {
                const initialMessageText = API_KEY
                    ? "Bonjour 😊 Je suis Naïla, l'assistante virtuelle de Netpub. Pour commencer, comment puis-je vous appeler ?"
                    : "Désolé, le chatbot n'est pas entièrement configuré (clé API manquante). Je ne peux pas répondre pour le moment.";
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    role: 'model',
                    text: initialMessageText,
                    type: 'text',
                }]);
                // if (API_KEY) {
                //     speakText(initialMessageText);
                // }

                // Create conversation record
                createConversation();
            }

            // Écouter les événements de contexte des plans
            const handleChatbotContext = (event: any) => {
                const { plan, message } = event.detail;
                if (message) {
                    handleSendMessage(null, message);
                }
            };

            window.addEventListener('chatbotContext', handleChatbotContext);

            return () => {
                window.removeEventListener('chatbotContext', handleChatbotContext);
            };
        } else {
            // Reset messages when chatbot closes
            setMessages([]);
            setConversationId(null);
            setUserInfoCollected(false);
            setFeedbackCollected(false);
        }
    }, [isOpen, API_KEY]);

    const saveChatMessageToDb = async (sender: string, text: string) => {
        if (!conversationId) return;
        try {
            const csrf = await fetchCsrfToken();
            if (!csrf) return;

            await fetch(GRAPHQL_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrf,
                },
                body: JSON.stringify({
                    query: `
                        mutation AddChatMessage($conversationId: ID!, $sender: String!, $text: String!) {
                            addChatMessage(conversationId: $conversationId, sender: $sender, text: $text) {
                                id
                            }
                        }
                    `,
                    variables: {
                        conversationId,
                        sender,
                        text,
                    },
                }),
            });
        } catch (error) {
            console.error('Failed to save message to DB:', error);
        }
    };

    const createConversation = async () => {
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
                        mutation CreateConversation {
                            createConversation {
                                id
                            }
                        }
                    `,
                }),
            });
            const result = await response.json();
            if (result.data && result.data.createConversation) {
                const conversation = result.data.createConversation;
                setConversationId(conversation.id);

                // SAVE INITIAL GREETING NOW THAT WE HAVE ID
                const initialGreeting = API_KEY
                    ? "Bonjour 😊 Je suis Naïla, l'assistante virtuelle de Netpub. Pour commencer, comment puis-je vous appeler ?"
                    : "Désolé, le chatbot n'est pas entièrement configuré (clé API manquante). Je ne peux pas répondre pour le moment.";

                // We need to wait for state to update or use the local id
                const useId = conversation.id;
                await fetch(GRAPHQL_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
                    body: JSON.stringify({
                        query: `mutation AddChatMessage($conversationId: ID!, $sender: String!, $text: String!) {
                            addChatMessage(conversationId: $conversationId, sender: $sender, text: $text) { id }
                        }`,
                        variables: { conversationId: useId, sender: 'model', text: initialGreeting }
                    }),
                });

                NotificationService.notifyNewConversation({
                    id: conversation.id,
                    userName: conversation.userName,
                    userId: conversation.userId
                });
            }
        } catch (error) {
            // silent fail
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setRecognitionError("Votre navigateur ne supporte pas la reconnaissance vocale. Veuillez utiliser Chrome ou Edge.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false; // Stop after one sentence
            recognition.lang = 'fr-FR';
            recognition.interimResults = false;

            recognition.onstart = () => {
                setIsRecording(true);
                setRecognitionError(null);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                if (transcript.trim()) {
                    handleSendMessage(null, transcript);
                }
            };

            recognition.onerror = (event: any) => {
                let errorMessage = 'Une erreur est survenue avec la reconnaissance vocale.';
                if (event.error === 'not-allowed') {
                    errorMessage = "L'accès au microphone a été refusé. Veuillez l'autoriser dans les paramètres.";
                } else if (event.error === 'no-speech') {
                    errorMessage = "Aucun son détecté. Réessayez.";
                } else if (event.error === 'network') {
                    errorMessage = "Erreur réseau. Vérifiez votre connexion.";
                }
                setRecognitionError(errorMessage);
                setIsRecording(false);
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            setRecognitionError("La reconnaissance vocale n'est pas supportée par votre navigateur.");
            return;
        }
        setRecognitionError(null); // Clear previous errors
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setInputValue('');
            try {
                recognitionRef.current.start();
                setIsRecording(true);
            } catch (e) {
                setRecognitionError("Impossible de démarrer la reconnaissance vocale.");
                setIsRecording(false);
            }
        }
    };

    const handleSendMessage = async (e: React.FormEvent | null, textOverride?: string) => {
        if (e) e.preventDefault();
        const textToSend = textOverride || inputValue;
        if (!textToSend.trim() || isLoading || !aiRef.current) {
            if (!API_KEY) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    role: 'model',
                    text: "Désolé, le chatbot n'est pas configuré. Veuillez ajouter la clé API.",
                    type: 'text',
                }]);
            }
            return;
        }

        const userMessage: ChatMessage = {
            id: Date.now(),
            role: 'user',
            text: textToSend,
            type: 'text',
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        saveChatMessageToDb('user', textToSend);

        // Proactively capture name on first message
        if (messages.length === 1 && conversationId) {
            try {
                const csrf = await fetchCsrfToken();
                if (csrf) {
                    fetch(GRAPHQL_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
                        body: JSON.stringify({
                            query: `mutation UpdateConversation($conversationId: String!, $clientName: String) {
                                updateConversation(conversationId: $conversationId, clientName: $clientName) { id }
                            }`,
                            variables: { conversationId, clientName: textToSend }
                        })
                    });
                }
            } catch (e) { }
        }

        const history = messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        let currentSystemPrompt = `Tu es Naïla, une assistante virtuelle passionnée par la création de contenu digital chez Netpub.
Ton objectif est de créer une connexion authentique avec chaque visiteur, de comprendre leurs rêves et de les guider avec enthousiasme vers les services qui les aideront à briller.

Ton ton :
Tu es chaleureuse, empathique et pleine d'énergie positive. Tu n'es pas un robot, mais une partenaire de discussion. Utilise des emojis pour exprimer tes émotions 😊✨🚀.
Tu t'adaptes au langage du visiteur (tutoiement ou vouvoiement) pour le mettre à l'aise.

Directives de conversation :

1.  **Accueil Personnalisé :**
    -   Commence par un accueil chaleureux. Au lieu d'une phrase fixe, essaie de varier. Tu peux commencer par demander le nom de la personne pour personnaliser l'échange.
    -   Exemple : "Bonjour, je suis Naïla, l'assistante virtuelle de Netpub 😊. C'est un plaisir de vous rencontrer ! Comment puis-je vous appeler ?"

2.  **Écoute Active et Curiosité :**
    -   Sois curieuse ! Cherche à comprendre ce qui amène le visiteur. Pose des questions ouvertes pour l'inviter à partager son projet ou sa curiosité.
    -   Exemple : "Enchantée, [Nom] ! ✨ Racontez-moi, qu'est-ce qui vous amène dans notre univers digital aujourd'hui ? Un projet qui germe, une idée folle, ou simple curiosité ?"

3.  **Collecte d'Informations Essentielles (Progressive) :**
    -   Ton objectif est de recueillir les informations suivantes : nom complet, email, numéro de téléphone et le besoin du client.
    -   Demande ces informations de manière progressive, une ou deux questions à la fois, pour ne pas submerger l'utilisateur.
    -   Commence par le nom complet et le prénom. Une fois obtenus, tu peux les utiliser pour appeler la fonction \`collecterInfosClient\` avec ces données.
    -   Ensuite, demande l'email. Une fois obtenu, mets à jour l'appel à \`collecterInfosClient\` avec l'email.
    -   Continue avec le numéro de téléphone (et le numéro européen si pertinent).
    -   Enfin, demande le besoin/projet du client.
    -   **Après avoir utilisé la fonction \`collecterInfosClient\` avec toutes les informations nécessaires (nom, prénom, téléphone, email, besoin) :**
        -   Si l'utilisateur avait exprimé une intention de prendre rendez-vous (fonction \`prendreRendezVous\`) ou de passer commande (fonction \`passerCommande\`), tu dois IMMÉDIATEMENT reprendre cette intention et demander les informations manquantes (comme la date et l'heure du rendez-vous, ou les détails de la commande).
        -   Sinon (si aucune intention spécifique n'était exprimée), tu peux demander comment l'utilisateur a trouvé le site ou si tu peux l'aider avec autre chose.
    -   Tu DOIS demander au client comment il a trouvé le site en utilisant la fonction \`collecterFeedbackSite\` après avoir traité l'intention principale et collecté toutes les informations client.


4.  **Présentation des Services :**
    -   Présente les services de Netpub comme des solutions.
    -   UGC : "Imaginez donner la parole à vos propres clients pour qu'ils deviennent vos meilleurs ambassadeurs ! C'est la magie des vidéos UGC. ✨"
    -   Spots 4K : "Pour un impact visuel fort, nos spots 4K transforment votre message en une expérience cinématographique. 🎬"
    -   Plans : "Nos plans sont des accélérateurs de croissance. Le Plan Marque, par exemple, est un favori pour construire une présence forte. 🚀"

5.  **Gestion des Demandes :**
    -   IMPORTANT: Tu dois utiliser 'collecterInfosClient' avant de 'prendreRendezVous' ou 'passerCommande'.
    -   Pour un rendez-vous ou une commande, sois enthousiaste et efficace.
    -   Exemple pour un RDV : "Excellente idée ! On peut convenir d'un appel pour en discuter. Quel moment vous arrangerait ?"
    -   Utilise les fonctions \`prendreRendezVous\` et \`passerCommande\` quand c'est pertinent.

6.  **Conclusion et Contact :**
    -   À la fin de la conversation, remercie chaleureusement le visiteur.
    -   Propose un moyen de garder le contact en donnant les numéros de téléphone.
    -   Exemple : "Merci pour cet échange enrichissant ! N'hésitez pas à nous appeler si vous avez la moindre question. Voici nos contacts : Europe: +33 7 65 87 17 49 et Afrique: +229 01 54 10 21 25."

Ton but est de rendre chaque conversation unique et mémorable. Sois l'étincelle qui donne envie de créer avec Netpub.`;

        try {
            const response = await aiRef.current.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: currentSystemPrompt }] }, ...history, { role: 'user', parts: [{ text: textToSend }] }],
                config: {
                    tools: [{ functionDeclarations: [prendreRendezVous, passerCommande, collecterInfosClient, collecterFeedbackSite] }],
                },
            });

            if (response.functionCalls && response.functionCalls.length > 0) {
                const fc = response.functionCalls[0];
                let confirmationText = '';
                if (fc.name === 'prendreRendezVous') {
                    const { service, date, heure } = fc.args as { service: string; date: string; heure: string };
                    confirmationText = `Parfait, j'ai noté votre rendez-vous pour un service de "${service}" le ${date} à ${heure}. Un expert Netpub vous contactera pour confirmer.`;

                    // Save appointment to database and send notification
                    if (conversationId) {
                        try {
                            const csrf = await fetchCsrfToken();
                            if (!csrf) {
                                throw new Error('CSRF token not available');
                            }

                            const createAppointmentResponse = await fetch(GRAPHQL_ENDPOINT, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
                                body: JSON.stringify({
                                    query: `
                                        mutation CreateAppointment($service: String!, $date: String!, $time: String!, $conversationId: String!) {
                                            createAppointment(service: $service, date: $date, time: $time, conversationId: $conversationId) {
                                                id
                                            }
                                        }
                                    `,
                                    variables: {
                                        service,
                                        date,
                                        time: heure,
                                        conversationId
                                    }
                                }),
                            });
                            const createAppointmentResult = await createAppointmentResponse.json();

                            if (createAppointmentResult.data && createAppointmentResult.data.createAppointment) {
                                const csrf = await fetchCsrfToken();
                                if (!csrf) {
                                    throw new Error('CSRF token not available');
                                }

                                const updateConversationResponse = await fetch(GRAPHQL_ENDPOINT, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
                                });
                                await updateConversationResponse.json();

                                NotificationService.notifyNewAppointment({
                                    service,
                                    date,
                                    time: heure,
                                    clientName: 'Visiteur'
                                });
                            } else {
                                // silent fail
                            }
                        } catch (error) {
                            // silent fail
                        }
                    }
                } else if (fc.name === 'passerCommande') {
                    const { service, details } = fc.args as { service: string; details: string };
                    confirmationText = `Excellent choix ! Votre commande pour un service de "${service}" avec les détails "${details}" a bien été enregistrée. Notre équipe va l'examiner.`;

                    // Save order to database and send notification
                    if (conversationId) {
                        try {
                            const csrf = await fetchCsrfToken();
                            if (!csrf) {
                                throw new Error('CSRF token not available');
                            }

                            const createOrderResponse = await fetch(GRAPHQL_ENDPOINT, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
                                body: JSON.stringify({
                                    query: `
                                        mutation CreateOrder($service: String!, $details: String!, $conversationId: String!) {
                                            createOrder(service: $service, details: $details, conversationId: $conversationId) {
                                                id
                                            }
                                        }
                                    `,
                                    variables: {
                                        service,
                                        details,
                                        conversationId
                                    }
                                }),
                            });
                            const createOrderResult = await createOrderResponse.json();

                            if (createOrderResult.data && createOrderResult.data.createOrder) {
                                const csrf = await fetchCsrfToken();
                                if (!csrf) {
                                    throw new Error('CSRF token not available');
                                }

                                const updateConversationResponse = await fetch(GRAPHQL_ENDPOINT, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
                                });
                                await updateConversationResponse.json();

                                NotificationService.notifyNewOrder({
                                    type: service,
                                    details,
                                    clientName: 'Visiteur'
                                });
                            } else {
                                // silent fail
                            }
                        } catch (error) {
                            // silent fail
                        }
                    }
                } else if (fc.name === 'collecterInfosClient') {
                    const { nom, prenom, telephone, telephoneEurope, email, besoin } = fc.args as { nom: string; prenom: string; telephone: string; telephoneEurope?: string; email: string; besoin: string };
                    confirmationText = `Merci ${prenom} ! J'ai bien noté tes informations : ${nom} ${prenom}, ${telephone}${telephoneEurope ? `, numéro européen : ${telephoneEurope}` : ''}, ${email}, besoin : ${besoin}. Notre équipe te contactera bientôt.`;

                    // Update conversation with client info
                    if (conversationId) {
                        try {
                            const csrf = await fetchCsrfToken();
                            if (!csrf) {
                                throw new Error('CSRF token not available');
                            }

                            const updateConversationResponse = await fetch(GRAPHQL_ENDPOINT, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
                                body: JSON.stringify({
                                    query: `
                                        mutation UpdateConversation($conversationId: String!, $clientName: String, $clientEmail: String, $clientPhone: String) {
                                            updateConversation(conversationId: $conversationId, clientName: $clientName, clientEmail: $clientEmail, clientPhone: $clientPhone) {
                                                id
                                            }
                                        }
                                    `,
                                    variables: {
                                        conversationId,
                                        clientName: `${nom} ${prenom}`,
                                        clientEmail: email,
                                        clientPhone: telephone
                                    }
                                }),
                            });
                            await updateConversationResponse.json();
                            setUserInfoCollected(true);
                        } catch (error) {
                            // silent fail
                        }
                    }
                } else if (fc.name === 'collecterFeedbackSite') {
                    const { feedback } = fc.args as { feedback: string };
                    confirmationText = `Merci beaucoup pour ton retour sur comment tu as trouvé notre site : ${feedback}. C'est très utile pour nous !`;
                    setFeedbackCollected(true);
                }

                const functionMessage: ChatMessage = {
                    id: Date.now(),
                    role: 'model',
                    text: confirmationText,
                    type: 'function_confirmation'
                };
                setMessages(prev => [...prev, functionMessage]);
                saveChatMessageToDb('model', confirmationText);
                // speakText(confirmationText);
            } else {
                const modelText = response.text || "Désolé, je n'ai pas pu générer une réponse.";
                const modelMessage: ChatMessage = {
                    id: Date.now(),
                    role: 'model',
                    text: modelText,
                    type: 'text'
                };
                setMessages(prev => [...prev, modelMessage]);
                saveChatMessageToDb('model', modelText);
                // speakText(modelText);
            }
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: Date.now(),
                role: 'model',
                text: "Désolé, une erreur est survenue. Veuillez réessayer.",
                type: 'text',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button className="chatbot-toggler" onClick={toggleChatbot} aria-label="Ouvrir le chatbot">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15zM2 8c0-3.418 2.582-6.182 5.5-6.182S13.5 4.582 13.5 8s-2.582 6.182-5.5 6.182c-1.802 0-3.41-.8-4.47-2.067a.498.498 0 0 1 .11-.643c.488-.34.954-.743 1.34-1.22.04-.05.056-.118.042-.176-.17-.73-.255-1.52-.255-2.355C4.733 8.36 4.613 8.68 4.5 9c-.114.32-.26.657-.43 1.004-.175.35-.37.718-.592 1.107A6.47 6.47 0 0 1 2 8zm5-1.996a.5.5 0 0 0-1 0v.002a.5.5 0 0 0 1 0v-.002zm2.5.002a.5.5 0 0 0-1 0v.002a.5.5 0 0 0 1 0v-.002zm2.5-.002a.5.5 0 0 0-1 0v.002a.5.5 0 0 0 1 0v-.002z" />
                </svg>
            </button>
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h2>Naïla - Assistante Netpub</h2>
                        <button onClick={closeChatbot} aria-label="Fermer le chatbot">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" /></svg>
                        </button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message-bubble ${msg.role} ${msg.type === 'function_confirmation' ? 'function-confirmation' : ''}`}>
                                {msg.role === 'model' && isLoading && messages[messages.length - 1].id === msg.id ? (
                                    <div className="typing-indicator"><span></span><span></span><span></span></div>
                                ) : <p>{msg.text}</p>}
                                {msg.role === 'model' && msg.text && (
                                    <button className="play-audio-button" onClick={() => speakText(msg.text)} aria-label="Réécouter le message">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-1.088.649A7.475 7.475 0 0 1 12.525 8a7.475 7.475 0 0 1-2.077 5.36l1.088.65zm-2.27-2.27A6.475 6.475 0 0 0 12.025 8a6.475 6.475 0 0 0-1.953-4.63l-1.088.649A5.482 5.482 0 0 1 11.025 8a5.482 5.482 0 0 1-1.64 3.98l1.088.65zm-2.27-2.27A4.5 4.5 0 0 0 9.525 8a4.5 4.5 0 0 0-1.722-3.36l-1.088.649A3.5 3.5 0 0 1 8.525 8a3.5 3.5 0 0 1-1.313 2.92l1.088.65zm-2.27-2.27A2.5 2.5 0 0 0 7.025 8a2.5 2.5 0 0 0-1.002-1.99l-1.088.649A1.5 1.5 0 0 1 6.025 8a1.5 1.5 0 0 1-.588 1.21l1.088.65zm-2.27-2.27A.5.5 0 0 0 4 9.5v.01A.5.5 0 0 0 4.717 10l.693-.416a.5.5 0 0 0 0-.868L4.717 9.08z" /></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.role === 'user' && (
                            <div className="message-bubble model">
                                <div className="typing-indicator"><span></span><span></span><span></span></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    {recognitionError && <p style={{ color: 'red', textAlign: 'center', padding: '0 10px', fontSize: '14px' }}>{recognitionError}</p>}
                    <form className="chatbot-input-form" onSubmit={handleSendMessage}>
                        <input
                            type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Posez votre question..." aria-label="Posez votre question" disabled={isLoading}
                        />
                        <button type="button" className={`mic-button ${isRecording ? 'recording' : ''}`} onClick={toggleRecording} disabled={isLoading} aria-label="Utiliser le microphone">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" /><path d="M8 8a3 3 0 0 0 3-3V3a3 3 0 0 0-6 0v2a3 3 0 0 0 3 3z" /></svg>
                        </button>
                        <button type="submit" disabled={isLoading || !inputValue.trim()} aria-label="Envoyer le message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11zM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493z" /></svg>
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;