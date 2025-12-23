import React from 'react';
import './dashboard.css';
import {
  MessageSquare,
  Calendar,
  ShoppingCart,
  TrendingUp,
  PieChart,
  BarChart3,
  Target,
  ArrowUpRight,
  Zap,
  HelpCircle,
  Package
} from 'lucide-react';
import { Card, StatCard, Badge, Button } from '../../components/ui';
import { useDashboard } from '../../contexts/DashboardContext';

const Analytics: React.FC = () => {
  const { analyticsStats: stats, loading, error, refreshStats } = useDashboard();

  if (loading && !stats) return <div className="dashboard-section"><p>Analyse des performances en cours...</p></div>;
  if (error && !stats) return <div className="dashboard-section"><p className="error-message">{error}</p></div>;

  const maxIntentionCount = stats ? Math.max(...stats.mostFrequentIntentions.map((i: any) => i.count), 1) : 1;

  const getIntentionIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('rdv') || n.includes('rendez-vous') || n.includes('appointment')) return <Calendar size={18} />;
    if (n.includes('cmd') || n.includes('commande') || n.includes('order')) return <ShoppingCart size={18} />;
    if (n.includes('info') || n.includes('aide') || n.includes('help')) return <HelpCircle size={18} />;
    if (n.includes('port')) return <Package size={18} />;
    return <Zap size={18} />;
  };

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h1>Analyses & Performance IA</h1>
        <p>Mesurez l'efficacité réelle de vos workflows Netpub.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <StatCard title="Messages IA" value={stats?.totalMessages || 0} icon={MessageSquare} trend={stats?.messagesTrend} />
        <StatCard title="Rendez-vous" value={stats?.totalAppointments || 0} icon={Target} color="var(--color-success)" trend={stats?.appointmentsTrend} />
        <StatCard title="Commandes" value={stats?.totalOrders || 0} icon={BarChart3} color="var(--color-warning)" trend={stats?.ordersTrend} />
        <StatCard title="Conversion" value={`${Math.round(stats?.conversionRate || 0)}%`} icon={TrendingUp} color="var(--color-info)" trend={stats?.conversionTrend} />
      </div>

      <div className="dashboard-grid-two">
        <Card
          title="Intentions Clients"
          subtitle="Analyse sémantique des requêtes (Source: DB)"
          actions={<Button variant="ghost" size="sm" icon={<PieChart size={16} />}>Rapport</Button>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px 0' }}>
            {stats?.mostFrequentIntentions.map((intent: any, index: number) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ padding: '8px', background: 'var(--bg-app)', borderRadius: '8px', color: 'var(--accent-brand)', flexShrink: 0 }}>
                      {getIntentionIcon(intent.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{intent.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{intent.count} occurrences</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, flexShrink: 0 }}>{Math.round((intent.count / maxIntentionCount) * 100)}%</div>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(intent.count / maxIntentionCount) * 100}%`,
                      background: 'linear-gradient(90deg, var(--accent-brand), var(--accent-brand-deep))',
                      borderRadius: '4px',
                      transition: 'width 1s ease-out'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card title="Efficacité IA">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '20px', background: 'var(--accent-brand-soft)', borderRadius: '16px', border: '1px solid var(--border-brand)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-brand)' }}>Score d'exécution</span>
                  <Badge variant="filled" status="success">Optimal</Badge>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats?.efficiencyScore || 0}%</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Basé sur la résolution directe et le sentiment positif.</p>
              </div>

              <div style={{ padding: '20px', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>Statut Infrastructure</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', background: 'var(--color-success)', borderRadius: '50%', boxShadow: `0 0 10px var(--color-success)` }}></div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{stats?.systemStatus}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latence: {stats?.systemLatency}ms</div>
                  </div>
                </div>
              </div>

              <Button variant="outline" style={{ width: '100%' }} icon={<ArrowUpRight size={16} />} onClick={refreshStats}>Actualiser les analyses</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
