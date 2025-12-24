import { prisma } from './prisma.js';
// Prisma types are inferred from the client

export class DashboardService {
  private static async getTrend(model: string, where: any = {}, dateField: string = 'createdAt') {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [thisMonth, lastMonth] = await Promise.all([
      (prisma as any)[model].count({
        where: { ...where, [dateField]: { gte: firstDayThisMonth } }
      }),
      (prisma as any)[model].count({
        where: { ...where, [dateField]: { gte: firstDayLastMonth, lt: firstDayThisMonth } }
      })
    ]);

    const diff = lastMonth === 0 ? (thisMonth > 0 ? 100 : 0) : ((thisMonth - lastMonth) / lastMonth) * 100;
    return {
      value: Math.abs(Math.round(diff * 10) / 10),
      isUp: diff >= 0
    };
  }

  static async getStats() {
    try {
      console.log('📊 Récupération des statistiques réelles du dashboard');
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [
        totalConversations,
        activeConversations,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        totalComments,
        totalLikes,
        recentConversations,
        recentAppointments,
        recentOrders,
        recentComments,
        recentLikes,
        conversationsTrend,
        appointmentsTrend,
        ordersTrend,
        engagementTrend
      ] = await Promise.all([
        prisma.conversation.count(),
        prisma.conversation.count({ where: { lastActivity: { gte: last24h } } }),
        prisma.appointment.count(),
        prisma.appointment.count({ where: { status: 'pending' } }),
        prisma.appointment.count({ where: { status: 'confirmed' } }),
        prisma.appointment.count({ where: { status: 'completed' } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: 'pending' } }),
        prisma.order.count({ where: { status: 'confirmed' } }),
        prisma.order.count({ where: { status: 'delivered' } }),
        Promise.resolve(0), // totalComments - model removed
        Promise.resolve(0), // totalLikes - model removed
        prisma.conversation.findMany({
          take: 5,
          orderBy: { lastActivity: 'desc' },
          include: { messages: { take: 1, orderBy: { timestamp: 'desc' } } },
        }),
        prisma.appointment.findMany({
          take: 5,
          orderBy: { date: 'desc' },
        }),
        prisma.order.findMany({
          take: 5,
          orderBy: { date: 'desc' },
        }),
        Promise.resolve([]), // recentComments - model removed
        Promise.resolve([]), // recentLikes - model removed
        this.getTrend('conversation'),
        this.getTrend('appointment', {}, 'date'),
        this.getTrend('order', {}, 'date'),
        this.getTrend('like'),
      ]);

      return {
        totalConversations,
        activeConversations,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        totalComments,
        totalLikes,
        recentConversations,
        recentAppointments,
        recentOrders,
        recentComments,
        recentLikes,
        conversationsTrend,
        appointmentsTrend,
        ordersTrend,
        engagementTrend
      };
    } catch (error) {
      console.error('❌ Erreur stats:', error);
      throw new Error('Failed to get dashboard statistics');
    }
  }

  static async getAnalyticsStats() {
    try {
      const start = Date.now();
      const [totalMessages, totalAppointments, totalOrders, totalConversations] = await Promise.all([
        prisma.chatMessage.count(),
        prisma.appointment.count(),
        prisma.order.count(),
        prisma.conversation.count(),
      ]);
      const systemLatency = Date.now() - start;

      // Efficiency Score based on successful outcomes
      const [allApps, allOrds] = await Promise.all([
        prisma.appointment.findMany({ select: { status: true } }),
        prisma.order.findMany({ select: { status: true } })
      ]);
      const successApp = allApps.filter((a: { status: string }) => ['confirmed', 'completed'].includes(a.status)).length;
      const successOrd = allOrds.filter((o: { status: string }) => ['confirmed', 'delivered', 'managed'].includes(o.status)).length;
      const totalOutcomes = allApps.length + allOrds.length;
      const efficiencyScore = totalOutcomes > 0 ? ((successApp + successOrd) / totalOutcomes) * 100 : 0;
      const conversionRate = totalConversations > 0 ? (totalOrders / totalConversations) * 100 : 0;

      // Intentions basées sur les services demandés dans les rendez-vous
      const appointments = await prisma.appointment.findMany({ select: { service: true } });
      const counts: Record<string, number> = {};
      appointments.forEach((a: { service: string }) => counts[a.service] = (counts[a.service] || 0) + 1);

      const mostFrequentIntentions = Object.entries(counts)
        .map(([name, count]) => ({ name, count, icon: '⚡' }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      if (mostFrequentIntentions.length === 0 && totalMessages > 0) {
        mostFrequentIntentions.push({ name: 'Demandes Générales', count: totalMessages, icon: '💬' });
      }

      // Real conversion trend calculation
      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const [thisMoOrders, thisMoConvs, lastMoOrders, lastMoConvs] = await Promise.all([
        prisma.order.count({ where: { date: { gte: firstDayThisMonth } } }),
        prisma.conversation.count({ where: { createdAt: { gte: firstDayThisMonth } } }),
        prisma.order.count({ where: { date: { gte: firstDayLastMonth, lt: firstDayThisMonth } } }),
        prisma.conversation.count({ where: { createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } } })
      ]);

      const curRate = thisMoConvs > 0 ? (thisMoOrders / thisMoConvs) : 0;
      const prevRate = lastMoConvs > 0 ? (lastMoOrders / lastMoConvs) : 0;
      const cDiff = prevRate === 0 ? (curRate > 0 ? 100 : 0) : ((curRate - prevRate) / prevRate) * 100;

      return {
        totalMessages,
        totalAppointments,
        totalOrders,
        conversionRate,
        mostFrequentIntentions,
        messagesTrend: await this.getTrend('chatMessage', {}, 'timestamp'),
        appointmentsTrend: await this.getTrend('appointment', {}, 'date'),
        ordersTrend: await this.getTrend('order', {}, 'date'),
        conversionTrend: {
          value: Math.abs(Math.round(cDiff * 10) / 10),
          isUp: cDiff >= 0
        },
        systemLatency,
        systemStatus: 'Opérationnel',
        efficiencyScore: Math.round(efficiencyScore * 10) / 10
      };
    } catch (error) {
      throw new Error('Failed to get analytics statistics');
    }
  }

  static async getAllOrders(limit: number = 20, offset: number = 0, status?: string, date?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (date) {
      where.date = {
        gte: new Date(date),
        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      };
    }

    try {
      const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { date: 'desc' },
        }),
        prisma.order.count({ where }),
      ]);
      return { orders, totalCount };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commandes:', error);
      throw new Error('Failed to get all orders');
    }
  }

  static async getAllAppointments(limit: number = 20, offset: number = 0, status?: string, date?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (date) {
      where.date = {
        gte: new Date(date),
        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      };
    }

    try {
      const [appointments, totalCount] = await Promise.all([
        prisma.appointment.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { date: 'desc' },
        }),
        prisma.appointment.count({ where }),
      ]);
      return { appointments, totalCount };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des rendez-vous:', error);
      throw new Error('Failed to get all appointments');
    }
  }

  static async getConversations(limit: number = 50, offset: number = 0) {
    try {
      console.log(`💬 Récupération des conversations (limit: ${limit}, offset: ${offset})`);
      const conversations = await prisma.conversation.findMany({
        take: limit,
        skip: offset,
        orderBy: { lastActivity: 'desc' },
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 10,
          },
          appointments: {
            orderBy: { date: 'desc' },
          },
          orders: {
            orderBy: { date: 'desc' },
          },
        },
      });

      console.log(`✅ ${conversations.length} conversations récupérées`);
      return conversations.map((conv: any) => ({
        ...conv,
        messages: [...conv.messages].reverse(), // Most recent first
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations:', error);
      return [];
    }
  }

  static async getConversationById(conversationId: string) {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
          },
          appointments: {
            orderBy: { date: 'desc' },
          },
          orders: {
            orderBy: { date: 'desc' },
          },
        },
      });

      return conversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  static async updateAppointmentStatus(appointmentId: string, status: string): Promise<boolean> {
    try {
      console.log(`📅 Mise à jour du statut du rendez-vous ${appointmentId} vers ${status}`);
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status },
      });
      console.log(`✅ Statut du rendez-vous ${appointmentId} mis à jour`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut du rendez-vous:', error);
      return false;
    }
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      console.log(`📦 Mise à jour du statut de la commande ${orderId} vers ${status}`);
      await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });
      console.log(`✅ Statut de la commande ${orderId} mis à jour`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut de la commande:', error);
      return false;
    }
  }

  static async resetChatbotModel(): Promise<boolean> {
    try {
      // This would typically involve clearing conversation history or resetting AI model state
      // For now, we'll just log this action
      console.log('Chatbot model reset requested');
      // You could add logic here to clear old conversations or reset model state
      return true;
    } catch (error) {
      console.error('Error resetting chatbot model:', error);
      return false;
    }
  }

  static async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      await prisma.conversation.delete({
        where: { id: conversationId },
      });
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  static async addNoteToConversation(conversationId: string, note: string): Promise<boolean> {
    try {
      // For now, we'll add a system message as a note
      await prisma.chatMessage.create({
        data: {
          conversationId,
          sender: 'system',
          text: `Note: ${note}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Error adding note to conversation:', error);
      return false;
    }
  }

  static async saveChatMessage(conversationId: string, sender: string, text: string) {
    try {
      console.log(`💬 Enregistrement du message (${sender}): ${text.substring(0, 50)}...`);
      const message = await prisma.chatMessage.create({
        data: {
          conversationId,
          sender,
          text,
        },
      });

      // Update last activity
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastActivity: new Date() }
      });

      return message;
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du message:', error);
      throw new Error('Failed to save chat message');
    }
  }
}