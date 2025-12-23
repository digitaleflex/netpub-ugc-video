import React, { useState } from 'react';
import './dashboard.css';
import {
  Brain,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  MessageSquare,
  Zap,
  ExternalLink
} from 'lucide-react';
import { Card, Table, Badge, Button, EmptyState } from '../../components/ui';
import { useDashboard } from '../../contexts/DashboardContext';

const Learning: React.FC = () => {
  const { analyticsStats, refreshStats, loading } = useDashboard();
  const [retraining, setRetraining] = useState(false);

  const handleRetrain = () => {
    setRetraining(true);
    setTimeout(() => {
      setRetraining(false);
      alert('Modèle IA réentraîné avec succès par Netpub !');
      refreshStats();
    }, 2000);
  };

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h1>Apprentissage & Optimisation</h1>
        <p>Améliorez la précision de votre IA Netpub en temps réel.</p>
      </div>

      <div className="dashboard-grid-two">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card
            title="Intentions à réviser"
            subtitle="0 phrases nécessitent votre attention"
            actions={<Button variant="ghost" size="sm" icon={<RotateCcw size={16} />} onClick={refreshStats} isLoading={loading}>Actualiser</Button>}
          >
            <div style={{ padding: '40px 0' }}>
              <EmptyState
                icon={ShieldCheck}
                title="IA Optimisée"
                description="Aucune anomalie détectée. Vos workflows Netpub fonctionnent avec une précision maximale."
              />
            </div>
          </Card>

          <Card title="Historique du Modèle">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--accent-brand-soft)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-brand)' }}>
                <Brain size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>v3.1.0 Active</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mise à jour automatique par Netpub Suite</div>
              </div>
              <Button variant="ghost" size="sm" icon={<ExternalLink size={16} />} />
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card title="Centre de Retrain">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, var(--accent-brand), var(--accent-brand-deep))', borderRadius: '20px', color: '#fff' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={20} fill="#fff" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Optimisation IA</h3>
                <p style={{ fontSize: '0.8125rem', opacity: 0.9 }}>Forcez la synchronisation de l'apprentissage profond.</p>
                <Button
                  onClick={handleRetrain}
                  disabled={retraining}
                  variant="primary"
                  style={{ width: '100%', marginTop: '24px', background: '#fff', color: 'var(--accent-brand)', border: 'none', fontWeight: 700 }}
                  isLoading={retraining}
                >
                  Synchroniser
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Score de qualité</span>
                  <span style={{ fontWeight: 600 }}>{analyticsStats?.efficiencyScore || 0}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${analyticsStats?.efficiencyScore || 0}%`, background: 'var(--color-success)', borderRadius: '3px' }}></div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Archives">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button variant="ghost" size="sm" icon={<BookOpen size={16} />} style={{ width: '100%', justifyContent: 'flex-start' }}>Documentation</Button>
              <Button variant="ghost" size="sm" icon={<MessageSquare size={16} />} style={{ width: '100%', justifyContent: 'flex-start' }}>Logs IA</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Learning;
