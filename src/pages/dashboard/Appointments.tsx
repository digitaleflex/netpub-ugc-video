import React, { useState, useEffect, useCallback } from 'react';
import './dashboard.css';
import { fetchCsrfToken } from '../../utils/csrf';

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
        id
        clientName
        date
        time
        service
        status
        conversationId
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
const APPOINTMENTS_PER_PAGE = 9;

const Appointments: React.FC = () => {
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
      if (!csrf) {
        throw new Error('CSRF token not available');
      }

      const variables = {
        limit: APPOINTMENTS_PER_PAGE,
        offset: (currentPage - 1) * APPOINTMENTS_PER_PAGE,
        status: filterStatus === 'all' ? null : filterStatus,
        date: filterDate || null,
      };

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({
          query: GET_APPOINTMENTS,
          variables,
        }),
      });
      const result = await response.json();

      if (result.data && result.data.allAppointments) {
        setAppointments(result.data.allAppointments.appointments);
        setTotalAppointments(result.data.allAppointments.totalCount);
      } else {
        console.error('Error loading appointments:', result.errors);
        setError(result.errors ? result.errors[0].message : 'Erreur lors du chargement des rendez-vous');
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterDate]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const getStatusColorClass = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const csrf = await fetchCsrfToken();
      if (!csrf) {
        throw new Error('CSRF token not available');
      }

      await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({
          query: UPDATE_APPOINTMENT_STATUS,
          variables: { appointmentId, status: newStatus },
        }),
      });
      // Refresh appointments after status update
      loadAppointments();
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus as Appointment['status'] });
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const totalPages = Math.ceil(totalAppointments / APPOINTMENTS_PER_PAGE);

  if (error) {
    return (
      <div className="dashboard-section appointments-view">
        <h1>Rendez-vous</h1>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-section appointments-view">
      <h1>Rendez-vous</h1>
      <p>Gérez et suivez tous les rendez-vous pris via le chatbot.</p>

      <div className="appointments-filters">
        <select onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} value={filterStatus}>
          <option value="all">Tous les statuts</option>
          <option value="confirmed">Confirmé</option>
          <option value="pending">En attente</option>
          <option value="cancelled">Annulé</option>
          <option value="completed">Terminé</option>
        </select>
        <input 
          type="date" 
          value={filterDate} 
          onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} 
          placeholder="Filtrer par date"
        />
      </div>

      <div className="appointments-layout">
        <div className="calendar-panel">
          <h2>Vue Calendrier ({totalAppointments})</h2>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <>
              <div className="calendar-grid">
                {appointments.map(app => (
                  <div
                    key={app.id}
                    className={`appointment-card ${getStatusColorClass(app.status)} ${selectedAppointment?.id === app.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAppointment(app)}
                  >
                    <h3>{app.clientName}</h3>
                    <p>{app.service}</p>
                    <p>{new Date(app.date).toLocaleDateString('fr-FR')} à {app.time}</p>
                    <span className="appointment-status">{app.status}</span>
                  </div>
                ))}
              </div>
              <div className="pagination-controls">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Précédent
                </button>
                <span>Page {currentPage} sur {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Suivant
                </button>
              </div>
            </>
          )}
        </div>

        <div className="appointment-detail-panel">
          {selectedAppointment ? (
            <>
              <h2>Détails du Rendez-vous</h2>
              <div className="detail-card">
                <h3>Client: {selectedAppointment.clientName}</h3>
                <p><strong>Service:</strong> {selectedAppointment.service}</p>
                <p><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString('fr-FR')}</p>
                <p><strong>Heure:</strong> {selectedAppointment.time}</p>
                <p><strong>Statut:</strong> <span className={getStatusColorClass(selectedAppointment.status)}>{selectedAppointment.status}</span></p>
                <p><strong>ID Conversation:</strong> {selectedAppointment.conversationId.substring(0,8)}...</p>

                <div className="appointment-actions">
                  <button
                    className="action-button confirm-button"
                    onClick={() => handleStatusUpdate(selectedAppointment.id, 'confirmed')}
                    disabled={selectedAppointment.status === 'confirmed'}
                  >
                    Confirmer
                  </button>
                  <button
                    className="action-button complete-button"
                    onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                    disabled={selectedAppointment.status === 'completed'}
                  >
                    Marquer comme terminé
                  </button>
                  <button
                    className="action-button cancel-button"
                    onClick={() => handleStatusUpdate(selectedAppointment.id, 'cancelled')}
                    disabled={selectedAppointment.status === 'cancelled'}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="select-appointment-message">Sélectionnez un rendez-vous pour voir les détails.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
