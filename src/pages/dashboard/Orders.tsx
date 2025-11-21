import React, { useState, useEffect, useCallback } from 'react';
import './dashboard.css';
import { fetchCsrfToken } from '../../utils/csrf';

interface Order {
  id: string;
  clientName: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'delivered';
  date: string;
  conversationId: string;
}

const GET_ORDERS = `
  query GetAllOrders($limit: Int, $offset: Int, $status: String, $date: String) {
    allOrders(limit: $limit, offset: $offset, status: $status, date: $date) {
      orders {
        id
        clientName
        type
        status
        date
        conversationId
      }
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const loadOrders = useCallback(async () => {
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
          query: GET_ORDERS,
          variables,
        }),
      });
      const result = await response.json();

      if (result.data && result.data.allOrders) {
        setOrders(result.data.allOrders.orders);
        setTotalOrders(result.data.allOrders.totalCount);
      } else {
        console.error('Error loading orders:', result.errors);
        setError(result.errors ? result.errors[0].message : 'Erreur lors du chargement des commandes');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterDate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const csrf = await fetchCsrfToken();
      if (!csrf) {
        throw new Error('CSRF token not available');
      }

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({
          query: UPDATE_ORDER_STATUS,
          variables: { orderId, status: newStatus },
        }),
      });
      const result = await response.json();

      if (result.data && result.data.updateOrderStatus) {
        setOrders(prevOrders => prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
        ));
      } else {
        console.error('Error updating order status:', result.errors);
        alert('Erreur lors de la mise à jour du statut de la commande.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Erreur lors de la mise à jour du statut de la commande.');
    }
  };

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'confirmed': return 'badge-confirmed';
      case 'pending': return 'badge-pending';
      case 'cancelled': return 'badge-cancelled';
      case 'delivered': return 'badge-delivered';
      default: return '';
    }
  };

  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);

  if (error) {
    return (
      <div className="dashboard-section orders-view">
        <h1>Orders & Actions</h1>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-section orders-view">
      <h1>Orders & Actions</h1>
      <p>Track all orders and actions initiated through the chatbot.</p>

      <div className="orders-filters">
        <select onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} value={filterStatus}>
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="delivered">Delivered</option>
        </select>
        <input 
          type="date" 
          value={filterDate} 
          onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} 
          placeholder="Filter by Date"
        />
      </div>

      {loading ? (
        <p>Chargement des commandes...</p>
      ) : (
        <>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Conversation ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.clientName}</td>
                    <td>{order.type}</td>
                    <td><span className={`status-badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span></td>
                    <td>{new Date(order.date).toLocaleDateString('fr-FR')}</td>
                    <td>{order.conversationId.substring(0, 8)}...</td>
                    <td>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  );
};

export default Orders;
