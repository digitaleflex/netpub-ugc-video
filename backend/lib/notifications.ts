import { prisma } from './prisma.js';

export interface NotificationData {
  type: 'appointment' | 'order' | 'contact' | 'conversation';
  title: string;
  message: string;
  data?: any;
  recipientEmail?: string;
}

export class NotificationService {
  static async createNotification(notification: NotificationData): Promise<void> {
    try {
      // Store notification in database (you might want to add a notifications table)
      console.log('Notification créée:', notification);

      // Send email notification if recipient specified
      if (notification.recipientEmail) {
        await this.sendEmailNotification(notification);
      }

      // You could also implement push notifications, SMS, etc.
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  static async sendEmailNotification(notification: NotificationData): Promise<void> {
    try {
      // This would integrate with your email service
      // For now, we'll just log it
      console.log('Email notification would be sent:', {
        to: notification.recipientEmail,
        subject: notification.title,
        message: notification.message
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  static async notifyNewAppointment(appointmentData: any): Promise<void> {
    const notification: NotificationData = {
      type: 'appointment',
      title: 'Nouveau rendez-vous programmé',
      message: `Un nouveau rendez-vous a été pris pour "${appointmentData.service}" avec ${appointmentData.clientName} le ${appointmentData.date} à ${appointmentData.time}`,
      data: appointmentData,
      recipientEmail: 'org.netpub@gmail.com'
    };

    await this.createNotification(notification);
  }

  static async notifyNewOrder(orderData: any): Promise<void> {
    const notification: NotificationData = {
      type: 'order',
      title: 'Nouvelle commande reçue',
      message: `Une nouvelle commande a été passée pour "${orderData.type}" par ${orderData.clientName}`,
      data: orderData,
      recipientEmail: 'org.netpub@gmail.com'
    };

    await this.createNotification(notification);
  }

  static async notifyNewContact(contactData: any): Promise<void> {
    const notification: NotificationData = {
      type: 'contact',
      title: 'Nouveau message de contact',
      message: `${contactData.name} (${contactData.email}) a envoyé un message concernant "${contactData.service || 'Service général'}"`,
      data: contactData,
      recipientEmail: 'org.netpub@gmail.com'
    };

    await this.createNotification(notification);
  }

  static async notifyNewConversation(conversationData: any): Promise<void> {
    const notification: NotificationData = {
      type: 'conversation',
      title: 'Nouvelle conversation chatbot',
      message: `Nouvelle conversation démarrée avec ${conversationData.userName}`,
      data: conversationData
    };

    await this.createNotification(notification);
  }

  // Method to get recent notifications (for dashboard)
  static async getRecentNotifications(limit: number = 10): Promise<any[]> {
    try {
      // This would query a notifications table
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting recent notifications:', error);
      return [];
    }
  }
}