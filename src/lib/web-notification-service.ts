

import { WebNotification } from '@/types/notifications';

class WebNotificationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  async triggerNotification(notification: Omit<WebNotification, 'id' | 'timestamp' | 'read'>, targetUserEmail?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/web/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification,
          targetUserEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error triggering web notification:', error);
      throw error;
    }
  }

  // Admin Notifications
  async notifyNewAffiliate(name: string, email: string) {
    return this.triggerNotification({
      title: '👋 Affiliator Baru Mendaftar!',
      message: `${name} (${email}) baru saja mendaftar sebagai affiliator.`,
      type: 'info',
      url: '/admin/affiliators',
      actionUrl: '/admin/affiliators',
    });
  }

  async notifyNewOrderAdmin(orderId: string, amount: string, customerName: string) {
    return this.triggerNotification({
      title: '🛒 Pesanan Baru!',
      message: `Pesanan #${orderId} dari ${customerName} dengan total ${amount}`,
      type: 'info',
      url: '/admin/orders',
      actionUrl: '/admin/orders',
    });
  }

  async notifyWithdrawalRequest(name: string, amount: string) {
    return this.triggerNotification({
      title: '💰 Permohonan Penarikan Dana',
      message: `${name} mengajukan penarikan sebesar ${amount}`,
      type: 'warning',
      url: '/admin/withdrawals',
      actionUrl: '/admin/withdrawals',
    });
  }

  // Affiliator Notifications
  async notifyNewOrderAffiliate(orderId: string, customerName: string, commission: string, targetUserEmail?: string) {
    return this.triggerNotification({
      title: '🛒 Pesanan Baru!',
      message: `Pesanan #${orderId} dari ${customerName}. Komisi: ${commission}`,
      type: 'success',
      url: '/affiliator/commissions',
      actionUrl: '/affiliator/commissions',
    }, targetUserEmail);
  }

  async notifyOrderShipped(orderId: string, customerName: string, targetUserEmail?: string) {
    return this.triggerNotification({
      title: '📦 Pesanan Dikirim',
      message: `Pesanan #${orderId} untuk ${customerName} telah dikirim`,
      type: 'info',
      url: '/affiliator/commissions',
      actionUrl: '/affiliator/commissions',
    }, targetUserEmail);
  }

  async notifyOrderCompleted(orderId: string, customerName: string, targetUserEmail?: string) {
    return this.triggerNotification({
      title: '✅ Pesanan Selesai',
      message: `Pesanan #${orderId} untuk ${customerName} telah selesai. Komisi telah ditambahkan!`,
      type: 'success',
      url: '/affiliator/commissions',
      actionUrl: '/affiliator/commissions',
    }, targetUserEmail);
  }

  async notifyCommissionEarned(amount: string, orderId: string, targetUserEmail?: string) {
    return this.triggerNotification({
      title: '💵 Pemasukan Komisi!',
      message: `Komisi sebesar ${amount} dari pesanan #${orderId} telah ditambahkan ke akun Anda`,
      type: 'success',
      url: '/affiliator/commissions',
      actionUrl: '/affiliator/commissions',
    }, targetUserEmail);
  }

  async notifyBalanceUpdated(availableBalance: string, targetUserEmail?: string) {
    return this.triggerNotification({
      title: '💰 Saldo Dapat Ditarik Diperbarui',
      message: `Saldo yang dapat ditarik: ${availableBalance}`,
      type: 'info',
      url: '/affiliator',
      actionUrl: '/affiliator',
    }, targetUserEmail);
  }

  async notifyWithdrawalApproved(amount: string, processedAt: string, targetUserEmail?: string) {
    return this.triggerNotification({
      title: '✅ Penarikan Disetujui',
      message: `Penarikan sebesar ${amount} telah disetujui pada ${processedAt}`,
      type: 'success',
      url: '/affiliator',
      actionUrl: '/affiliator',
    }, targetUserEmail);
  }

  async notifyWithdrawalRejected(amount: string, reason: string, targetUserEmail?: string) {
    return this.triggerNotification({
      title: '❌ Penarikan Ditolak',
      message: `Penarikan sebesar ${amount} ditolak. Alasan: ${reason}`,
      type: 'error',
      url: '/affiliator',
      actionUrl: '/affiliator',
    }, targetUserEmail);
  }
}

export const webNotificationService = new WebNotificationService();