import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { fetchCsrfToken } from '../../utils/csrf';

const GET_ANALYTICS_STATS = `
  query GetAnalyticsStats {
    analyticsStats {
      totalMessages
      totalAppointments
      totalOrders
      conversionRate
      mostFrequentIntentions {
        name
        count
        icon
      }
    }
  }
`;

const GRAPHQL_ENDPOINT = '/graphql';

// Placeholder for a simple animated counter hook if needed, for now just displays the value
const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  // In a real app, this would animate from 0 to value
  return <span>{Math.round(value)}</span>;
};

interface AnalyticCardProps {
  title: string;
  value: number;
  icon: string;
  unit?: string;
}

const AnalyticCard: React.FC<AnalyticCardProps> = ({ title, value, icon, unit = '' }) => (
  <div className="analytic-card widget">
    <div className="card-icon">{icon}</div>
    <div className="card-content">
      <h3>{title}</h3>
      <p className="card-value"><AnimatedCounter value={value} />{unit}</p>
    </div>
  </div>
);

interface Intention {
  name: string;
  count: number;
  icon: string;
}

interface AnalyticsStats {
  totalMessages: number;
  totalAppointments: number;
  totalOrders: number;
  conversionRate: number;
  mostFrequentIntentions: Intention[];
}

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const csrf = await fetchCsrfToken();
        if (!csrf) {
          throw new Error('CSRF token not available');
        }

        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
          body: JSON.stringify({
            query: GET_ANALYTICS_STATS,
          }),
        });
        const result = await response.json();

        if (result.data && result.data.analyticsStats) {
          setStats(result.data.analyticsStats);
        } else {
          setError(result.errors ? result.errors[0].message : 'Failed to fetch analytics data.');
        }
      } catch (err) {
        setError('An error occurred while fetching analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="dashboard-section"><h1>Chargement des analyses...</h1></div>;
  }

  if (error) {
    return <div className="dashboard-section"><h1 className="error-message">Erreur: {error}</h1></div>;
  }

  return (
    <div className="dashboard-section analytics-view">
      <h1>Chatbot Analytics & Insights</h1>
      <p>Gain insights into your chatbot's performance and user interactions.</p>

      <div className="analytics-grid">
        <AnalyticCard title="Messages échangés" value={stats?.totalMessages || 0} icon="💬" />
        <AnalyticCard title="Rendez-vous pris" value={stats?.totalAppointments || 0} icon="📅" />
        <AnalyticCard title="Commandes validées" value={stats?.totalOrders || 0} icon="🛍️" />
        <AnalyticCard title="Taux de conversion" value={stats?.conversionRate || 0} icon="🚀" unit="%" />
      </div>

      <div className="most-frequent-intentions widget">
        <h2>Intentions les plus fréquentes</h2>
        <ul>
          {stats?.mostFrequentIntentions.map((intent, index) => (
            <li key={index}>
              <span className="intention-icon">{intent.icon}</span>
              <span className="intention-name">{intent.name}</span>
              <span className="intention-count">{intent.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Analytics;
