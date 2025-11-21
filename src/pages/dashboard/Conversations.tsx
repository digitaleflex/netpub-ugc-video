import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { fetchCsrfToken } from '../../utils/csrf';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  service: string;
  status: string;
}

interface Order {
  id: string;
  clientName: string;
  type: string;
  status: string;
  date: string;
}

interface ConversationWithDetails {
  id: string;
  userId: string | null;
  userName: string | null;
  hasAppointment: boolean;
  hasCallScheduled: boolean;
  hasOrderPlaced: boolean;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  appointments: Appointment[];
  orders: Order[];
}

const GET_CONVERSATIONS = `
  query GetConversations($limit: Int, $offset: Int) {
    conversations(limit: $limit, offset: $offset) {
      id
      userId
      userName
      hasAppointment
      hasCallScheduled
      hasOrderPlaced
      lastActivity
      createdAt
      updatedAt
      messages {
        id
        sender
        text
        timestamp
      }
      appointments {
        id
        clientName
        date
        time
        service
        status
      }
      orders {
        id
        clientName
        type
        status
        date
      }
    }
  }
`;

const ADD_NOTE_TO_CONVERSATION = `
  mutation AddNoteToConversation($conversationId: ID!, $note: String!) {
    addNoteToConversation(conversationId: $conversationId, note: $note)
  }
`;

const DELETE_CONVERSATION = `
  mutation DeleteConversation($conversationId: ID!) {
    deleteConversation(conversationId: $conversationId)
  }
`;

const GRAPHQL_ENDPOINT = '/graphql';

