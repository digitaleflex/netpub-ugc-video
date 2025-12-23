import React, { useState, useEffect, useCallback } from 'react';
import './dashboard.css';
import { fetchCsrfToken } from '../../utils/csrf';
import {
  Filter,
  Calendar as CalendarIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  CheckCircle,
  Clock,
  Settings,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { Card, Table, TableRow, TableCell, Badge, Button, EmptyState } from '../../components/ui';
import { useDashboard } from '../../contexts/DashboardContext';

interface Order {
  id: string;
  clientName: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'delivered' | 'managed';
  date: string;
  conversationId: string;
}

const GET_ORDERS = `
  query GetAllOrders($limit: Int, $offset: Int, $status: String, $date: String) {
    allOrders(limit: $limit, offset: $offset, status: $status, date: $date) {
      orders { id clientName type status date conversationId }
      totalCount
    }
  }
`;

const UPDATE_ORDER_STATUS = `
  mutation UpdateOrderStatus($orderId: ID!, $status: String!) {
    updateOrderStatus(orderId: $orderId, status: $status)
  }
`;

const GRAPHQL_ENDPOINT = '/graphql';
const ORDERS_PER_PAGE = 10;

const Orders: React.FC = () => {
  const { overviewStats, refreshStats } = useDashboard();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const csrf = await fetchCsrfToken();
      const gqlVariables = {
        limit: ORDERS_PER_PAGE,
        offset: (currentPage - 1) * ORDERS_PER_PAGE,
        status: filterStatus === 'all' ? null : filterStatus,
        date: filterDate || null,
      };

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf || '',
        },
        body: JSON.stringify({
          query: GET_ORDERS,
          variables: gqlVariables,
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (result.data?.allOrders) {
        setOrders(result.data.allOrders.orders);
        setTotalOrders(result.data.allOrders.totalCount);
      }
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterDate]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const csrf = await fetchCsrfToken();
      await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
        body: JSON.stringify({
          query: UPDATE_ORDER_STATUS,
          variables: { orderId, status: newStatus },
        }),
      });
      loadOrders();
      refreshStats();
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h1>Commandes & Transactions</h1>
        <p>Suivi en temps réel des prestations clients Netpub.</p>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un client..."
              style={{ padding: '12px 16px 12px 48px', width: '100%', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select
              className="btn-secondary btn-sm"
              style={{ height: '44px', padding: '0 16px' }}
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="delivered">Livré</option>
              <option value="managed">Déjà géré</option>
              <option value="cancelled">Annulé</option>
            </select>
            <input
              type="date"
              className="btn-secondary btn-sm"
              style={{ height: '44px', padding: '0 16px' }}
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Chargement des commandes...</div>
        ) : orders.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Aucune commande" description="Ajustez vos filtres pour voir plus de résultats." />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <Table headers={['Client', 'Prestation', 'Date', 'Statut', 'Détail']}>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{order.clientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{order.id.substring(0, 8)}</div>
                    </TableCell>
                    <TableCell>{order.type}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <select
                        style={{ padding: '4px 8px', borderRadius: '8px', border: 'none', background: 'var(--bg-app)', fontSize: '0.8125rem', fontWeight: 600 }}
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="delivered">Livré</option>
                        <option value="managed">Géré</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="xs" icon={<ExternalLink size={14} />}>VoirChat</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', flexWrap: 'wrap', gap: '16px' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Affichage de {orders.length} sur <strong>{totalOrders}</strong> commandes
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="xs" icon={<ChevronLeft size={16} />} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} />
                <Button variant="secondary" size="xs" icon={<ChevronRight size={16} />} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} />
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Orders;
