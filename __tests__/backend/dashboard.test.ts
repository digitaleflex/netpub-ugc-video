import { DashboardService } from '../../backend/lib/dashboard';
import { prisma } from '../../backend/lib/prisma';

// Mock the prisma client
jest.mock('../../backend/lib/prisma', () => ({
  prisma: {
    conversation: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    appointment: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    order: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    comment: {
      count: jest.fn(),
    },
    like: {
      count: jest.fn(),
    },
    chatMessage: {
      count: jest.fn(),
    },
  },
}));

describe('DashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return dashboard statistics', async () => {
      // Mock the database calls
      (prisma.conversation.count as jest.Mock).mockResolvedValueOnce(10);
      (prisma.conversation.count as jest.Mock).mockResolvedValueOnce(5); // for active conversations
      (prisma.appointment.count as jest.Mock).mockResolvedValueOnce(8);
      (prisma.appointment.count as jest.Mock).mockResolvedValueOnce(3); // pending
      (prisma.appointment.count as jest.Mock).mockResolvedValueOnce(4); // confirmed
      (prisma.appointment.count as jest.Mock).mockResolvedValueOnce(1); // completed
      (prisma.order.count as jest.Mock).mockResolvedValueOnce(12);
      (prisma.order.count as jest.Mock).mockResolvedValueOnce(5); // pending
      (prisma.order.count as jest.Mock).mockResolvedValueOnce(6); // confirmed
      (prisma.order.count as jest.Mock).mockResolvedValueOnce(1); // delivered
      (prisma.comment.count as jest.Mock).mockResolvedValueOnce(50);
      (prisma.like.count as jest.Mock).mockResolvedValueOnce(100);
      
      (prisma.conversation.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.order.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.like.findMany as jest.Mock).mockResolvedValue([]);

      const result = await DashboardService.getStats();

      expect(result).toBeDefined();
      expect(result.totalConversations).toBe(10);
      expect(result.activeConversations).toBe(5);
      expect(result.totalAppointments).toBe(8);
      expect(result.pendingAppointments).toBe(3);
      expect(result.confirmedAppointments).toBe(4);
      expect(result.completedAppointments).toBe(1);
      expect(result.totalOrders).toBe(12);
      expect(result.pendingOrders).toBe(5);
      expect(result.confirmedOrders).toBe(6);
      expect(result.deliveredOrders).toBe(1);
      expect(result.totalComments).toBe(50);
      expect(result.totalLikes).toBe(100);
    });
  });

  describe('getAnalyticsStats', () => {
    it('should return analytics statistics', async () => {
      (prisma.chatMessage.count as jest.Mock).mockResolvedValue(200);
      (prisma.appointment.count as jest.Mock).mockResolvedValue(15);
      (prisma.order.count as jest.Mock).mockResolvedValue(10);
      (prisma.conversation.count as jest.Mock).mockResolvedValue(50);

      const result = await DashboardService.getAnalyticsStats();

      expect(result).toBeDefined();
      expect(result.totalMessages).toBe(200);
      expect(result.totalAppointments).toBe(15);
      expect(result.totalOrders).toBe(10);
      expect(result.conversionRate).toBe(20); // (10/50) * 100
      expect(result.mostFrequentIntentions).toBeDefined();
      expect(result.mostFrequentIntentions.length).toBeGreaterThan(0);
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders', async () => {
      const mockOrders = [
        { id: '1', type: 'Service A', status: 'pending', date: new Date(), conversationId: 'conv1' },
        { id: '2', type: 'Service B', status: 'confirmed', date: new Date(), conversationId: 'conv2' },
      ];
      (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
      (prisma.order.count as jest.Mock).mockResolvedValue(2);

      const result = await DashboardService.getAllOrders(10, 0);

      expect(result).toBeDefined();
      expect(result.orders).toEqual(mockOrders);
      expect(result.totalCount).toBe(2);
    });
  });

  describe('getAllAppointments', () => {
    it('should return paginated appointments', async () => {
      const mockAppointments = [
        { id: '1', service: 'Service A', status: 'pending', date: new Date(), time: '10:00', conversationId: 'conv1' },
        { id: '2', service: 'Service B', status: 'confirmed', date: new Date(), time: '14:00', conversationId: 'conv2' },
      ];
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue(mockAppointments);
      (prisma.appointment.count as jest.Mock).mockResolvedValue(2);

      const result = await DashboardService.getAllAppointments(10, 0);

      expect(result).toBeDefined();
      expect(result.appointments).toEqual(mockAppointments);
      expect(result.totalCount).toBe(2);
    });
  });
});