const Conversations: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR');
  };

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const csrf = await fetchCsrfToken();
        if (!csrf) {
          throw new Error('CSRF token not available');
        }

        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
          body: JSON.stringify({
            query: GET_CONVERSATIONS,
            variables: { limit: 10, offset: 0 }, // Assuming default limit and offset for now
          }),
        });
        const result = await response.json();

        if (result.data && result.data.conversations) {
          setConversations(result.data.conversations);
        } else {
          console.error('Error loading conversations:', result.errors);
          setError(result.errors ? result.errors[0].message : 'Erreur lors du chargement des conversations');
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
        setError('Erreur lors du chargement des conversations');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  const handleAddNote = async (conversationId: string, note: string) => {
    try {
      const csrf = await fetchCsrfToken();
      if (!csrf) {
        throw new Error('CSRF token not available');
      }

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({
          query: ADD_NOTE_TO_CONVERSATION,
          variables: { conversationId, note },
        }),
      });
      const result = await response.json();
      if (result.data && result.data.addNoteToConversation) {
        alert('Note ajoutée avec succès');
        // Optionally refresh conversations or update the selected conversation
      } else {
        console.error('Error adding note:', result.errors);
        alert('Erreur lors de l\'ajout de la note.');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Erreur lors de l\'ajout de la note.');
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const csrf = await fetchCsrfToken();
      if (!csrf) {
        throw new Error('CSRF token not available');
      }

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({
          query: DELETE_CONVERSATION,
          variables: { conversationId },
        }),
      });
      const result = await response.json();
      if (result.data && result.data.deleteConversation) {
        alert('Conversation supprimée avec succès');
        setConversations(conversations.filter(c => c.id !== conversationId));
        setSelectedConversation(null);
      } else {
        console.error('Error deleting conversation:', result.errors);
        alert('Erreur lors de la suppression de la conversation.');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Erreur lors de la suppression de la conversation.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-section conversations-view">
        <h1>Conversations du Chatbot</h1>
        <p>Chargement des conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-section conversations-view">
        <h1>Conversations du Chatbot</h1>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-section conversations-view">
      <h1>Conversations du Chatbot</h1>
      <p>Examinez et gérez toutes les interactions avec votre chatbot.</p>

      <div className="conversations-layout">
        <div className="conversation-list-panel">
          <h2>Conversations ({conversations.length})</h2>
          <ul className="conversation-list">
            {conversations.map(conv => (
              <li
                key={conv.id}
                className={`conversation-list-item ${selectedConversation?.id === conv.id ? 'selected' : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="user-info">
                  <img src={`https://i.pravatar.cc/50?u=${conv.userId}`} alt="User Avatar" className="conversation-avatar" />
                  <h3>{conv.userName}</h3>
                </div>
                <p className="last-message">
                  {conv.messages.length > 0 ? conv.messages[conv.messages.length - 1]?.text.substring(0, 50) + '...' : 'Aucun message'}
                </p>
                <p className="last-activity">{formatTimestamp(conv.lastActivity)}</p>
                <div className="conversation-flags">
                  {conv.hasAppointment && <span className="flag appointment-flag">🗓️</span>}
                  {conv.hasCallScheduled && <span className="flag call-flag">📞</span>}
                  {conv.hasOrderPlaced && <span className="flag order-flag">🛒</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="chat-area-panel">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <h2>Conversation avec {selectedConversation.userName}</h2>
                <div className="detail-flags">
                  {selectedConversation.hasAppointment && <span className="flag appointment-flag">Rendez-vous pris</span>}
                  {selectedConversation.hasCallScheduled && <span className="flag call-flag">Appel programmé</span>}
                  {selectedConversation.hasOrderPlaced && <span className="flag order-flag">Commande passée</span>}
                </div>
                <div className="chat-actions">
                  <button
                    className="action-button"
                    onClick={() => {
                      const note = prompt('Ajouter une note à cette conversation:');
                      if (note) {
                        handleAddNote(selectedConversation.id, note);
                      }
                    }}
                  >
                    Ajouter une note
                  </button>
                  <button
                    className="action-button danger"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
                        handleDeleteConversation(selectedConversation.id);
                      }
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <div className="chat-messages">
                {selectedConversation.messages.map(message => (
                  <div key={message.id} className={`chat-message ${message.sender}`}>
                    <span className="message-sender">
                      {message.sender === 'user' ? selectedConversation.userName : message.sender === 'system' ? 'Système' : 'Bot'}:
                    </span>
                    <span className="message-text">{message.text}</span>
                    <span className="message-timestamp">{formatTimestamp(message.timestamp)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="select-conversation-message">Sélectionnez une conversation pour voir les détails.</p>
          )}
        </div>

        <div className="client-detail-panel">
          {selectedConversation ? (
            <>
              <h2>Détails du Client</h2>
              <div className="client-info">
                <img src={`https://i.pravatar.cc/100?u=${selectedConversation.userId}`} alt="Client Avatar" className="client-avatar" />
                <h3>{selectedConversation.userName}</h3>
                <p><strong>ID Utilisateur:</strong> {selectedConversation.userId}</p>
                <p><strong>Dernière Activité:</strong> {formatTimestamp(selectedConversation.lastActivity)}</p>
                <p><strong>Créée le:</strong> {formatTimestamp(selectedConversation.createdAt)}</p>

                {selectedConversation.appointments.length > 0 && (
                  <div className="client-appointments">
                    <h4>Rendez-vous ({selectedConversation.appointments.length})</h4>
                    {selectedConversation.appointments.map(apt => (
                      <div key={apt.id} className="appointment-item">
                        <p><strong>{apt.service}</strong> - {apt.date} à {apt.time}</p>
                        <p>Statut: <span className={`status-${apt.status}`}>{apt.status}</span></p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedConversation.orders.length > 0 && (
                  <div className="client-orders">
                    <h4>Commandes ({selectedConversation.orders.length})</h4>
                    {selectedConversation.orders.map(order => (
                      <div key={order.id} className="order-item">
                        <p><strong>{order.type}</strong> - {formatTimestamp(order.date)}</p>
                        <p>Statut: <span className={`status-${order.status}`}>{order.status}</span></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="select-conversation-message">Sélectionnez une conversation pour voir les détails du client.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversations;
