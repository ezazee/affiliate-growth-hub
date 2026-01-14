/**
 * Fungsi untuk mengambil nomor WhatsApp admin dari settings
 * @returns Promise<string> - Nomor WhatsApp admin dalam format 628xxxxxxxxxx
 */
export async function getAdminWhatsApp(): Promise<string> {
  try {
    const response = await fetch('/api/admin/settings');
    if (!response.ok) {
      // Fallback ke nomor default jika API gagal
      return '6281313711180';
    }
    const data = await response.json();
    return data.adminWhatsApp || '6281313711180';
  } catch (error) {
    console.error('Error fetching admin WhatsApp:', error);
    // Fallback ke nomor default
    return '6281313711180';
  }
}

/**
 * Fungsi untuk membuat link WhatsApp
 * @param phoneNumber - Nomor telepon dalam format 628xxxxxxxxxx
 * @param message - Pesan yang akan dikirim (opsional)
 * @returns string - Link WhatsApp URL
 */
export function createWhatsAppLink(phoneNumber: string, message?: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}