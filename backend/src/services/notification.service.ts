import { prisma } from "../models/prisma";

export interface CreateNotificationInput {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  contractorId?: string;
}

export class NotificationService {
  /**
   * Create a new notification.
   * Fails safely so as not to break parent governance workflows.
   */
  public static async create(data: CreateNotificationInput) {
    try {
      return await prisma.notification.create({
        data: {
          recipientId: data.recipientId,
          type: data.type,
          title: data.title,
          message: data.message,
          resourceType: data.resourceType || null,
          resourceId: data.resourceId || null,
          contractorId: data.contractorId || null,
        },
      });
    } catch (error) {
      console.error(`[NotificationService] Failed to create notification for user ${data.recipientId}:`, error);
      return null;
    }
  }

  /**
   * List notifications for a specific user
   */
  public static async listForUser(userId: string) {
    return await prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get unread notification count for user
   */
  public static async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });
  }

  /**
   * Mark a notification as read
   */
  public static async markAsRead(notificationId: string, userId: string) {
    // Ensure the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.recipientId !== userId) {
      return null; // Not found or not authorized
    }

    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for a specific user
   */
  public static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
  }
}
