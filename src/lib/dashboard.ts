import { prisma } from '../backend/lib/prisma';

export class DashboardService {
  static async getDashboardStats() {
    try {
      const [
        totalProjects,
        totalUsers,
        totalConversations,
        recentConversations
      ] = await Promise.all([
        prisma.project.count(),
        prisma.user.count(),
        prisma.conversation.count(),
        prisma.conversation.findMany({
          take: 5,
          orderBy: { lastActivity: 'desc' },
          include: {
            messages: { take: 1, orderBy: { timestamp: 'desc' } },
            orders: true,
            appointments: true
          }
        })
      ]);

      return {
        totalProjects,
        totalUsers,
        totalConversations,
        recentConversations: recentConversations.map(conv => ({
          id: conv.id,
          userName: conv.userName,
          lastActivity: conv.lastActivity,
          hasAppointment: conv.hasAppointment,
          hasCallScheduled: conv.hasCallScheduled,
          hasOrderPlaced: conv.hasOrderPlaced,
          lastMessage: conv.messages[0]?.text || null,
          orderCount: conv.orders.length,
          appointmentCount: conv.appointments.length
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
    try {
      return await prisma.conversation.findMany({
        orderBy: { lastActivity: 'desc' },
        include: {
          messages: { orderBy: { timestamp: 'desc' }, take: 1 },
          orders: true,
          appointments: true
        }
      });
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  static async getAppointments() {
    try {
      return await prisma.appointment.findMany({
        orderBy: { date: 'asc' },
        include: {
          conversation: true
        }
      });
    } catch (error) {
      console.error('Error getting appointments:', error);
      return [];
    }
  }

  static async getOrders() {
    try {
      return await prisma.order.findMany({
        orderBy: { date: 'desc' },
        include: {
          conversation: true
        }
      });
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }
}