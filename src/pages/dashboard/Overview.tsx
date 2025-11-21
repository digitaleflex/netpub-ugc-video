import React, { useEffect, useState } from 'react';
import './dashboard.css';
import { fetchCsrfToken } from '../../utils/csrf';

interface RecentConversation {
  id: string;
  userName: string | null;
  lastActivity: string;
}

interface RecentAppointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  service: string;
}

interface RecentOrder {
  id: string;
  clientName: string;
  type: string;
  status: string;
}

interface RecentComment {
  id: string;
  content: string;
  user?: { name: string | null };
  project?: { title: string | null };
}

interface RecentLike {
  id: string;
  user?: { name: string | null };
  project?: { title: string | null };
}

interface DashboardStats {
  totalConversations: number;
  activeConversations: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  totalComments: number;
  totalLikes: number;
  recentConversations: RecentConversation[];
  recentAppointments: RecentAppointment[];
  recentOrders: RecentOrder[];
  recentComments: RecentComment[];
  recentLikes: RecentLike[];
}

const GET_DASHBOARD_STATS = `
  query GetDashboardStats {
    dashboardStats {
      totalConversations
      activeConversations
      totalAppointments
      pendingAppointments
      confirmedAppointments
      completedAppointments
      totalOrders
      pendingOrders
      confirmedOrders
      deliveredOrders
      totalComments
      totalLikes
      recentConversations {
        id
        userName
        lastActivity
      }
      recentAppointments {
        id
        clientName
        date
        time
        service
      }
      recentOrders {
        id
        clientName
        type
        status
      }
      recentComments {
        id
        content
        user {
          name
        }
        project {
          title
        }
      }
      recentLikes {
        id
        user {
          name
        }
        project {
          title
        }
      }
    }
  }
`;

const RESET_CHATBOT_MODEL = `
  mutation ResetChatbotModel {
    resetChatbotModel
  }
`;

const GRAPHQL_ENDPOINT = '/graphql';

const Overview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const csrf = await fetchCsrfToken();
        if (!csrf) {
          throw new Error('CSRF token not available');
        }

        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
          body: JSON.stringify({
            query: GET_DASHBOARD_STATS,
          }),
        });
        const result = await response.json();

        if (result.data && result.data.dashboardStats) {
          setStats(result.data.dashboardStats);
        } else {
          console.error('Error loading dashboard stats:', result.errors);
          setError(result.errors ? result.errors[0].message : 'Erreur lors du chargement des statistiques');
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleResetChatbotModel = async () => {
    setLoading(true);
    try {
      const csrf = await fetchCsrfToken();
      if (!csrf) {
        throw new Error('CSRF token not available');
      }

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({
          query: RESET_CHATBOT_MODEL,
        }),
      });
      const result = await response.json();
      if (result.data && result.data.resetChatbotModel) {
        alert('Modèle de chatbot réinitialisé avec succès!');
        window.location.reload();
      } else {
        console.error('Error resetting chatbot model:', result.errors);
        alert('Erreur lors de la réinitialisation du modèle.');
      }
    } catch (error) {
      console.error('Error resetting chatbot model:', error);
      alert('Erreur lors de la réinitialisation du modèle.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-section">
        <h1>Dashboard Overview</h1>
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-section">
        <h1>Dashboard Overview</h1>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <h1>Dashboard Overview</h1>
      <p>Bienvenue sur votre tableau de bord de gestion du chatbot. Voici un aperçu rapide de l'activité de votre bot.</p>

      <div className="summary-widgets">
        <div className="widget">
          <h2>Conversations Totales</h2>
          <p>{stats?.totalConversations || 0}</p>
          <small>Conversations actives: {stats?.activeConversations || 0}</small>
        </div>
        <div className="widget">
          <h2>Rendez-vous</h2>
          <p>{stats?.totalAppointments || 0}</p>
          <small>En attente: {stats?.pendingAppointments || 0} | Confirmés: {stats?.confirmedAppointments || 0}</small>
        </div>
        <div className="widget">
          <h2>Commandes</h2>
          <p>{stats?.totalOrders || 0}</p>
          <small>En attente: {stats?.pendingOrders || 0} | Livrées: {stats?.deliveredOrders || 0}</small>
        </div>
        <div className="widget">
          <h2>Activité Récente</h2>
          <p>{stats?.activeConversations || 0}</p>
          <small>Dernières 24h</small>
        </div>
      </div>

      <div className="recent-activity-sections">
        <div className="activity-section">
          <h2>Conversations Récentes</h2>
          <ul className="activity-list">
            {stats?.recentConversations.length === 0 ? (
              <li>Aucune conversation récente.</li>
            ) : (
              stats?.recentConversations.map(conv => (
                <li key={conv.id}>Conversation avec {conv.userName} - {new Date(conv.lastActivity).toLocaleDateString()}</li>
              ))
            )}
          </ul>
        </div>

        <div className="activity-section">
          <h2>Rendez-vous Récents</h2>
          <ul className="activity-list">
            {stats?.recentAppointments.length === 0 ? (
              <li>Aucun rendez-vous récent.</li>
            ) : (
              stats?.recentAppointments.map(apt => (
                <li key={apt.id}>{apt.clientName} - {apt.service} le {new Date(apt.date).toLocaleDateString()} à {apt.time}</li>
              ))
            )}
          </ul>
        </div>

        <div className="activity-section">
          <h2>Commandes Récentes</h2>
          <ul className="activity-list">
            {stats?.recentOrders.length === 0 ? (
              <li>Aucune commande récente.</li>
            ) : (
              stats?.recentOrders.map(order => (
                <li key={order.id}>{order.clientName} - {order.type} ({order.status})</li>
              ))
            )}
          </ul>
        </div>

        <div className="activity-section">
          <h2>Commentaires Récents</h2>
          <ul className="activity-list">
            {stats?.recentComments.length === 0 ? (
              <li>Aucun commentaire récent.</li>
            ) : (
              stats?.recentComments.map(comment => (
                <li key={comment.id}>{comment.user?.name || 'Anonyme'} a commenté sur {comment.project?.title || 'un projet'}: "{comment.content.substring(0, 30)}..."</li>
              ))
            )}
          </ul>
        </div>

        <div className="activity-section">
          <h2>Likes Récents</h2>
          <ul className="activity-list">
            {stats?.recentLikes.length === 0 ? (
              <li>Aucun like récent.</li>
            ) : (
              stats?.recentLikes.map(like => (
                <li key={like.id}>{like.user?.name || 'Anonyme'} a aimé {like.project?.title || 'un projet'}</li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="dashboard-actions">
        <button
          className="action-button primary"
          onClick={() => window.location.reload()}
        >
          Actualiser les données
        </button>
        <button
          className="action-button secondary"
          onClick={handleResetChatbotModel}
        >
          Réinitialiser le modèle
        </button>
      </div>
    </div>
  );
};

export default Overview;
