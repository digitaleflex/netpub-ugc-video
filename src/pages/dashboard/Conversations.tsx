import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { fetchCsrfToken } from '../../utils/csrf';
import {
  MessageSquare,
  User,
  Calendar,
  ShoppingCart,
  Phone,
  Trash2,
  Clock,
  Send,
  Activity,
  Search,
  CheckCircle,
  MoreVertical,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card, Badge, Button, EmptyState } from '../../components/ui';

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
  const [searchTerm, setSearchTerm] = useState('');

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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
            variables: { limit: 20, offset: 0 },
          }),
        });
        const result = await response.json();

        if (result.data && result.data.conversations) {
          setConversations(result.data.conversations);
          if (result.data.conversations.length > 0) {
            setSelectedConversation(result.data.conversations[0]);
          }
        } else {
          setError(result.errors ? result.errors[0].message : 'Erreur lors du chargement');
        }
      } catch (err) {
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) return;
    try {
      const csrf = await fetchCsrfToken();
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
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        setSelectedConversation(null);
      }
    } catch (error) {
      alert('Erreur lors de la suppression.');
    }
  };

  const filteredConversations = conversations.filter(c =>
    (c.userName || 'Visiteur').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="dashboard-section"><p>Chargement des conversations...</p></div>;

  return (
    <div className="dashboard-section" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="section-header">
        <h1>Centre de Communication</h1>
        <p>Interagissez avec vos clients et suivez leurs demandes en temps réel.</p>
      </div>

      <div className="conversations-layout" style={{ flex: 1, minHeight: 0 }}>
        {/* Panel 1: List */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`nav-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                style={{ padding: '16px', cursor: 'pointer', display: 'block', height: 'auto', marginBottom: '8px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: selectedConversation?.id === conv.id ? 'var(--accent-brand)' : 'var(--text-main)' }}>
                    {conv.userName || 'Visiteur'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatTimestamp(conv.lastActivity)}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                  {conv.messages[0]?.text || 'Pas de message'}
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {conv.hasAppointment && <Badge status="confirmed">RDV</Badge>}
                  {conv.hasOrderPlaced && <Badge status="managed">CMD</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Chat Area */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              <div className="card-header" style={{ padding: '16px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--accent-brand-soft)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-brand)' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedConversation.userName || 'Visiteur'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--color-success)' }}>
                      <span style={{ width: '6px', height: '6px', background: 'var(--color-success)', borderRadius: '50%' }}></span> Actif récemment
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} onClick={() => handleDeleteConversation(selectedConversation.id)} />
                  <Button variant="ghost" size="sm" icon={<MoreVertical size={16} />} />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fcfcff' }}>
                {selectedConversation.messages.map(msg => (
                  <div key={msg.id} style={{
                    alignSelf: msg.sender === 'user' ? 'flex-start' : 'flex-end',
                    maxWidth: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-start' : 'flex-end'
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '16px',
                      fontSize: '0.9375rem',
                      background: msg.sender === 'user' ? '#fff' : 'var(--accent-brand)',
                      color: msg.sender === 'user' ? 'var(--text-main)' : '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      border: msg.sender === 'user' ? '1px solid var(--border-light)' : 'none',
                      borderBottomLeftRadius: msg.sender === 'user' ? '4px' : '16px',
                      borderBottomRightRadius: msg.sender === 'user' ? '16px' : '4px'
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '4px' }}>
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Répondre..."
                  style={{ flex: 1, padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-app)', outline: 'none' }}
                />
                <Button icon={<Send size={18} />} style={{ borderRadius: '12px', padding: '12px' }} />
              </div>
            </>
          ) : (
            <EmptyState icon={MessageSquare} title="Sélectionnez un chat" description="Choisissez une conversation dans la liste pour commencer à échanger." />
          )}
        </div>

        {/* Panel 3: Details */}
        <div className="premium-card" style={{ padding: '24px' }}>
          {selectedConversation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--bg-app)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-brand)', border: '1px solid var(--border-light)' }}>
                  <User size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedConversation.userName || 'Visiteur'}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{selectedConversation.userId || 'Utilisateur invité'}</p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={14} /> Informations
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Créé le</span>
                    <span style={{ fontWeight: 500 }}>{new Date(selectedConversation.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Dernier actif</span>
                    <span style={{ fontWeight: 500 }}>{formatTimestamp(selectedConversation.lastActivity)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} /> Rendez-vous ({selectedConversation.appointments.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedConversation.appointments.map(apt => (
                    <div key={apt.id} style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{apt.service}</span>
                        <Badge variant="outline" status={apt.status.toLowerCase() as any}>{apt.status}</Badge>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(apt.date).toLocaleDateString()} à {apt.time}
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" style={{ width: '100%', fontSize: '0.75rem' }}>Gérer les RDV</Button>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={14} /> Commandes ({selectedConversation.orders.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedConversation.orders.map(order => (
                    <div key={order.id} style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{order.type}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.date).toLocaleDateString()}</div>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
              <Activity size={32} strokeWidth={1} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem' }}>Aucun détail à afficher</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversations;
