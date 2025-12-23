import React, { useState, useEffect, useCallback } from 'react';
import './dashboard.css';
import { fetchCsrfToken } from '../../utils/csrf';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Card, StatCard, Badge, Button, EmptyState } from '../../components/ui';
import { useDashboard } from '../../contexts/DashboardContext';

interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  service: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  conversationId: string;
}

const GET_APPOINTMENTS = `
  query GetAllAppointments($limit: Int, $offset: Int, $status: String, $date: String) {
    allAppointments(limit: $limit, offset: $offset, status: $status, date: $date) {
      appointments {
        id clientName date time service status conversationId
      }
      totalCount
    }
  }
`;

const UPDATE_APPOINTMENT_STATUS = `
  mutation UpdateAppointmentStatus($appointmentId: ID!, $status: String!) {
    updateAppointmentStatus(appointmentId: $appointmentId, status: $status)
  }
`;

const GRAPHQL_ENDPOINT = '/graphql';
const APPOINTMENTS_PER_PAGE = 8;

const Appointments: React.FC = () => {
  const { analyticsStats, overviewStats, refreshStats } = useDashboard();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const csrf = await fetchCsrfToken();
      const variables = {
        limit: APPOINTMENTS_PER_PAGE,
        offset: (currentPage - 1) * APPOINTMENTS_PER_PAGE,
        status: filterStatus === 'all' ? null : filterStatus,
        date: filterDate || null,
      };

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
        body: JSON.stringify({ query: GET_APPOINTMENTS, variables }),
      });
      const result = await response.json();
      if (result.data) {
        setAppointments(result.data.allAppointments.appointments);
        setTotalAppointments(result.data.allAppointments.totalCount);
      }
    } catch (err) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterDate]);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const csrf = await fetchCsrfToken();
      await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
        body: JSON.stringify({
          query: UPDATE_APPOINTMENT_STATUS,
          variables: { appointmentId, status: newStatus },
        }),
      });
      loadAppointments();
      refreshStats(); // Update global context counts
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const totalPages = Math.ceil(totalAppointments / APPOINTMENTS_PER_PAGE);

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h1>Agenda & Rendez-vous</h1>
        <p>Gérez vos rencontres clients en temps réel.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <StatCard title="Total RDV" value={overviewStats?.totalAppointments || 0} icon={CalendarIcon} trend={analyticsStats?.appointmentsTrend} />
        <StatCard title="En attente" value={overviewStats?.pendingAppointments || 0} icon={AlertCircle} color="var(--color-warning)" />
        <StatCard title="Confirmés" value={overviewStats?.confirmedAppointments || 0} icon={CheckCircle} color="var(--color-success)" />
        <StatCard title="Conversion" value={`${Math.round(analyticsStats?.conversionRate || 0)}%`} icon={TrendingUp} color="var(--color-info)" trend={analyticsStats?.conversionTrend} />
      </div>

      <div className="dashboard-grid-two">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                className="btn-secondary btn-sm"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="cancelled">Annulé</option>
                <option value="completed">Terminé</option>
              </select>
              <input
                type="date"
                className="btn-secondary btn-sm"
                value={filterDate}
                onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" size="xs" icon={<ChevronLeft size={16} />} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} />
              <Button variant="secondary" size="xs" icon={<ChevronRight size={16} />} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>
          ) : appointments.length === 0 ? (
            <EmptyState icon={CalendarIcon} title="Aucun rendez-vous" description="Aucune rencontre planifiée." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {appointments.map(app => (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppointment(app)}
                  className={`premium-card ${selectedAppointment?.id === app.id ? 'active' : ''}`}
                  style={{ padding: '20px', cursor: 'pointer', border: selectedAppointment?.id === app.id ? '2px solid var(--accent-brand)' : '1px solid var(--border-light)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', gap: '8px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--bg-app)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-brand)', flexShrink: 0 }}>
                      <User size={18} />
                    </div>
                    <Badge status={app.status.toLowerCase() as any}>{app.status}</Badge>
                  </div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.clientName}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.service}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{new Date(app.date).toLocaleDateString()}</span>
                    <span>{app.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="premium-card detail-panel" style={{ padding: '24px', position: 'sticky', top: '24px' }}>
          {selectedAppointment ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Détails RDV</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {selectedAppointment.id.substring(0, 12)}</p>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Client:</span>
                  <div style={{ fontWeight: 600 }}>{selectedAppointment.clientName}</div>
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Service:</span>
                  <div style={{ fontWeight: 600 }}>{selectedAppointment.service}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Button variant="primary" size="sm" style={{ width: '100%' }} disabled={selectedAppointment.status === 'confirmed'} onClick={() => handleStatusUpdate(selectedAppointment.id, 'confirmed')}>Confirmer</Button>
                <Button variant="secondary" size="sm" style={{ width: '100%' }} disabled={selectedAppointment.status === 'completed'} onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}>Terminer</Button>
                <Button variant="danger" size="sm" style={{ width: '100%' }} onClick={() => handleStatusUpdate(selectedAppointment.id, 'cancelled')}>Annuler</Button>
              </div>

              <Button variant="ghost" size="sm" style={{ width: '100%', marginTop: 'auto' }} icon={<ExternalLink size={16} />}>Conversation</Button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <CalendarIcon size={40} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p style={{ fontSize: '0.875rem' }}>Détails du rendez-vous sélectionné</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import { TrendingUp } from 'lucide-react';
