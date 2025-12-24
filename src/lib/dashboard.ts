
import { fetchCsrfToken } from '../utils/csrf';

const GRAPHQL_ENDPOINT = `${import.meta.env.VITE_API_URL || ''}/graphql`;

// Helper for GraphQL requests
async function graphqlRequest(query: string, variables: any = {}) {
  const token = localStorage.getItem('token');
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add CSRF token if needed
  try {
    const csrf = await fetchCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  } catch (e) {
    // Ignore CSRF fetch error for now if it fails, or log it
    console.warn("CSRF fetch failed", e);
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

export class DashboardService {
  static async getDashboardStats() {
    const query = `
      query GetDashboardStats {
        dashboardStats {
          totalProjects: totalConversations 
          totalUsers
          totalConversations
          recentConversations {
            id
            userName
            lastActivity
            hasAppointment
            hasCallScheduled
            hasOrderPlaced
            messages {
               text
            }
            orders {
               id
            }
            appointments {
               id
            }
          }
        }
      }
    `;

    try {
      // Note: The original getDashboardStats returned mixed data. 
      // Mapping the GraphQL response to match the expected structure if needed.
      // The schema 'DashboardStats' might differ slightly from the original object structure.
      // Adjusting to match schema.
      const data = await graphqlRequest(query);
      const stats = data.dashboardStats;

      return {
        totalProjects: 0, // Not in DashboardStats schema, defaulting
        totalUsers: 0, // Not in schema
        totalConversations: stats.totalConversations,
        recentConversations: stats.recentConversations.map((conv: any) => ({
          id: conv.id,
          userName: conv.name || conv.userName || 'Visitor',
          lastActivity: conv.lastActivity,
          hasAppointment: conv.hasAppointment,
          hasCallScheduled: conv.hasCallScheduled,
          hasOrderPlaced: conv.hasOrderPlaced,
          lastMessage: conv.messages?.[0]?.text || null,
          orderCount: conv.orders?.length || 0,
          appointmentCount: conv.appointments?.length || 0
        }))
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalProjects: 0,
        totalUsers: 0,
        totalConversations: 0,
        recentConversations: []
      };
    }
  }

  static async getConversations() {
    const query = `
      query GetConversations {
        conversations {
          id
          userName
          lastActivity
          hasAppointment
          hasCallScheduled
          hasOrderPlaced
          messages {
            text
            timestamp
          }
           orders {
               id
            }
            appointments {
               id
            }
        }
      }
    `;
    try {
      const data = await graphqlRequest(query);
      return data.conversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  static async getAppointments() {
    const query = `
      query GetAllAppointments {
        allAppointments {
          appointments {
            id
            clientName
            date
            time
            service
            status
            conversation {
              id
              clientName
            }
          }
        }
      }
    `;
    try {
      const data = await graphqlRequest(query);
      return data.allAppointments.appointments;
    } catch (error) {
      console.error('Error getting appointments:', error);
      return [];
    }
  }

  static async getOrders() {
    const query = `
      query GetAllOrders {
        allOrders {
          orders {
            id
            clientName
            type
            status
            date
            conversation {
              id
              clientName
            }
          }
        }
      }
    `;
    try {
      const data = await graphqlRequest(query);
      return data.allOrders.orders;
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }
}